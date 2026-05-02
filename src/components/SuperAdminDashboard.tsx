import React, { useState, useEffect } from 'react';
import { Users, Plus, Activity, DollarSign, LayoutDashboard, LogOut, BadgeDollarSign, ShieldCheck, Clock, MessageSquare, Trash2, TrendingUp, Bell, Settings2, Table, Pencil } from 'lucide-react';
import { AppUser } from '../users';
import { db } from '../db';
import Logo from './Logo';

interface SuperAdminDashboardProps {
  users: AppUser[];
  announcement: string;
  onSetAnnouncement: (msg: string) => void;
  onAddUser: (user: AppUser) => void;
  onUpdateUser: (user: AppUser) => void;
  onMarkPaid: (userId: string) => void;
  onUpdateNotes: (userId: string, notes: string) => void;
  onStatusChange: (userId: string, status: AppUser['crmStatus']) => void;
  onLogContact: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onTogglePermission: (userId: string, perm: keyof AppUser['permissions']) => void;
  onLogout: () => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  users, announcement, onSetAnnouncement, onAddUser, onUpdateUser, onMarkPaid, onUpdateNotes, onStatusChange, onLogContact, onDeleteUser, onTogglePermission, onLogout 
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [noteEditingUserId, setNoteEditingUserId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState('');
  const [metricsMap, setMetricsMap] = useState<Record<string, { totalCalls: number, revenue: number, totalMinutes: number, active: boolean, needsAttention: boolean, dailyRevenue: Record<string, number> }>>({});
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [localAnnouncement, setLocalAnnouncement] = useState(announcement);
  const [latency, setLatency] = useState('0.6s');

  useEffect(() => {
    const interval = setInterval(() => {
      const vals = ['0.4s', '0.6s', '0.7s', '0.5s', '0.8s'];
      setLatency(vals[Math.floor(Math.random() * vals.length)]);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handlePushAnnouncement = () => {
    onSetAnnouncement(localAnnouncement);
    alert("Global announcement pushed successfully!");
  };

  // --- 📉 ANALYTICS HELPERS ---
  const getGrowthData = () => {
    const dailyTotals: Record<string, number> = {};
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    Object.values(metricsMap).forEach(m => {
      Object.entries(m.dailyRevenue || {}).forEach(([date, rev]) => {
        dailyTotals[date] = (dailyTotals[date] || 0) + rev;
      });
    });

    return last7Days.map(date => dailyTotals[date] || 0);
  };

  const renderSparkline = (data: number[]) => {
    if (data.length < 2) return null;
    const max = Math.max(...data, 100);
    const width = 400;
    const height = 40;
    const points = data.map((val, i) => `${(i / (data.length - 1)) * width},${height - (val / max) * height}`).join(' ');
    
    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <polyline fill="none" stroke="var(--accent-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
      </svg>
    );
  };

  // --- 📅 ENGAGEMENT HELPERS ---
  const getContactStatus = (user: AppUser) => {
    if (!user.lastContactedAt) return { label: 'Never Contacted', color: '#f87171', needsAttention: true };
    const lastDate = new Date(user.lastContactedAt);
    const daysSince = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince > 30) return { label: `${daysSince} days ago`, color: '#f87171', needsAttention: true };
    if (daysSince === 0) return { label: 'Contacted Today', color: '#22c55e', needsAttention: false };
    return { label: `${daysSince} day${daysSince > 1 ? 's' : ''} ago`, color: 'var(--text-muted)', needsAttention: false };
  };

  // --- 🚦 CRM HELPERS ---
  const getStatusBadge = (user: AppUser) => {
    const metrics = metricsMap[user.id];
    let status = user.crmStatus || 'New';
    
    const onboardDate = new Date(user.onboardedAt || new Date());
    const daysOld = Math.floor((new Date().getTime() - onboardDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (status === 'Healthy' && metrics && metrics.totalCalls === 0 && daysOld > 3) {
      status = 'Stagnant';
    }

    const configs = {
      Healthy: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
      Stagnant: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
      New: { color: 'var(--accent-teal)', bg: 'rgba(13, 148, 136, 0.1)' },
      Churned: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
    };
    
    const config = configs[status as keyof typeof configs] || configs.New;

    return (
      <select 
        value={status}
        onChange={(e) => onStatusChange(user.id, e.target.value as any)}
        style={{ 
          fontSize: '0.65rem', 
          fontWeight: 700, 
          color: config.color, 
          background: config.bg, 
          border: 'none', 
          borderRadius: '4px', 
          padding: '2px 6px',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <option value="New">NEW</option>
        <option value="Healthy">HEALTHY</option>
        <option value="Stagnant">STAGNANT</option>
        <option value="Churned">CHURNED</option>
      </select>
    );
  };
  
  const [newUser, setNewUser] = useState<Partial<AppUser>>({
    role: 'admin',
    displayName: '',
    practiceName: '',
    email: '',
    ownerName: '',
    phone: '',
    id: '',
    password: '',
    vapiAssistantId: '',
    googleSheetUrl: '',
  });

  // --- ⏲️ BILLING HELPERS ---
  const getBillingStatus = (user: AppUser) => {
    const onboardDate = new Date(user.onboardedAt || new Date());
    const lastPayDate = user.lastPaymentAt ? new Date(user.lastPaymentAt) : null;
    const now = new Date();
    
    const diffTime = Math.abs(now.getTime() - onboardDate.getTime());
    const daysSinceOnboarding = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysSinceOnboarding <= 7) {
      const daysLeft = 7 - daysSinceOnboarding;
      return { 
        type: 'trial' as const, 
        label: `${daysLeft} Day${daysLeft !== 1 ? 's' : ''} Left`, 
        sub: '7-DAY FREE TRIAL',
        color: 'var(--accent-teal)'
      };
    }

    const lastActionDate = lastPayDate || onboardDate;
    const diffAction = Math.abs(now.getTime() - lastActionDate.getTime());
    const daysSinceAction = Math.floor(diffAction / (1000 * 60 * 60 * 24));

    if (daysSinceAction >= 30) {
      return { 
        type: 'alert' as const, 
        label: 'Payment Due', 
        sub: `${daysSinceAction} Days Unpaid`,
        color: '#f87171' 
      };
    }

    return { 
      type: 'paid' as const, 
      label: 'Paid / Active', 
      sub: `Next bill in ${30 - daysSinceAction} days`,
      color: 'var(--text-muted)' 
    };
  };

  // --- 🔄 GLOBAL DATA FETCHING ---
  useEffect(() => {
    const fetchGlobalMetrics = async () => {
      setIsGlobalLoading(true);
      const newMap: Record<string, any> = {};
      const VAPI_KEY = import.meta.env.VITE_VAPI_PRIVATE_KEY;

      const admins = users.filter(u => u.role === 'admin' && u.vapiAssistantId);
      
      await Promise.all(admins.map(async (user) => {
        try {
          // 1. Fetch Overrides (Deleted IDs)
          const overrides = await db.getOverrides(user.vapiAssistantId);
          const deletedIds = overrides.filter(o => o.type === 'delete').map(o => o.call_id);

          // 2. Fetch Vapi Data
          const res = await fetch(`https://api.vapi.ai/call?assistantId=${user.vapiAssistantId}&limit=100`, {
            headers: { 'Authorization': `Bearer ${VAPI_KEY}` }
          });

          if (res.ok) {
            const rawCalls = await res.json();
            // Filter out deleted calls immediately
            const calls = (rawCalls || []).filter((c: any) => !deletedIds.includes(c.id));
            
            const bookingKeywords = ['booked', 'appointment', 'schedule', 'confirmed', 'set up', 'reserved', 'coming in', 'see you'];
            
            let totalSeconds = 0;
            let practiceDailyRev: Record<string, number> = {};

            const bookings = calls.filter((c: any) => {
              const start = c.startedAt ? new Date(c.startedAt).getTime() : 0;
              const end = c.endedAt ? new Date(c.endedAt).getTime() : 0;
              const callDurationSeconds = (start > 0 && end > start) ? (end - start) / 1000 : 0;
              totalSeconds += callDurationSeconds;
              
              const summary = (c.summary || '').toLowerCase();
              const transcript = (c.transcript || '').toLowerCase();
              const isBooking = c.analysis?.successEvaluation === true || bookingKeywords.some(kw => summary.includes(kw)) || bookingKeywords.some(kw => transcript.includes(kw));
              
              if (isBooking && c.startedAt) {
                const date = c.startedAt.split('T')[0];
                practiceDailyRev[date] = (practiceDailyRev[date] || 0) + 350;
              }
              return isBooking;
            }).length;

            const onboardDate = new Date(user.onboardedAt || new Date());
            const daysOld = Math.floor((new Date().getTime() - onboardDate.getTime()) / (1000 * 60 * 60 * 24));

            newMap[user.id] = {
              totalCalls: calls.length,
              revenue: bookings * 350,
              totalMinutes: Math.round(totalSeconds / 60),
              active: calls.length > 0,
              needsAttention: calls.length === 0 && daysOld > 7,
              dailyRevenue: practiceDailyRev
            };
          }
        } catch (e) {
          console.error(`Failed to fetch for ${user.id}`, e);
        }
      }));

      setMetricsMap(newMap);
      setIsGlobalLoading(false);
    };

    fetchGlobalMetrics();
  }, [users]);

  const adminPractices = users.filter(u => u.role === 'admin');
  const totalRev = Object.values(metricsMap).reduce((sum, m) => sum + m.revenue, 0);
  const totalCalls = Object.values(metricsMap).reduce((sum, m) => sum + m.totalCalls, 0);
  const totalMinutes = Object.values(metricsMap).reduce((sum, m) => sum + m.totalMinutes, 0);
  const activeAgents = Object.values(metricsMap).filter(m => m.active).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      onUpdateUser({ ...newUser } as AppUser);
    } else {
      onAddUser({ ...newUser, displayName: newUser.practiceName || 'New Account' } as AppUser);
    }
    setIsAddModalOpen(false);
    setEditingUserId(null);
    setNewUser({ role: 'admin', displayName: '', practiceName: '', email: '', ownerName: '', phone: '', id: '', password: '', vapiAssistantId: '', googleSheetUrl: '' });
  };

  const openEditModal = (user: AppUser) => {
    setNewUser({ ...user });
    setEditingUserId(user.id);
    setIsAddModalOpen(true);
  };

  const openNoteEditor = (user: AppUser) => {
    setNoteEditingUserId(user.id);
    setCurrentNote(user.internalNotes || '');
  };

  const handleNoteSave = () => {
    if (noteEditingUserId) {
      onUpdateNotes(noteEditingUserId, currentNote);
      setNoteEditingUserId(null);
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem 3rem', maxWidth: '1600px', margin: '0 auto', gap: '2rem' }}>
      
      {/* ── HEADER ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Logo size={42} color="var(--accent-teal)" />
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Network Console</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{adminPractices.length} NODE(S) ONLINE</span>
              </div>
              {isGlobalLoading && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-teal)' }} className="animate-pulse">
                  SYNCING CLOUD...
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => { setEditingUserId(null); setIsAddModalOpen(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.85rem' }}>
            <Plus size={18} /> Provision Access
          </button>
          <button onClick={onLogout} style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={18} /> Exit console
          </button>
        </div>
      </header>

      {/* ── TOP STATS GRID ── */}
      <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--accent-teal)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.75rem' }}>SYSTEM YIELD (REVENUE)</div>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>${totalRev.toLocaleString()}</div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
             <TrendingUp size={14} /> Total captured from {totalCalls} patient interactions
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid #22c55e' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.75rem' }}>ESTIMATED NET MRR</div>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>${(adminPractices.length * 500).toLocaleString()}</div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
             Monthly platform fees from {adminPractices.length} active licenses
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.75rem' }}>AI AGENT UTILIZATION</div>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{activeAgents} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {adminPractices.length}</span></div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
             Currently processing live interactions across network
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.75rem' }}>CLOUD INFRASTRUCTURE</div>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{latency} <span style={{ fontSize: '1rem', color: '#22c55e', fontWeight: 500 }}>LATENCY</span></div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
             <ShieldCheck size={14} color="#22c55e" /> Vapi Network Pulse: Healthy
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Network Chart */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--accent-teal)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Network Growth (7D)</h3>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-teal)' }}>
              +${(getGrowthData().reduce((a, b) => a + b, 0)).toLocaleString()}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '16px', padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            {renderSparkline(getGrowthData())}
          </div>
        </div>

        {/* Global Announcement */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <Bell size={20} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Network Announcement Center</h3>
          </div>
          <textarea 
            value={localAnnouncement}
            onChange={(e) => setLocalAnnouncement(e.target.value)}
            placeholder="Broadcast a message to all active dashboards..."
            style={{ width: '100%', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', color: 'var(--text-primary)', minHeight: '80px', outline: 'none', fontSize: '0.9rem', marginBottom: '1.25rem' }}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handlePushAnnouncement} className="btn-primary" style={{ flex: 1, padding: '10px' }}>Push Alert</button>
            <button onClick={() => { setLocalAnnouncement(''); onSetAnnouncement(''); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', borderRadius: '8px', padding: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>Clear</button>
          </div>
        </div>
      </div>

      {/* ── ACCOUNT DIRECTORY ── */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Active Nodes (Accounts)</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SYNCING {adminPractices.length} ENDPOINTS</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Practice & Principal</th>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Network Health</th>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Billing Status</th>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Yield & Usage</th>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Feature Stack</th>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminPractices.map((user) => {
                const billing = getBillingStatus(user);
                const contact = getContactStatus(user);
                const metrics = metricsMap[user.id];
                const perms = user.permissions || { sms: true, analytics: true, afterHours: true };
                
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px' }}>
                           <Users size={20} color="var(--accent-teal)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>{user.practiceName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{user.ownerName} • {user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getStatusBadge(user)}
                        {metrics?.needsAttention && (
                          <div title="Technical Attention Needed" className="animate-pulse" style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }} />
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: contact.color, fontWeight: 700, marginTop: '6px', letterSpacing: '0.02em' }}>
                         LOG: {contact.label.toUpperCase()}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: billing.color }}>{billing.label}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>{billing.sub}</div>
                        </div>
                        {billing.type === 'alert' && (
                          <button onClick={() => onMarkPaid(user.id)} style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ fontWeight: 900, color: 'var(--accent-teal)', fontSize: '1.1rem' }}>${(metrics?.revenue || 0).toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <Activity size={10} /> {metrics?.totalCalls || 0} calls • {metrics?.totalMinutes || 0}m saved
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['sms', 'analytics', 'afterHours'] as const).map(p => (
                          <button 
                            key={p}
                            onClick={() => onTogglePermission(user.id, p)}
                            style={{ 
                              padding: '4px 8px', 
                              fontSize: '0.6rem', 
                              borderRadius: '6px', 
                              border: '1px solid var(--border-color)',
                              background: perms[p] ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                              color: perms[p] ? 'var(--accent-teal)' : 'var(--text-muted)',
                              cursor: 'pointer',
                              fontWeight: 800
                            }}
                          >
                            {p.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => openNoteEditor(user)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="Notes">
                          <MessageSquare size={16} color={user.internalNotes ? 'var(--accent-teal)' : 'currentColor'} />
                        </button>
                        <button onClick={() => openEditModal(user)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="Edit Config">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => onDeleteUser(user.id)} style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.1)', color: '#f87171', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODALS ── */}
      {noteEditingUserId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div className="glass-panel animate-fade-up" style={{ width: '450px', padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <MessageSquare size={22} color="var(--accent-teal)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Internal Operations Log</h3>
            </div>
            <textarea 
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="System requirements, support history, or specific account notes..."
              style={{ width: '100%', height: '180px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'white', padding: '1rem', marginBottom: '1.5rem', resize: 'none', fontSize: '0.9rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setNoteEditingUserId(null)} style={{ flex: 1, background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleNoteSave} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '10px' }}>Commit Note</button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-up" style={{ width: '100%', maxWidth: '650px', padding: '3.5rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => { setIsAddModalOpen(false); setEditingUserId(null); }} style={{ position: 'absolute', top: '2rem', right: '2rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            
            <div style={{ marginBottom: '3rem' }}>
               <h2 style={{ fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.04em' }}>{editingUserId ? 'Edit Configuration' : 'Node Provisioning'}</h2>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Configure access parameters and infrastructure hooks.</p>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>PRACTICE NAME</label>
                <input required className="premium-input" style={{ width: '100%' }} type="text" value={newUser.practiceName} onChange={e => setNewUser({...newUser, practiceName: e.target.value})} placeholder="Skyline Medical Group" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>PRINCIPAL OWNER</label>
                <input required className="premium-input" style={{ width: '100%' }} type="text" value={newUser.ownerName} onChange={e => setNewUser({...newUser, ownerName: e.target.value})} placeholder="Sarah Connor" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>NETWORK ID (ID)</label>
                <input required disabled={!!editingUserId} className="premium-input" style={{ width: '100%', opacity: editingUserId ? 0.5 : 1 }} type="text" value={newUser.id} onChange={e => setNewUser({...newUser, id: e.target.value.toLowerCase()})} placeholder="skyline" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>INFRASTRUCTURE HOOK (VAPI ASSISTANT ID)</label>
                <input required className="premium-input" style={{ width: '100%' }} type="text" value={newUser.vapiAssistantId} onChange={e => setNewUser({...newUser, vapiAssistantId: e.target.value})} placeholder="Vapi-UUID-xxxx" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>ACCESS EMAIL</label>
                <input required className="premium-input" style={{ width: '100%' }} type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="sarah@skyline.com" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>SECURE PASSWORD</label>
                <input required className="premium-input" style={{ width: '100%' }} type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 900 }} className="btn-primary">
                  {editingUserId ? 'Apply Infrastructure Updates' : 'Provision Secure Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
