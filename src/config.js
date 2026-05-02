const DEFAULTS = {
  companyName: 'ATG',
  appName: 'ATLAS',
  tagline: 'AI-Powered Employee Workspace',
  hrPhoneNumber: 'tel:+97140000000',
  myHrChatModel: 'gpt-4.1-mini',
  myHrRealtimeProvider: 'azure-openai',
  myHrRealtimeModel: 'gpt-realtime',
  myHrRealtimeVoice: 'marin',
  myHrVoiceLanguage: 'en-US',
};

let _config = { ...DEFAULTS };
let _loaded = false;

export async function loadConfig(apiBase) {
  if (_loaded) return _config;
  try {
    const cached = sessionStorage.getItem('atg_config');
    if (cached) { _config = { ..._config, ...JSON.parse(cached) }; _loaded = true; return _config; }
    const r = await fetch(`${apiBase}/config`);
    if (r.ok) {
      const data = await r.json();
      _config = { ..._config, ...data };
      sessionStorage.setItem('atg_config', JSON.stringify(data));
    }
  } catch (e) { /* use defaults */ }
  _loaded = true;
  return _config;
}

export function getConfig() { return _config; }

export const POLICIES = {
  wfh: 'Work From Home (WFH) is permitted 1 day per week, subject to line manager approval. You must be available during core hours (9 AM – 5 PM UAE time) and ensure VPN connectivity.',
  wfa: 'Work From Anywhere (WFA) allows employees to work from any location for up to 5 working days per calendar year. Prior approval from your line manager and HR is required at least 2 weeks in advance.',
  annualLeave: 'You are entitled to 23 working days of annual leave per calendar year. Leave accrues monthly and can be taken after completion of probation. Unused leave up to 5 days may be carried forward to Q1.',
  sickLeave: 'You are entitled to 15 days of paid sick leave per calendar year. A medical certificate is required for absences of 3 or more consecutive days.',
  medical: 'All employees receive comprehensive medical insurance covering outpatient, inpatient, dental (up to AED 5,000/year), and optical (up to AED 1,500/year). Coverage extends to spouse and up to 3 dependants.',
  maternity: 'Maternity leave is 60 calendar days at full pay, plus 45 days at half pay. Paternity leave is 5 working days at full pay within 30 days of birth.',
  workingHours: 'Standard hours: Sunday to Thursday, 9:00 AM to 6:00 PM with 1-hour lunch. During Ramadan, reduced by 2 hours/day. Flexible start (8–10 AM) with manager approval.',
  expenses: 'Submit claims within 30 days. Attach receipts, select cost centre. Reimbursed within 5 working days. Claims over AED 5,000 require VP approval.',
  training: 'LinkedIn Learning + Coursera for all. Annual budget AED 8,000/employee. Conference attendance up to AED 12,000/year with L&D approval.',
};

export const LEAVE_CONFIG = { balance: 24, used: 3, pending: 2 };

export const FINOPS = {
  azureSpend: 'AED 847,320',
  subscriptions: '12',
  topConsumers: 'AKS clusters (34%), Cognitive Services (22%), Storage (15%)',
  trend: '8% below last month',
  tokenUsage: '2.4M tokens consumed, 67% of monthly allocation',
  awsSpend: 'USD 12,400',
  savings: '3 idle VMs in UAT — shutting down saves AED 4,200/month',
};
