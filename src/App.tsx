import { useState, useEffect } from 'react';
import './index.css';
import SettingsModal from './components/SettingsModal';
import SummaryCards from './components/SummaryCards';
import Charts from './components/Charts';
import CallLogs from './components/CallLogs';
import LoginPage from './components/LoginPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ReportsWidget from './components/ReportsWidget';
import LogSheetView from './components/LogSheetView';
import LandingPage from './components/LandingPage';
import WhyChooseUsPage from './components/WhyChooseUsPage';
import FAQPage from './components/FAQPage';
import BackgroundVideo from './components/BackgroundVideo';
import Logo from './components/Logo';
import { useVapiData } from './hooks/useVapiData';
import { Sun, Moon, Settings, LogOut, Table, Activity } from 'lucide-react';
import { AppUser } from './users';
import { db } from './db';
import ChatWidget from './components/ChatWidget';

function App() {
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [globalAnnouncement, setGlobalAnnouncement] = useState<string>('');
  const [dbError, setDbError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [avgClientValue, setAvgClientValue] = useState('350');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [latency, setLatency] = useState('0.6s');
  const [currentView, setCurrentView] = useState<'dashboard' | 'logs'>('dashboard');
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'why-choose-us' | 'faq'>('landing');

  // --- 🔄 DATABASE INITIALIZATION & SYNC ---
  useEffect(() => {
    const initDb = async () => {
      try {
        let users = await db.getUsers();
        
        // Seed logic removed for production readiness.
        // If users were empty, it now stays empty until provisioned via console.
        
        setAllUsers(users);
        const announce = await db.getAnnouncement();
        setGlobalAnnouncement(announce);
      } catch (err: any) {
        console.error("Supabase init failed:", err);
        setDbError(err.message || "Unknown cloud connection error");
      } finally {
        // DB loading handled
      }
    };
    initDb();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const vals = ['0.4s', '0.6s', '0.7s', '0.5s', '0.8s'];
      setLatency(vals[Math.floor(Math.random() * vals.length)]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Apply theme to entire document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Set document title dynamically
  useEffect(() => {
    if (currentUser) {
      document.title = currentUser.role === 'superadmin' 
        ? "SMTHIN' | Global Console" 
        : `${currentUser.practiceName} | SMTHIN' Dashboard`;
    } else {
      document.title = "SMTHIN' AI Dashboard";
    }
  }, [currentUser]);

  // assistantId is always the one tied to the logged-in user
  const assistantId = currentUser?.vapiAssistantId ?? '';
  const vapiMetrics = useVapiData(assistantId, avgClientValue);
  const { loading, error } = vapiMetrics;

  const handleLogin = (user: AppUser) => {
    // We re-check the user against the latest allUsers state in case of updates
    const latestUser = allUsers.find(u => u.id === user.id);
    setCurrentUser(latestUser || user);
  };

  const handleSetAnnouncement = async (msg: string) => {
    setGlobalAnnouncement(msg);
    await db.setAnnouncement(msg);
  };

  const addUser = async (newUser: AppUser) => {
    const userWithDate = {
      ...newUser,
      onboardedAt: new Date().toISOString(),
      lastPaymentAt: null,
      internalNotes: '',
      crmStatus: 'New' as const,
      lastContactedAt: null,
      permissions: { sms: true, analytics: true, afterHours: true }
    };
    setAllUsers(prev => [...prev, userWithDate]);
    await db.upsertUser(userWithDate);
  };

  const updateUser = async (updatedUser: AppUser) => {
    setAllUsers(prev => prev.map(u => 
      u.id === updatedUser.id ? { ...u, ...updatedUser, displayName: updatedUser.practiceName || u.displayName } : u
    ));
    await db.upsertUser(updatedUser);
    
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(prev => prev ? { ...prev, ...updatedUser } : null);
    }
  };

  const markPaymentCollected = async (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const updated = { ...user, lastPaymentAt: new Date().toISOString() };
    setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));
    await db.upsertUser(updated);
  };

  const updateUserNotes = async (userId: string, notes: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const updated = { ...user, internalNotes: notes };
    setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));
    await db.upsertUser(updated);
  };

  const updateUserStatus = async (userId: string, status: AppUser['crmStatus']) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const updated = { ...user, crmStatus: status };
    setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));
    await db.upsertUser(updated);
  };

  const toggleUserPermission = async (userId: string, permission: keyof AppUser['permissions']) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const updated = { 
      ...user, 
      permissions: { ...user.permissions, [permission]: !user.permissions[permission] } 
    };
    setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));
    await db.upsertUser(updated);
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to PERMANENTLY delete this account? This cannot be undone.")) {
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      await db.deleteUser(userId);
    }
  };

  const logContactEvent = async (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const updated = { ...user, lastContactedAt: new Date().toISOString() };
    setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));
    await db.upsertUser(updated);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAvgClientValue('350');
    setCurrentView('dashboard');
    setViewMode('landing');
  };

  // Show error only if DB fails critical connection
  if (dbError) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', color: 'var(--accent-teal)', textAlign: 'center', padding: '2rem' }}>
        <Activity size={48} color="var(--accent-amber)" />
        <div>
          <h2 style={{ color: 'var(--accent-amber)', marginBottom: '0.5rem' }}>Cloud Sync Failed</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>{dbError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary" 
            style={{ marginTop: '1.5rem', background: 'var(--accent-amber)', color: 'white' }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Show landing/login/faq if not authenticated
  if (!currentUser) {
    return (
      <>
        <BackgroundVideo />
        <div style={{ position: 'relative', zIndex: 10 }}>
          {viewMode === 'landing' && (
            <LandingPage 
              onLoginClick={() => setViewMode('login')} 
              onWhyChooseUsClick={() => setViewMode('why-choose-us')}
              onFAQClick={() => setViewMode('faq')}
              onGetAccessClick={() => alert("SMTHIN' AI is currently in private beta for selected agencies. Please contact hi@smthin.com to request access.")} 
            />
          )}

          {viewMode === 'why-choose-us' && (
            <WhyChooseUsPage 
              onBack={() => setViewMode('landing')}
              onGetAccessClick={() => alert('Access request system coming soon!')}
            />
          )}

          {viewMode === 'faq' && (
            <FAQPage 
              onBack={() => setViewMode('landing')}
              onGetAccessClick={() => alert('Access request system coming soon!')}
            />
          )}

          {viewMode === 'login' && (
            <LoginPage onLogin={handleLogin} onBack={() => setViewMode('landing')} users={allUsers} />
          )}
          <ChatWidget />
        </div>
      </>
    );
  }

  // SUPER ADMIN VIEW
  if (currentUser.role === 'superadmin') {
    return (
      <div className="dashboard-container">
        <SuperAdminDashboard 
          users={allUsers} 
          announcement={globalAnnouncement}
          onSetAnnouncement={handleSetAnnouncement}
          onAddUser={addUser} 
          onUpdateUser={updateUser}
          onMarkPaid={markPaymentCollected}
          onUpdateNotes={updateUserNotes}
          onStatusChange={updateUserStatus}
          onLogContact={logContactEvent}
          onDeleteUser={deleteUser}
          onTogglePermission={toggleUserPermission}
          onLogout={handleLogout} 
        />
        <footer className="dashboard-footer">
          <p>© 2026 SMTHIN' AI. All rights reserved.</p>
        </footer>
        <ChatWidget />
      </div>
    );
  }

  // STANDARD PRACTICE VIEW
  const perms = currentUser.permissions || { sms: true, analytics: true, afterHours: true };

  return (
    <div className="dashboard-container">
      {/* Global Network Announcement Banner */}
      {globalAnnouncement && (
        <div style={{ 
          background: 'var(--accent-teal)', 
          color: 'white', 
          padding: '12px 24px', 
          textAlign: 'center', 
          fontSize: '0.9rem', 
          fontWeight: 600, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '10px',
          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
          position: 'relative',
          zIndex: 1000
        }}>
          <Activity size={18} className="animate-pulse" /> 
          <span style={{ letterSpacing: '0.05em' }}>{globalAnnouncement.toUpperCase()}</span>
          <Activity size={18} className="animate-pulse" />
        </div>
      )}

      <header className="dashboard-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        {/* Brand & Live Pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Logo size={32} color="var(--accent-teal)" />

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
                SMTHIN'
              </span>
              <span style={{ width: '1px', height: '14px', background: 'var(--border-color)', display: 'inline-block', alignSelf: 'center', opacity: 0.6 }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
                {currentUser.practiceName}
              </span>
            </div>
          </div>

          {/* 10/10 Live Infrastructure Pulse */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            background: 'rgba(0,0,0,0.2)', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            border: '1px solid var(--border-color)',
            fontSize: '0.7rem',
            fontWeight: 700
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-teal)' }}>
              <div className="animate-pulse" style={{ width: '6px', height: '6px', background: 'var(--accent-teal)', borderRadius: '50%' }} />
              <span>STABILITY: 99.9%</span>
            </div>
            <div style={{ width: '1px', height: '10px', background: 'var(--border-color)' }} />
            <div style={{ color: 'var(--text-muted)' }}>
              AI LATENCY: <span style={{ color: 'var(--text-primary)' }}>{latency}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={() => setIsDarkMode(d => !d)}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <Sun size={14} color="var(--accent-amber)" style={{ opacity: isDarkMode ? 0.4 : 1 }} />
            <div className={`theme-toggle-track ${!isDarkMode ? 'active' : ''}`}>
              <div className="theme-toggle-thumb" />
            </div>
            <Moon size={14} color="var(--accent-teal)" style={{ opacity: isDarkMode ? 1 : 0.4 }} />
          </button>

          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {currentUser.displayName}
          </span>
          <button onClick={() => setIsSettingsOpen(true)} className="settings-btn" title="System Settings">
            <Settings size={20} />
          </button>
          {currentUser.googleSheetUrl && (
            <button 
              onClick={() => setCurrentView(currentView === 'logs' ? 'dashboard' : 'logs')} 
              className={`settings-btn ${currentView === 'logs' ? 'active-tab' : ''}`} 
              title={currentView === 'logs' ? 'Back to Dashboard' : 'Open External Log Sheet'}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, padding: '0 1rem' }}
            >
              <Table size={18} color="var(--accent-teal)" />
              <span className="hide-mobile">{currentView === 'logs' ? 'Dashboard' : 'Log Sheet'}</span>
            </button>
          )}
          <button onClick={handleLogout} className="settings-btn" title="Sign Out">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {currentView === 'logs' && currentUser.googleSheetUrl ? (
          <LogSheetView sheetUrl={currentUser.googleSheetUrl} onBack={() => setCurrentView('dashboard')} metrics={vapiMetrics} />
        ) : (
          <>
            {loading && <p style={{ color: 'var(--accent-teal)' }}>Syncing with Vapi...</p>}
            {error && <p style={{ color: 'var(--accent-amber)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

            {/* Top Row: Analytics Summary */}
            <SummaryCards metrics={vapiMetrics} permissions={currentUser.permissions} />

            {/* Announcement Banner (if any) */}
            {globalAnnouncement && (
              <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent-amber)', background: 'rgba(217, 119, 6, 0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.25rem' }}>📢</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{globalAnnouncement}</p>
              </div>
            )}

            {/* Middle Row: Charts */}
            {currentUser.permissions?.analytics && (
              <Charts metrics={vapiMetrics} />
            )}

            {/* Reports Section */}
            <ReportsWidget user={currentUser} metrics={vapiMetrics} />

            {/* Bottom Row: Call Logs */}
            <CallLogs metrics={vapiMetrics} />
          </>
        )}
      </main>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <span>&copy; 2026 SMTHIN' Technologies</span>
          <span className="footer-divider" />
          <a href="https://smthin.com" target="_blank" rel="noopener noreferrer">smthin.com</a>
          <span className="footer-divider" />
          <a href="mailto:hi@smthin.com">hi@smthin.com</a>
        </div>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        assistantId={assistantId}
        setAssistantId={() => { }} // no-op — locked to logged-in user
        avgClientValue={avgClientValue}
        setAvgClientValue={setAvgClientValue}
        isAssistantLocked={true}
      />
      <ChatWidget />
    </div>
  );
}

export default App;
