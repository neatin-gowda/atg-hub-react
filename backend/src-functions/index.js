/* ================================================================
   ATG-EMP-HUB — API Endpoints
   REUSED: register, login, me, me/stats, announcements, kudos, health
   ADDED: POST /feedback, POST /activity, GET /feedback
================================================================ */
const { app } = require('@azure/functions');
const {
  getContainers, issueToken, getAuthUser, hashPassword, comparePassword,
  publicUser, isAdminEmail, structuredLog, uuid,
  ok, created, badRequest, unauthorized, forbidden, notFound, serverError,
} = require('./shared');

/* ====== POST /api/auth/register (REUSED) ====== */
app.http('register', {
  methods: ['POST'], authLevel: 'anonymous', route: 'auth/register',
  handler: async (request, context) => {
    try {
      const body = await request.json().catch(() => ({}));
      const { name, email, role, password } = body;
      if (!name || !email || !role || !password) return badRequest('All fields are required.');
      if (password.length < 8) return badRequest('Password must be at least 8 characters.');
      if (!/^\S+@\S+\.\S+$/.test(email)) return badRequest('Please enter a valid email.');

      const { users } = await getContainers();
      const emailLower = email.toLowerCase();
      const { resources: existing } = await users.items.query({
        query: 'SELECT TOP 1 c.id FROM c WHERE c.email = @email',
        parameters: [{ name: '@email', value: emailLower }],
      }).fetchAll();
      if (existing.length > 0) return badRequest('An account with this email already exists.');

      const id = uuid(); const now = new Date().toISOString();
      const user = {
        id, email: emailLower, name: name.trim(), role: role.trim(),
        location: '', bio: '', password_hash: await hashPassword(password),
        isAdmin: isAdminEmail(emailLower), created_at: now, updated_at: now,
      };
      await users.items.create(user);
      structuredLog(context, 'info', 'User registered', { email: emailLower, userId: id });
      return created({ user: publicUser(user), token: issueToken(user) });
    } catch (err) { structuredLog(context, 'error', 'Register failed', { error: err.message }); return serverError('Could not create account.'); }
  },
});

/* ====== POST /api/auth/login (REUSED) ====== */
app.http('login', {
  methods: ['POST'], authLevel: 'anonymous', route: 'auth/login',
  handler: async (request, context) => {
    try {
      const { email, password } = await request.json().catch(() => ({}));
      if (!email || !password) return badRequest('Email and password are required.');
      const { users } = await getContainers();
      const { resources } = await users.items.query({
        query: 'SELECT TOP 1 * FROM c WHERE c.email = @email',
        parameters: [{ name: '@email', value: email.toLowerCase() }],
      }).fetchAll();
      if (resources.length === 0) return unauthorized('Invalid email or password.');
      const user = resources[0];
      if (!await comparePassword(password, user.password_hash || '')) return unauthorized('Invalid email or password.');
      structuredLog(context, 'info', 'User login', { userId: user.id });
      return ok({ user: publicUser(user), token: issueToken(user) });
    } catch (err) { structuredLog(context, 'error', 'Login failed', { error: err.message }); return serverError('Could not sign in.'); }
  },
});

/* ====== GET /api/me (REUSED) ====== */
app.http('me-get', {
  methods: ['GET'], authLevel: 'anonymous', route: 'me',
  handler: async (request, context) => {
    try {
      const auth = getAuthUser(request); if (!auth) return unauthorized();
      const { users } = await getContainers();
      const { resource } = await users.item(auth.uid, auth.uid).read();
      if (!resource) return notFound('User not found.');
      return ok({ user: publicUser(resource) });
    } catch (err) { return serverError(); }
  },
});

/* ====== PATCH /api/me (REUSED) ====== */
app.http('me-update', {
  methods: ['PATCH'], authLevel: 'anonymous', route: 'me',
  handler: async (request, context) => {
    try {
      const auth = getAuthUser(request); if (!auth) return unauthorized();
      const body = await request.json().catch(() => ({}));
      const { users } = await getContainers();
      const { resource: user } = await users.item(auth.uid, auth.uid).read();
      if (!user) return notFound();
      const allowed = ['name', 'role', 'location', 'bio'];
      for (const key of allowed) {
        if (typeof body[key] === 'string') user[key] = body[key].trim().slice(0, key === 'bio' ? 500 : 120);
      }
      user.updated_at = new Date().toISOString();
      const { resource: updated } = await users.item(auth.uid, auth.uid).replace(user);
      structuredLog(context, 'info', 'Profile updated', { userId: auth.uid });
      return ok({ user: publicUser(updated) });
    } catch (err) { return serverError('Could not update profile.'); }
  },
});

/* ====== GET /api/me/stats (REUSED) ====== */
app.http('me-stats', {
  methods: ['GET'], authLevel: 'anonymous', route: 'me/stats',
  handler: async (request) => {
    try {
      const auth = getAuthUser(request); if (!auth) return unauthorized();
      const { kudos } = await getContainers();
      const given = await kudos.items.query({ query: 'SELECT VALUE COUNT(1) FROM c WHERE c.from_user_id = @uid', parameters: [{ name: '@uid', value: auth.uid }] }).fetchAll();
      const received = await kudos.items.query({ query: 'SELECT VALUE COUNT(1) FROM c WHERE c.to_user_id = @uid', parameters: [{ name: '@uid', value: auth.uid }] }, { partitionKey: auth.uid }).fetchAll();
      return ok({ given: given.resources[0] || 0, received: received.resources[0] || 0, rank: null });
    } catch { return ok({ given: 0, received: 0, rank: null }); }
  },
});

/* ====== GET/POST /api/announcements (REUSED) ====== */
app.http('announcements-list', {
  methods: ['GET'], authLevel: 'anonymous', route: 'announcements',
  handler: async (request) => {
    try {
      const auth = getAuthUser(request); if (!auth) return unauthorized();
      const { announcements } = await getContainers();
      const { resources } = await announcements.items.query({ query: 'SELECT TOP 20 * FROM c WHERE c.type = "announcement" ORDER BY c.created_at DESC' }).fetchAll();
      return ok(resources);
    } catch { return ok([]); }
  },
});

app.http('announcements-create', {
  methods: ['POST'], authLevel: 'anonymous', route: 'announcements',
  handler: async (request, context) => {
    try {
      const auth = getAuthUser(request); if (!auth) return unauthorized();
      if (!auth.isAdmin) return forbidden('Only admins can post announcements.');
      const body = await request.json().catch(() => ({}));
      const { category, title, body: ab } = body;
      if (!category || !title || !ab) return badRequest('Category, title, and body are required.');
      const { users, announcements } = await getContainers();
      const { resource: author } = await users.item(auth.uid, auth.uid).read();
      const doc = {
        id: uuid(), type: 'announcement',
        category: String(category).trim().slice(0, 50),
        title: String(title).trim().slice(0, 120),
        body: String(ab).trim().slice(0, 500),
        author_id: auth.uid, author_name: author ? author.name : 'Admin',
        created_at: new Date().toISOString(),
      };
      await announcements.items.create(doc);
      structuredLog(context, 'info', 'Announcement posted', { userId: auth.uid, announcementId: doc.id });
      return created(doc);
    } catch (err) { return serverError('Could not publish.'); }
  },
});

/* ====== GET/POST /api/kudos (REUSED) ====== */
app.http('kudos-list', {
  methods: ['GET'], authLevel: 'anonymous', route: 'kudos',
  handler: async (request) => {
    try {
      const auth = getAuthUser(request); if (!auth) return unauthorized();
      const { kudos } = await getContainers();
      const { resources } = await kudos.items.query({ query: 'SELECT TOP 20 * FROM c ORDER BY c.created_at DESC' }).fetchAll();
      return ok(resources);
    } catch { return ok([]); }
  },
});

app.http('kudos-create', {
  methods: ['POST'], authLevel: 'anonymous', route: 'kudos',
  handler: async (request, context) => {
    try {
      const auth = getAuthUser(request); if (!auth) return unauthorized();
      const { recipient, message } = await request.json().catch(() => ({}));
      if (!recipient || !message) return badRequest('Recipient and message are required.');
      if (String(message).trim().length < 10) return badRequest('Message too short.');
      const { users, kudos } = await getContainers();
      const { resource: fromUser } = await users.item(auth.uid, auth.uid).read();
      const { resources: match } = await users.items.query({
        query: 'SELECT TOP 1 c.id, c.name FROM c WHERE LOWER(c.name) = @n OR LOWER(c.email) = @n',
        parameters: [{ name: '@n', value: String(recipient).trim().toLowerCase() }],
      }).fetchAll();
      const toUserId = match.length > 0 ? match[0].id : `ghost-${String(recipient).trim().toLowerCase().replace(/\s+/g, '-')}`;
      const doc = {
        id: uuid(), from_user_id: auth.uid,
        from_name: fromUser ? fromUser.name : 'Colleague',
        to_user_id: toUserId, to_name: match.length > 0 ? match[0].name : String(recipient).trim(),
        message: String(message).trim().slice(0, 280), created_at: new Date().toISOString(),
      };
      await kudos.items.create(doc);
      structuredLog(context, 'info', 'Kudos sent', { from: auth.uid, to: toUserId });
      return created(doc);
    } catch (err) { return serverError('Could not send kudos.'); }
  },
});

/* ====== POST /api/feedback (NEW) ====== */
app.http('feedback-create', {
  methods: ['POST'], authLevel: 'anonymous', route: 'feedback',
  handler: async (request, context) => {
    try {
      const auth = getAuthUser(request); if (!auth) return unauthorized();
      const { text } = await request.json().catch(() => ({}));
      if (!text || String(text).trim().length < 10) return badRequest('Feedback must be at least 10 characters.');
      const { feedback } = await getContainers();
      const doc = {
        id: uuid(), user_id: auth.uid, text: String(text).trim().slice(0, 1000),
        created_at: new Date().toISOString(),
      };
      await feedback.items.create(doc);
      structuredLog(context, 'info', 'Feedback submitted', { userId: auth.uid });
      return created(doc);
    } catch (err) { return serverError('Could not submit feedback.'); }
  },
});

/* ====== POST /api/activity (NEW — audit log ingestion) ====== */
app.http('activity-log', {
  methods: ['POST'], authLevel: 'anonymous', route: 'activity',
  handler: async (request, context) => {
    try {
      const auth = getAuthUser(request); if (!auth) return unauthorized();
      const { events } = await request.json().catch(() => ({}));
      if (!events || !Array.isArray(events)) return badRequest('Events array required.');
      const { activityLogs } = await getContainers();
      const now = new Date().toISOString();
      const batch = events.slice(0, 20).map(e => ({
        id: uuid(), userId: auth.uid,
        action: String(e.action || 'unknown').slice(0, 50),
        detail: e.detail || {}, page: String(e.page || '').slice(0, 50),
        clientTimestamp: e.timestamp || now, serverTimestamp: now,
      }));
      for (const doc of batch) { await activityLogs.items.create(doc); }
      structuredLog(context, 'info', `Activity logged: ${batch.length} events`, { userId: auth.uid });
      return ok({ logged: batch.length });
    } catch (err) { return serverError('Could not log activity.'); }
  },
});

/* ====== GET /api/config — public app config from env vars ====== */
app.http('config', {
  methods: ['GET'], authLevel: 'anonymous', route: 'config',
  handler: async () => ok({
    companyName: process.env.APP_COMPANY_NAME || 'ATG',
    appName: process.env.APP_NAME || 'Hub',
    tagline: process.env.APP_TAGLINE || 'AI-Powered Employee Workspace',
    hrPhoneNumber: process.env.APP_HR_PHONE || 'tel:+97140000000',
  }),
});

/* ====== GET /api/health (REUSED) ====== */
app.http('health', {
  methods: ['GET'], authLevel: 'anonymous', route: 'health',
  handler: async () => ok({ status: 'ok', version: '1.0.0', time: new Date().toISOString() }),
});
