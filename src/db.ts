import { supabase } from './supabaseClient';
import { AppUser } from './users';

export const db = {
  // --- 👤 USER PROFILES ---
  async getUsers(): Promise<AppUser[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return (data || []).map(u => ({
      id: u.id,
      email: u.email,
      password: u.password,
      practiceName: u.practice_name,
      ownerName: u.owner_name,
      phone: u.phone,
      role: u.role,
      vapiAssistantId: u.vapi_assistant_id,
      displayName: u.display_name,
      onboardedAt: u.onboarded_at,
      lastPaymentAt: u.last_payment_at,
      internalNotes: u.internal_notes,
      crmStatus: u.crm_status,
      lastContactedAt: u.last_contacted_at,
      permissions: u.permissions || { sms: true, analytics: true, afterHours: true },
      googleSheetUrl: u.google_sheet_url,
      avgClientValue: u.avg_client_value
    }));
  },

  async upsertUser(user: AppUser) {
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      password: user.password,
      practice_name: user.practiceName,
      owner_name: user.ownerName,
      phone: user.phone,
      role: user.role,
      vapi_assistant_id: user.vapiAssistantId,
      display_name: user.displayName,
      onboarded_at: user.onboardedAt,
      last_payment_at: user.lastPaymentAt,
      internal_notes: user.internalNotes,
      crm_status: user.crmStatus,
      last_contacted_at: user.lastContactedAt,
      permissions: user.permissions,
      google_sheet_url: user.googleSheetUrl,
      avg_client_value: user.avgClientValue
    });
    if (error) throw error;
  },

  async deleteUser(userId: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
  },

  // --- 📞 CALL OVERRIDES (DELETIONS/SENTIMENTS) ---
  async getOverrides(assistantId: string) {
    const { data, error } = await supabase
      .from('call_overrides')
      .select('*')
      .eq('assistant_id', assistantId);
    if (error) throw error;
    return data || [];
  },

  async addOverride(assistantId: string, callId: string, type: 'delete' | 'sentiment', value: string) {
    const { error } = await supabase.from('call_overrides').upsert({
      assistant_id: assistantId,
      call_id: callId,
      type,
      value
    }, { onConflict: 'assistant_id,call_id,type' });
    if (error) throw error;
  },

  // --- 📢 SYSTEM CONFIG ---
  async getAnnouncement(): Promise<string> {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'announcement')
      .single();
    if (error && error.code !== 'PGRST116') throw error; // ignore not found
    return data?.value || '';
  },

  async setAnnouncement(msg: string) {
    const { error } = await supabase.from('system_config').upsert({
      key: 'announcement',
      value: msg
    });
    if (error) throw error;
  },

  // --- 🎯 LEADS (Inbound Prospects from Landing Page) ---
  async saveLead(lead: { businessName: string; phone: string; email?: string }) {
    const { error } = await supabase.from('leads').insert({
      business_name: lead.businessName,
      phone: lead.phone,
      email: lead.email || null,
      source: 'landing_page'
    });
    if (error) throw error;
  }
};
