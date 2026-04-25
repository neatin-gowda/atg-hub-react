/* ================================================================
   ATG-EMP-HUB — Shared Backend Module
   REUSED: Cosmos client, JWT, bcrypt, response helpers, publicUser
   CHANGED: added containers (feedback, activityLogs), structured
   logging helper, request tracing, App Insights hooks.
================================================================ */
const { CosmosClient } = require('@azure/cosmos');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT;
const COSMOS_KEY = process.env.COSMOS_KEY;
const COSMOS_DB = process.env.COSMOS_DB || 'atgemphub';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-in-production';
const JWT_EXPIRY = '7d';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

let _client = null;
let _containers = {};

async function getContainers() {
  if (_containers.users) return _containers;

  if (!COSMOS_ENDPOINT || !COSMOS_KEY) {
    throw new Error('Set COSMOS_ENDPOINT and COSMOS_KEY in app settings.');
  }

  _client = _client || new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY });
  const { database } = await _client.databases.createIfNotExists({ id: COSMOS_DB });

  const containers = ['users', 'announcements', 'kudos', 'feedback', 'activityLogs'];
  const partitionKeys = {
    users: '/id',
    announcements: '/type',
    kudos: '/to_user_id',
    feedback: '/user_id',
    activityLogs: '/userId',
  };

  for (const name of containers) {
    const { container } = await database.containers.createIfNotExists({
      id: name,
      partitionKey: { paths: [partitionKeys[name]] },
    });
    _containers[name] = container;
  }

  return _containers;
}

/* ============ AUTH ============ */
function issueToken(user) {
  return jwt.sign(
    { uid: user.id, email: user.email, isAdmin: !!user.isAdmin },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); }
  catch { return null; }
}

function getAuthUser(request) {
  const h = request.headers.get('authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  return verifyToken(m[1]);
}

async function hashPassword(plain) { return bcrypt.hash(plain, 10); }
async function comparePassword(plain, hash) { return bcrypt.compare(plain, hash); }

/* ============ RESPONSE HELPERS ============ */
function ok(body) { return { status: 200, jsonBody: body }; }
function created(body) { return { status: 201, jsonBody: body }; }
function badRequest(msg) { return { status: 400, jsonBody: { error: msg } }; }
function unauthorized(msg = 'Sign in required') { return { status: 401, jsonBody: { error: msg } }; }
function forbidden(msg = 'Forbidden') { return { status: 403, jsonBody: { error: msg } }; }
function notFound(msg = 'Not found') { return { status: 404, jsonBody: { error: msg } }; }
function serverError(msg = 'Something went wrong') { return { status: 500, jsonBody: { error: msg } }; }

/* ============ PROJECTIONS ============ */
function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id, email: u.email, name: u.name,
    role: u.role, location: u.location || '',
    bio: u.bio || '', isAdmin: !!u.isAdmin,
    created_at: u.created_at,
  };
}

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(String(email).toLowerCase());
}

/* ============ STRUCTURED LOGGING (NEW) ============ */
function structuredLog(context, level, message, data = {}) {
  const entry = {
    level,
    message,
    ...data,
    timestamp: new Date().toISOString(),
    invocationId: context.invocationId || 'unknown',
  };
  if (level === 'error') context.error(JSON.stringify(entry));
  else if (level === 'warn') context.warn(JSON.stringify(entry));
  else context.log(JSON.stringify(entry));
}

/* ============ UUID ============ */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

module.exports = {
  getContainers, issueToken, verifyToken, getAuthUser,
  hashPassword, comparePassword, publicUser, isAdminEmail,
  structuredLog, uuid,
  ok, created, badRequest, unauthorized, forbidden, notFound, serverError,
};
