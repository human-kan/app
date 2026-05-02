import React from 'react';
import Logo from './Logo';

// Simple SVG social icons to avoid external dependencies
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

const socialLinks = [
  { icon: <XIcon />, href: 'https://x.com/smthin_com', label: 'X' },
  { icon: <InstagramIcon />, href: 'https://www.instagram.com/smthin.tech', label: 'Instagram' },
  { icon: <LinkedInIcon />, href: 'https://www.linkedin.com/company/106448388/', label: 'LinkedIn' },
];

const PremiumFooter: React.FC = () => {
  return (
    <footer style={{ 
      margin: '0 auto 4rem',
      width: '92%',
      maxWidth: '1200px',
      borderRadius: '28px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Subtle glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: '1px',
        background: 'linear-gradient(to right, transparent, rgba(13, 148, 136, 0.4), transparent)'
      }} />

      {/* Main content */}
      <div style={{ padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
        
        {/* Brand — Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Logo size={32} color="var(--accent-teal)" />
          <span style={{ fontWeight: 950, fontSize: '1.35rem', letterSpacing: '-0.06em' }}>
            SMTHIN' <span style={{ color: 'var(--accent-teal)' }}>AI</span>
          </span>
        </div>

        {/* Copyright + Socials stacked — Right */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.25rem' }}>
          <a
            href="https://smthin.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.25)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
          >
            &copy; 2026 SMTHIN' TECHNOLOGIES
          </a>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {socialLinks.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{
                  width: '42px', height: '42px',
                  display: 'grid', placeContent: 'center',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(13, 148, 136, 0.15)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(13, 148, 136, 0.4)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--accent-teal)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
