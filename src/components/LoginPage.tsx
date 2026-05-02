import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Activity } from 'lucide-react';
import { AppUser } from '../users';
import Logo from './Logo';

interface LoginPageProps {
  onLogin: (user: AppUser) => void;
  onBack: () => void;
  users: AppUser[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack, users }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = users.find(u => u.id === id.trim() && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Verification failed. Invalid ID or password.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      color: 'var(--text-primary)',
    }}>
      {/* Immersive Aurora Backdrop */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      {/* Main Portal Container */}
      <div className="glass-layered animate-fade-up" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '3rem',
        margin: '0 1rem',
        borderRadius: '24px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Branding Section */}
        <div className="animate-fade-up delay-1" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.25rem',
            animation: 'logo-breathe 4s infinite ease-in-out'
          }}>
            <Logo size={80} color="var(--accent-teal)" style={{ filter: 'drop-shadow(0 0 15px rgba(13, 148, 136, 0.4))' }} />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            SMTHIN'
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 400 }}>
            Account Management Portal
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="animate-fade-up delay-2">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>
              Account Identity
            </label>
            <input
              id="login-id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. account_admin"
              required
              className="premium-input"
              autoComplete="username"
              style={{ width: '100%' }}
            />
          </div>

          <div className="animate-fade-up delay-3">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>
              Secret Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="premium-input"
                autoComplete="current-password"
                style={{ width: '100%', paddingRight: '3.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px', padding: '4px 8px',
                   color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="animate-fade-up" style={{
              fontSize: '0.875rem', color: '#fda4af',
              background: 'rgba(225, 29, 72, 0.1)',
              border: '1px solid rgba(225, 29, 72, 0.2)',
              padding: '1rem', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn-primary animate-fade-up delay-4"
            disabled={loading}
            style={{
              width: '100%', marginTop: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              height: '54px', fontSize: '1rem', fontWeight: 600,
              boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <LogIn size={20} />
            )}
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        {/* Back to Home / Request Access */}
        <div className="animate-fade-up delay-5" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            New to SMTHIN'? <button type="button" onClick={() => alert("Contact hi@smthin.com for account provisioning.")} style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Request Access</button>
          </p>
          <button 
            type="button" 
            onClick={onBack}
            style={{ 
              marginTop: '1.5rem', 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              fontSize: '0.85rem', 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: 0.7
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>


      <footer className="animate-fade-up delay-4" style={{
        position: 'absolute', bottom: '2rem',
        width: '100%', textAlign: 'center', opacity: 0.5
      }}>
        <div className="footer-content" style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
          <span>&copy; 2026 SMTHIN' AI</span>
          <span className="footer-divider" />
          <a href="https://smthin.com">Support Portal</a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
