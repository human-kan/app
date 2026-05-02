// ─── User credentials and their assigned Vapi Assistant IDs ───────────────────
// Add more users here as needed.

export interface AppUser {
  id: string;        // login username
  password: string;  // login password
  email: string;     // user email
  practiceName: string; // Account or business name
  ownerName: string;    // Business owner or principal's full name
  phone: string;        // Contact phone
  role: 'admin' | 'superadmin'; // access level
  vapiAssistantId: string; // assigned Vapi assistant ID
  displayName: string;     // header display name
  onboardedAt: string;     // ISO date
  lastPaymentAt: string | null; // ISO date or null
  internalNotes: string;   // CRM private notes
  crmStatus: 'New' | 'Healthy' | 'Stagnant' | 'Churned'; // Client lifecycle state
  lastContactedAt: string | null; // ISO date of last official touchpoint
  permissions: {
    sms: boolean;
    analytics: boolean;
    afterHours: boolean;
  };
  googleSheetUrl?: string; // Optional external log sheet URL
  avgClientValue?: string; // Persistent revenue baseline
}

export const USERS: AppUser[] = [
  {
    id: 'smthin',
    password: 'smthin123',
    email: 'admin@smthin.com',
    practiceName: "SMTHIN' HQ",
    ownerName: 'Platform Admin',
    phone: '+1-555-000-0000',
    role: 'superadmin',
    vapiAssistantId: '',
    displayName: 'Global Super Admin',
    onboardedAt: '2026-03-01T12:00:00Z',
    lastPaymentAt: '2026-03-01T12:00:00Z',
    internalNotes: 'Account in good standing. Primary contact for billing queries.',
    crmStatus: 'Healthy',
    lastContactedAt: '2026-03-20T10:00:00Z',
    permissions: { sms: true, analytics: true, afterHours: true },
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1'
  },
  {
    id: 'admin',
    password: 'admin123',
    email: 'admin@skyline-pro.com',
    practiceName: 'Skyline Professional Services',
    ownerName: 'Jane Smith',
    phone: '+1-234-567-8901',
    role: 'admin',
    vapiAssistantId: '28e26860-807f-41ee-9d7a-e00880c85a29',
    displayName: 'Admin Account',
    onboardedAt: '2026-03-25T12:00:00Z', // 3 days ago relative to 28th, should be in trial
    lastPaymentAt: null,
    internalNotes: '',
    crmStatus: 'New',
    lastContactedAt: null,
    permissions: { sms: true, analytics: true, afterHours: true },
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/2'
  },
];

export function authenticate(id: string, password: string): AppUser | null {
  return USERS.find(u => u.id === id && u.password === password) ?? null;
}
