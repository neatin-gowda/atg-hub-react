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

/* ====== Talk to ATLAS — orchestration + realtime voice configuration ====== */
const MYHR_DEFAULT_SYSTEM_PROMPT = `You are Talk to ATLAS, the orchestration agent inside the ATLAS employee engagement app.
You can answer questions, route to specialist agents, and guide users across Leave, Kudos, MyHR, IT, Finance, Knowledge Base, Profile, and other ATLAS modules.
Use the supplied grounding context first. Be warm, concise, futuristic, and action oriented.
Do not invent private employee data, balances, payroll amounts, or approvals. If an action affects records, draft and explain the next step unless the user request is explicit and the backend tool supports it.
When another specialist is better, say which agent should handle it and why.`;

const MYHR_DEFAULT_GROUNDING_CONTEXT = `Approved MyHR scope:
- Company policies, WFH/WFA, working hours, leave, benefits, insurance, payroll, onboarding, learning, wellbeing, workplace support, and escalation guidance.
- ATLAS app map: Leave Management at /leave, Kudos at /kudos/give, app directory at /apps, profile at /profile, Talk to ATLAS/MyHR voice at /app/hr-voice.
- If policy context is missing, give a helpful next step and recommend HR confirmation for official decisions.`;

function cleanText(value, max = 12000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function getMyHrInstructions() {
  const prompt = cleanText(process.env.MYHR_SYSTEM_PROMPT || MYHR_DEFAULT_SYSTEM_PROMPT, 8000);
  const grounding = cleanText(process.env.MYHR_GROUNDING_CONTEXT || MYHR_DEFAULT_GROUNDING_CONTEXT, 20000);
  return `${prompt}\n\nGrounding context:\n${grounding}`;
}

function fallbackMyHrReply(message) {
  const text = cleanText(message, 2000).toLowerCase();
  if (text.includes('leave') || text.includes('vacation') || text.includes('annual')) {
    return 'For leave, you can check your balance and submit requests from the Leave tile. Annual leave guidance depends on your country, role, and current balance, so MyHR can explain the process but HR should confirm exceptions.';
  }
  if (text.includes('pay') || text.includes('salary') || text.includes('payroll')) {
    return 'For payroll questions, check the Salary or payroll tile first. If you are asking about a missing payment, payslip, or deduction, share the pay period and HR/payroll can investigate securely.';
  }
  if (text.includes('benefit') || text.includes('insurance') || text.includes('medical')) {
    return 'Benefits and insurance details can vary by plan and location. I can summarize the approved policy context here, and for dependants, claims, or coverage exceptions, HR Benefits should confirm the final answer.';
  }
  if (text.includes('onboard') || text.includes('joining') || text.includes('new joiner')) {
    return 'For onboarding, MyHR can help with document collection, buddy assignment, IT setup, policy orientation, and first-week guidance. Tell me where you are stuck and I will guide the next step.';
  }
  return 'I can help as Talk to ATLAS: answer questions, open apps, hand off to MyHR, IT, Finance, or Knowledge agents, and guide safe actions across the employee hub.';
}

function buildMyHrMessages(message, history) {
  return [
    { role: 'system', content: getMyHrInstructions() },
    ...history.map((item) => ({
      role: item.from === 'user' ? 'user' : 'assistant',
      content: cleanText(item.text, 1200),
    })).filter((item) => item.content),
    { role: 'user', content: cleanText(message, 2000) },
  ];
}

function extractResponseText(data) {
  if (data?.output_text) return data.output_text;
  const parts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && content?.text) parts.push(content.text);
      if (content?.text && typeof content.text === 'string') parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

async function callOpenAIResponses({ message, history }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const model = process.env.MYHR_CHAT_MODEL || 'gpt-4.1-mini';
  const input = buildMyHrMessages(message, history).filter((item) => item.role !== 'system');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      instructions: getMyHrInstructions(),
      input,
      temperature: 0.35,
      max_output_tokens: 700,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message || `OpenAI Responses failed with ${response.status}`;
    throw new Error(detail);
  }

  return { reply: extractResponseText(data), model };
}

app.http('myhr-agent-chat', {
  methods: ['POST'], authLevel: 'anonymous', route: 'agents/hr-voice/chat',
  handler: async (request, context) => {
    try {
      const auth = getAuthUser(request); if (!auth) return unauthorized();
      const body = await request.json().catch(() => ({}));
      const message = cleanText(body.message, 2000);
      const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
      if (!message) return badRequest('Message is required.');

      const azureReply = await callAzureOpenAI(buildMyHrMessages(message, history));
      const llm = azureReply ? { reply: azureReply, model: process.env.AZURE_OPENAI_DEPLOYMENT || null } : await callOpenAIResponses({ message, history });
      const reply = llm?.reply || fallbackMyHrReply(message);
      const source = azureReply ? 'azure-openai' : llm?.reply ? 'openai-responses' : 'fallback';

      structuredLog(context, 'info', 'MyHR chat answered', { userId: auth.uid, source, model: llm?.model || null });
      return ok({ reply, source, model: llm?.model || null });
    } catch (err) {
      structuredLog(context, 'error', 'MyHR chat failed', { error: err.message });
      return ok({ reply: fallbackMyHrReply(''), source: 'fallback', error: 'MyHR live model is unavailable right now.' });
    }
  },
});

app.http('myhr-realtime-session', {
  methods: ['POST'], authLevel: 'anonymous', route: 'agents/hr-voice/realtime-session',
  handler: async (request, context) => {
    try {
      const auth = getAuthUser(request); if (!auth) return unauthorized();
      const body = await request.json().catch(() => ({}));
      const provider = (process.env.MYHR_REALTIME_PROVIDER || 'azure-openai').toLowerCase();
      const azureEndpoint = (process.env.AZURE_OPENAI_REALTIME_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/+$/, '');
      const azureKey = process.env.AZURE_OPENAI_REALTIME_API_KEY || process.env.AZURE_OPENAI_API_KEY;
      const useAzure = provider !== 'openai' && azureEndpoint && azureKey;
      if (body.probe) return ok({ configured: !!(useAzure || process.env.OPENAI_API_KEY), provider: useAzure ? 'azure-openai' : 'openai' });
      const key = useAzure ? azureKey : process.env.OPENAI_API_KEY;
      if (!key) return ok({ configured: false, reason: useAzure ? 'Azure OpenAI realtime key is not configured.' : 'OPENAI_API_KEY is not configured.' });

      const clientSecretUrl = useAzure
        ? `${azureEndpoint}/openai/v1/realtime/client_secrets`
        : 'https://api.openai.com/v1/realtime/client_secrets';
      const rtcUrl = useAzure
        ? `${azureEndpoint}/openai/v1/realtime/calls`
        : 'https://api.openai.com/v1/realtime/calls';
      const response = await fetch(clientSecretUrl, {
        method: 'POST',
        headers: useAzure
          ? { 'Content-Type': 'application/json', 'api-key': key }
          : { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          session: {
            type: 'realtime',
            model: process.env.AZURE_OPENAI_REALTIME_DEPLOYMENT || process.env.MYHR_REALTIME_MODEL || 'gpt-realtime',
            instructions: getMyHrInstructions(),
            audio: { output: { voice: process.env.MYHR_REALTIME_VOICE || 'marin' } },
          },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = data?.error?.message || `Realtime client secret failed with ${response.status}`;
        throw new Error(detail);
      }

      structuredLog(context, 'info', 'ATLAS realtime client secret created', { userId: auth.uid, provider: useAzure ? 'azure-openai' : 'openai' });
      return ok({ configured: true, provider: useAzure ? 'azure-openai' : 'openai', rtcUrl, ...data });
    } catch (err) {
      structuredLog(context, 'error', 'MyHR realtime session failed', { error: err.message });
      return ok({ configured: false, reason: 'Realtime voice is unavailable right now.' });
    }
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
    myHrChatModel: process.env.MYHR_CHAT_MODEL || 'gpt-4.1-mini',
    myHrRealtimeProvider: process.env.MYHR_REALTIME_PROVIDER || 'azure-openai',
    myHrRealtimeModel: process.env.MYHR_REALTIME_MODEL || 'gpt-realtime',
    myHrRealtimeVoice: process.env.MYHR_REALTIME_VOICE || 'marin',
    myHrVoiceLanguage: process.env.MYHR_VOICE_LANGUAGE || 'en-US',
  }),
});

/* ====== AT MOTORS - document context + LLM concierge ====== */
const AT_MOTORS_SYSTEM_PROMPT = `You are the AT MOTORS luxury automotive AI concierge.
Represent a premium showroom with Ferrari, Ford performance, and Maserati vehicles.
Use the supplied showroom context first. If context is missing, be transparent and give a helpful next step.
Keep answers polished, concise, and sales-useful. When comparison is requested, compare performance,
comfort, ownership fit, budget tier, and appointment next step. Never invent exact inventory availability.`;

function trimText(value, max = 16000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function fallbackAtMotorsReply(message, contextText) {
  const text = String(message || '').toLowerCase();
  if (text.includes('book') || text.includes('viewing') || text.includes('test')) {
    return 'I can help arrange a private viewing. Share your preferred date, model shortlist, and contact details, and AT MOTORS can prepare the right Ferrari, Ford, or Maserati experience.';
  }
  if (text.includes('finance') || text.includes('payment')) {
    return 'For finance, Ford performance models are typically the most accessible, Maserati sits in the premium grand touring tier, and Ferrari is best handled through a bespoke ownership consultation.';
  }
  if (text.includes('compare') || text.includes('ferrari') || text.includes('maserati') || text.includes('ford')) {
    return 'Ferrari is the emotional performance choice, Maserati is the refined luxury grand tourer, and Ford gives strong performance value. The best recommendation depends on whether you prioritize theatre, comfort, or daily usability.';
  }
  if (contextText) {
    return `I found showroom context for this question. The strongest next step is to compare your preferred driving style, budget tier, and viewing date against the available AT MOTORS notes.`;
  }
  return 'I can compare models, explain ownership fit, qualify budget, and help book a private viewing with AT MOTORS.';
}

async function callAzureOpenAI(messages) {
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/+$/, '');
  const key = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-21';
  if (!endpoint || !key || !deployment) return null;

  const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': key },
    body: JSON.stringify({
      messages,
      temperature: 0.45,
      max_tokens: 650,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message || `Azure OpenAI failed with ${response.status}`;
    throw new Error(detail);
  }
  return data?.choices?.[0]?.message?.content || null;
}

app.http('at-motors-documents-list', {
  methods: ['GET'], authLevel: 'anonymous', route: 'at-motors/documents',
  handler: async () => {
    try {
      const { atMotorsDocs } = await getContainers();
      const { resources } = await atMotorsDocs.items.query({
        query: 'SELECT TOP 30 c.id, c.name, c.created_at, c.char_count FROM c WHERE c.brand = "at-motors" ORDER BY c.created_at DESC',
      }).fetchAll();
      return ok({ documents: resources });
    } catch (err) {
      return serverError('Could not load AT MOTORS documents.');
    }
  },
});

app.http('at-motors-documents-create', {
  methods: ['POST'], authLevel: 'anonymous', route: 'at-motors/documents',
  handler: async (request, context) => {
    try {
      const body = await request.json().catch(() => ({}));
      const name = trimText(body.name, 120);
      const content = trimText(body.content, 24000);
      if (!name || !content || content.length < 20) return badRequest('Document name and at least 20 characters of text are required.');

      const { atMotorsDocs } = await getContainers();
      const doc = {
        id: uuid(),
        brand: 'at-motors',
        name,
        content,
        char_count: content.length,
        created_at: new Date().toISOString(),
      };
      await atMotorsDocs.items.create(doc);
      structuredLog(context, 'info', 'AT MOTORS document saved', { documentId: doc.id, name });
      return created({ document: { id: doc.id, name: doc.name, created_at: doc.created_at, char_count: doc.char_count } });
    } catch (err) {
      structuredLog(context, 'error', 'AT MOTORS document save failed', { error: err.message });
      return serverError('Could not save AT MOTORS document.');
    }
  },
});

app.http('at-motors-chat', {
  methods: ['POST'], authLevel: 'anonymous', route: 'at-motors/chat',
  handler: async (request, context) => {
    try {
      const body = await request.json().catch(() => ({}));
      const message = trimText(body.message, 2000);
      const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
      if (!message) return badRequest('Message is required.');

      const { atMotorsDocs } = await getContainers();
      const { resources: docs } = await atMotorsDocs.items.query({
        query: 'SELECT TOP 6 c.name, c.content FROM c WHERE c.brand = "at-motors" ORDER BY c.created_at DESC',
      }).fetchAll();

      const contextText = docs.map((doc, index) => `[Document ${index + 1}: ${doc.name}]\n${trimText(doc.content, 4500)}`).join('\n\n');
      const messages = [
        { role: 'system', content: AT_MOTORS_SYSTEM_PROMPT },
        { role: 'system', content: contextText ? `Showroom context:\n${contextText}` : 'No uploaded showroom context is available yet.' },
        ...history.map((item) => ({
          role: item.from === 'user' ? 'user' : 'assistant',
          content: trimText(item.text, 1200),
        })).filter((item) => item.content),
        { role: 'user', content: message },
      ];

      let reply = await callAzureOpenAI(messages);
      const source = reply ? 'azure-openai' : 'fallback';
      if (!reply) reply = fallbackAtMotorsReply(message, contextText);

      structuredLog(context, 'info', 'AT MOTORS chat answered', { source, docs: docs.length });
      return ok({ reply, source, documentsUsed: docs.map((doc) => doc.name) });
    } catch (err) {
      structuredLog(context, 'error', 'AT MOTORS chat failed', { error: err.message });
      return serverError('Could not answer with the AT MOTORS concierge.');
    }
  },
});

/* ====== GET /api/health (REUSED) ====== */
app.http('health', {
  methods: ['GET'], authLevel: 'anonymous', route: 'health',
  handler: async () => ok({ status: 'ok', version: '1.0.0', time: new Date().toISOString() }),
});
