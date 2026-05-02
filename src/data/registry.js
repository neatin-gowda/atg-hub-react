/* ================================================================
   ATLAS App Registry — Organized by module
   AI_AGENTS  → AI Hub section (agents only)
   HR_APPS    → HR Engagement section
   INTERNAL_APPS → Internal Apps section
================================================================ */

export const AI_AGENTS = [
  { id:'hr-voice', name:'MyHR AI Agent', icon:'voice', type:'voice', status:'live', tags:['AI-powered','Live'], desc:'Policies, benefits, leave & payroll support', tagline:'Chat, in-app voice, or call for instant help with HR policies, benefits, leave, and more.', img:'/assets/images/hero/carousel-5-hr-agent.jpg', features:[{t:'Company policies',d:'WFH, WFA, dress code, working hours.'},{t:'Benefits & insurance',d:'Medical, dental, vision, dependants.'},{t:'Leave balances',d:'Annual, sick, personal leave.'},{t:'Payroll queries',d:'Salary status, pay slips.'},{t:'Onboarding help',d:'New joiner setup, buddy program.'},{t:'Workplace support',d:'Grievance, EAP referrals.'}], api:'POST /api/agents/hr-voice/chat', payload:'{ "message": "..." }' },
  { id:'finops-agent', name:'FinOps AI Agent', icon:'finops', type:'agent', status:'live', tags:['AI-powered','Live'], desc:'Cloud cost, utilisation & spend prediction', tagline:'AI-powered cloud financial management — Azure, AWS cost analysis.', img:'/assets/images/hero/carousel-3-ai-news.jpg', features:[{t:'Azure cost analysis',d:'Real-time spend by subscription.'},{t:'AWS cost tracking',d:'Cross-cloud cost comparison.'},{t:'Token utilisation',d:'AI/LLM token tracking.'},{t:'Cost prediction',d:'ML-based forecasting.'},{t:'Optimisation tips',d:'Right-sizing, reserved instances.'},{t:'Budget alerts',d:'Proactive spend notifications.'}], api:'POST /api/agents/finops/query', payload:'{ "query": "Azure spend?" }' },
  { id:'contract-agent', name:'Contract AI Agent', icon:'contract', type:'agent', status:'live', tags:['AI-powered','Live'], desc:'Review, summarise, extract clauses', tagline:'Upload contracts. Get summaries, risk flags, clause extraction.', img:'/assets/images/hero/carousel-2-cowork.jpg', features:[{t:'Summary',d:'1-page summary in seconds.'},{t:'Clause extraction',d:'Termination, liability, IP.'},{t:'Risk scoring',d:'AI flags high-risk terms.'}], api:'POST /api/agents/contract/analyze', payload:'{ "action": "summarize" }' },
  { id:'it-agent', name:'IT Service Desk Agent', icon:'it', type:'agent', status:'live', tags:['AI-powered','Live'], desc:'Resolve IT issues, passwords, access', tagline:'AI-first IT support — resolves 80% of tickets automatically.', img:'/assets/images/hero/carousel-1-copilot.jpg', features:[{t:'Password reset',d:'Self-service with MFA.'},{t:'Access requests',d:'Auto-routed approval.'},{t:'Troubleshooting',d:'VPN, email, printer fixes.'}], api:'POST /api/agents/it/ticket', payload:'{ "issue": "VPN not connecting" }' },
  { id:'finance-agent', name:'Finance AI Agent', icon:'finance', type:'agent', status:'beta', tags:['AI-powered','Beta'], desc:'Expenses, budgets, invoices', tagline:'Ask about budgets, expenses, invoices — no spreadsheets.', img:'/assets/images/hero/carousel-3-ai-news.jpg', features:[{t:'Expense lookup',d:'Reimbursement status.'},{t:'Budget dashboard',d:'Spend vs budget.'},{t:'Invoice tracker',d:'End-to-end tracking.'}], api:'POST /api/agents/finance/query', payload:'{ "query": "Budget remaining?" }' },
  { id:'knowledge-base', name:'Knowledge Base', icon:'knowledge', type:'agent', status:'live', tags:['AI-powered','Live'], desc:'AI search across all docs', tagline:'One search across every doc — powered by AI.', img:'/assets/images/hero/carousel-1-copilot.jpg', features:[{t:'Semantic search',d:'Questions, not keywords.'},{t:'Citations',d:'Cites the source.'},{t:'Multi-source',d:'SharePoint, Confluence, Drive.'}], api:'POST /api/agents/knowledge/search', payload:'{ "query": "GDPR?" }' },
];

export const HR_APPS = [
  { id:'leave-mgmt', name:'Leave Management', icon:'leave', type:'hr', status:'live', tags:['HR','Live'], desc:'Apply, track & approve leave requests', tagline:'Complete leave management — balances, requests, approvals.', img:'/assets/images/hero/carousel-4-wellness.jpg', features:[{t:'Leave balance',d:'Real-time PTO, sick, annual balances.'},{t:'Apply leave',d:'Submit requests with type and dates.'},{t:'Manager approvals',d:'Approve or decline team requests.'}], api:'GET /api/hr/leave', payload:'{ "userId": "..." }' },
  { id:'salary-status', name:'Salary & Payroll', icon:'salary', type:'hr', status:'live', tags:['HR','Live'], desc:'Payroll status, pay slips & tax docs', tagline:'Track salary processing, download pay slips, access tax documents.', img:'/assets/images/hero/carousel-2-cowork.jpg', features:[{t:'Salary status',d:'Monthly processing updates.'},{t:'Pay slips',d:'Download current and past slips.'},{t:'Tax documents',d:'Annual tax certificates.'}], api:'GET /api/hr/salary', payload:'{ "userId": "..." }' },
  { id:'benefits-portal', name:'Benefits Portal', icon:'benefits', type:'hr', status:'live', tags:['HR','Live'], desc:'Medical, dental, insurance & claims', tagline:'Manage your benefits — insurance cards, claims, dependants.', img:'/assets/images/hero/carousel-5-hr-agent.jpg', features:[{t:'Insurance cards',d:'View and share your medical cards.'},{t:'Submit claims',d:'Upload receipts, track reimbursements.'},{t:'Dependants',d:'Add or update family members.'}], api:'GET /api/hr/benefits', payload:'{ "userId": "..." }' },
  { id:'employee-handbook', name:'Employee Handbook', icon:'handbook', type:'hr', status:'live', tags:['HR','Live'], desc:'Policies, code of conduct & guidelines', tagline:'All company policies and guidelines in one place.', img:'/assets/images/hero/carousel-1-copilot.jpg', features:[{t:'Policies',d:'WFH, WFA, dress code, working hours.'},{t:'Code of conduct',d:'Ethics, compliance, reporting.'},{t:'Guidelines',d:'Travel, expenses, IT security.'}], api:'GET /api/hr/handbook', payload:'{}' },
];

export const INTERNAL_APPS = [
  { id:'onboarding', name:'Onboarding Portal', icon:'onboard', type:'app', status:'live', tags:['Internal','Live'], desc:'New joiner checklist & guides', tagline:'Everything a new joiner needs.', img:'/assets/images/hero/carousel-2-cowork.jpg', features:[{t:'Checklist',d:'Step-by-step setup.'},{t:'Buddy matching',d:'Auto-paired 30 days.'},{t:'Calendar',d:'Pre-populated schedule.'}], api:'GET /api/apps/onboarding/checklist', payload:'{ "userId": "..." }' },
  { id:'data-platform', name:'Data & Analytics', icon:'data', type:'app', status:'live', tags:['Internal','Live'], desc:'Self-service dashboards', tagline:'Build dashboards without SQL.', img:'/assets/images/hero/carousel-3-ai-news.jpg', features:[{t:'Drag-and-drop',d:'Chart builder.'},{t:'Data catalogue',d:'Browse datasets.'},{t:'Reports',d:'Auto-email.'}], api:'GET /api/apps/data/dashboards', payload:'{ "teamId": "..." }' },
  { id:'recognition', name:'Peer Recognition', icon:'kudos', type:'app', status:'live', tags:['Engagement','Live'], desc:'Kudos, points, rewards', tagline:'Recognition that feels real.', img:'/assets/images/hero/carousel-4-wellness.jpg', features:[{t:'Kudos',d:'Recognise anyone.'},{t:'Marketplace',d:'Redeem rewards.'},{t:'Leaderboards',d:'Rankings.'}], api:'POST /api/kudos', payload:'{ "recipient": "...", "message": "..." }' },
  { id:'learning-hub', name:'Learning Hub', icon:'learning', type:'app', status:'live', tags:['Internal','Live'], desc:'Courses, certifications & training', tagline:'LinkedIn Learning, Coursera, and internal masterclasses.', img:'/assets/images/hero/carousel-1-copilot.jpg', features:[{t:'Course library',d:'Browse available courses.'},{t:'Certifications',d:'Track progress and badges.'},{t:'Budget',d:'AED 8,000 annual allocation.'}], api:'GET /api/apps/learning', payload:'{ "userId": "..." }' },
];

/* Combined for search/detail pages */
export const ALL_APPS = [...AI_AGENTS, ...HR_APPS, ...INTERNAL_APPS];

export const SEED_ANNOUNCEMENTS = [
  { title:'Microsoft 365 Copilot — Available for All', body:'Every employee now has access to M365 Copilot across the full Office suite and Teams.', author_name:'IT Department', created_at:new Date(Date.now()-3600000).toISOString(), category:'Technology' },
  { title:'M365 Cowork — Now in Preview', body:'AI-powered collaboration workspace inside Teams. Early access open for all employees.', author_name:'Digital Workplace', created_at:new Date(Date.now()-86400000).toISOString(), category:'Preview' },
  { title:'New AI Agents Deployed', body:'Contract Agent and Finance Agent are now live. Try them from the home screen.', author_name:'AI Platform Team', created_at:new Date(Date.now()-172800000).toISOString(), category:'Product Launch' },
];

export const SEED_KUDOS = [
  { from_name:'Sara Al Maktoum', to_name:'Raj Patel', message:'Incredible work deploying the Contract AI Agent in 3 weeks!', created_at:new Date(Date.now()-7200000).toISOString() },
  { from_name:'Ahmed Hassan', to_name:'Priya Sharma', message:'Knowledge Base agent is a game-changer. 10-second compliance answers.', created_at:new Date(Date.now()-43200000).toISOString() },
  { from_name:'Lisa Chen', to_name:'Omar Khalid', message:'Seamless M365 Copilot rollout. Zero tickets. Flawless.', created_at:new Date(Date.now()-86400000).toISOString() },
  { from_name:'Noor Ahmed', to_name:'Tech Platform Team', message:'ATLAS is exactly what we needed — all agents in one beautiful place.', created_at:new Date(Date.now()-172800000).toISOString() },
];

export const AGENT_RESPONSES = {
  'finops-agent': 'Your total Azure spend this month is AED 847,320 across 12 subscriptions. Top consumers: AKS clusters (34%), Cognitive Services (22%), Storage (15%). Token utilisation: 2.4M consumed, 67% of allocation. AWS: USD 12,400. Recommendation: 3 idle VMs — saving AED 4,200/month.',
  'contract-agent': 'Key clauses found: termination (8.2), liability (12.1), IP (15.3).',
  'it-agent': 'Running VPN diagnostic. Try reconnecting first.',
  'finance-agent': 'Q2 budget: 67% used. AED 124,500 remaining.',
  'knowledge-base': 'Found: "Data Classification Policy v3.2", March 2026.',
};

export const HR_QA = {
  'What is the WFH policy?': 'Work From Home (WFH) is permitted 1 day per week, subject to line manager approval. Available during core hours 9 AM – 5 PM UAE time.',
  'What is the Work from Anywhere policy?': 'Work From Anywhere (WFA) allows up to 5 working days per calendar year. Requires 2 weeks advance approval.',
  'How many annual leave days do I get?': '23 working days per calendar year. Up to 5 days carry forward to Q1.',
  'What is the sick leave policy?': '15 days paid sick leave per year. Medical certificate needed for 3+ consecutive days.',
  'What medical benefits do I have?': 'Full medical, dental (AED 5,000/yr), optical (AED 1,500/yr). Covers spouse + 3 dependants.',
  'What is the maternity and paternity leave?': 'Maternity: 60 days full pay + 45 days half pay. Paternity: 5 days full pay.',
  'What are the working hours?': 'Sun–Thu 9 AM – 6 PM, 1hr lunch. Ramadan: reduced 2hrs. Flex start 8–10 AM available.',
  'How do I submit an expense claim?': 'Submit within 30 days via Finance portal. Receipts required. Over AED 5,000 needs VP approval.',
  'What training is available?': 'LinkedIn Learning + Coursera. AED 8,000/yr budget. Conferences up to AED 12,000/yr.',
};

export const HR_QUICK_CHIPS = ['WFH policy?', 'Annual leave?', 'Sick leave?', 'Working hours?', 'Medical benefits?', 'WFA policy?'];
