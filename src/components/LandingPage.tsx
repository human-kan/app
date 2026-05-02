import React, { useState } from 'react';
import { Shield, Zap, ChevronRight, Activity, PhoneCall, Mic2, CalendarCheck, Clock, HeartPulse, Sparkles, ArrowRight, Globe, Coffee, Umbrella, Users2, Rocket, X, Send, Trophy, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';
import PremiumFooter from './PremiumFooter';
import { db } from '../db';
import { triggerOutboundCall } from '../vapiOutbound';

interface LandingPageProps {
  onLoginClick: () => void;
  onWhyChooseUsClick: () => void;
  onFAQClick: () => void;
  onGetAccessClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onWhyChooseUsClick, onFAQClick, onGetAccessClick }) => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Normalize phone to E.164 and trigger Vapi outbound call
      const normalizedPhone = phone.replace(/[\s\-().]/g, '').replace(/^(?!\+)(\d{10})$/, '+1$1').replace(/^(?!\+)(\d{11})$/, '+$1');
      await triggerOutboundCall({ phoneNumber: normalizedPhone, businessName });

      // Also try to save to Supabase — non-blocking, never breaks the form
      db.saveLead({ businessName, phone, email: email || undefined })
        .catch(err => console.warn('[DB] Lead save skipped:', err));

      setIsSubmitted(true);
      setTimeout(() => {
        setShowLeadForm(false);
        setIsSubmitted(false);
        setBusinessName(''); setPhone(''); setEmail('');
      }, 3500);
    } catch (err) {
      console.error('[Lead Form] Error:', err);
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-container" style={{ 
      minHeight: '100vh', 
      color: 'white',
      overflowX: 'hidden',
      fontFamily: '"Inter", sans-serif',
      position: 'relative'
    }}>
      {/* Background Video is now handled globally by App.tsx */}

      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* --- NAVIGATION --- */}
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '1200px', zIndex: 1000 }}>
          <nav style={{ 
            padding: '1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(25px) saturate(200%)',
            borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Logo size={34} color="var(--accent-teal)" />
              <span style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.06em' }}>SMTHIN' <span style={{ color: 'var(--accent-teal)' }}>AI</span></span>
            </div>
            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
              <button onClick={onWhyChooseUsClick} style={{ background: 'none', border: 'none', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, cursor: 'pointer' }}>Why Choose Us?</button>
              <button onClick={onFAQClick} style={{ background: 'none', border: 'none', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, cursor: 'pointer' }}>FAQ</button>
              <button onClick={onLoginClick} style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px 28px', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Client Portal</button>
            </div>
          </nav>
        </div>

        {/* --- HERO --- */}
        <section style={{ padding: '8.1875rem 2rem 8rem', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 10vw, 5.5rem)', fontWeight: 950, letterSpacing: '-0.07em', lineHeight: 0.9, marginBottom: '2.5rem' }}>
            Every Call Answered. <br/>
            <span style={{ background: 'linear-gradient(to right, #fff, var(--accent-teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>On the First Ring.</span>
          </h1>
          <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.7)', maxWidth: '850px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
            Stop letting missed calls kill your revenue. Our Digital Receptionist picks up every call 
            at just <b>$499/month</b> with zero setup fees.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowLeadForm(true)} className="btn-primary" style={{ padding: '24px 56px', fontSize: '1.25rem', borderRadius: '20px', fontWeight: 900 }}>
              Start 7-Day Free Trial <ArrowRight size={26} />
            </button>
            <button onClick={onWhyChooseUsClick} style={{ padding: '24px 56px', fontSize: '1.2rem', borderRadius: '20px', fontWeight: 700, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', cursor: 'pointer', backdropFilter: 'blur(20px)' }}>
              See Our Guarantee
            </button>
          </div>
        </section>

        {/* --- STATS PILL --- */}
        <section style={{ margin: '4rem auto', width: '90%', maxWidth: '1200px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '4rem 2rem', display: 'flex', justifyContent: 'center', gap: '5rem', flexWrap: 'wrap', backdropFilter: 'blur(30px) saturate(180%)', borderRadius: '32px' }}>
          <StatItem label="Pick-up Speed" value="Instant" />
          <StatItem label="Saved Annual Revenue" value="$45,000+" />
          <StatItem label="Management" value="Zero" />
          <StatItem label="Setup Fee" value="$0" />
          <StatItem label="Guarantee" value="3 Bookings" />
        </section>

        {/* --- COMPARISON TABLE --- */}
        <section style={{ padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 950, marginBottom: '1.5rem' }}>The Math is Obvious.</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.25rem' }}>A better employee for a fraction of the cost.</p>
          </div>
          <div style={{ 
            display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1px', 
            background: 'rgba(255,255,255,0.08)', borderRadius: '40px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>FEATURES</div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', fontWeight: 800, textAlign: 'center' }}>HUMAN HIRE</div>
            <div style={{ background: 'rgba(13, 148, 136, 0.08)', padding: '3rem', fontWeight: 900, textAlign: 'center', color: 'var(--accent-teal)' }}>SMTHIN' AI</div>
            <ComparisonCell label="Monthly Cost" /> <ComparisonCell value="$3,500+" /> <ComparisonCell value="$499" highlight />
            <ComparisonCell label="Operating Hours" /> <ComparisonCell value="9am - 5pm" /> <ComparisonCell value="24/7/365" highlight />
            <ComparisonCell label="Call Capacity" /> <ComparisonCell value="1 at a time" /> <ComparisonCell value="Infinite" highlight />
            <ComparisonCell label="Sick/Vacation Days" /> <ComparisonCell value="30+ Days/Year" /> <ComparisonCell value="Zero" highlight />
            <ComparisonCell label="Manager Oversight" /> <ComparisonCell value="Constant" /> <ComparisonCell value="None Required" highlight />
          </div>
        </section>

        {/* --- PREMIUM FOOTER --- */}
        <PremiumFooter />
      </div>

      {/* --- LEAD MODAL --- */}
      {showLeadForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '3rem', borderRadius: '32px', background: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(30px) saturate(180%)', position: 'relative' }}>
            <button onClick={() => setShowLeadForm(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={24} /></button>

            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(13,148,136,0.15)', borderRadius: '50%', display: 'grid', placeContent: 'center', margin: '0 auto 2rem', border: '1px solid rgba(13,148,136,0.3)' }}>
                  <Zap size={40} color="var(--accent-teal)" />
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1rem' }}>You're on the list!</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>We'll reach out within 24 hours to activate your Digital Receptionist.</p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Start Your Trial</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Only $499/month. Zero setup fees.</p>
                </div>

                <input type="text" required placeholder="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} className="premium-input" style={{ width: '100%' }} />

                <div>
                  <input type="tel" required placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="premium-input" style={{ width: '100%' }} />
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem', paddingLeft: '0.25rem' }}>We'll call you to set things up — no spam, ever.</p>
                </div>

                <div>
                  <input type="email" placeholder="Email Address (optional)" value={email} onChange={e => setEmail(e.target.value)} className="premium-input" style={{ width: '100%', opacity: 0.7 }} />
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.5rem', paddingLeft: '0.25rem' }}>Temporary — just to send your welcome details.</p>
                </div>

                {submitError && <p style={{ color: '#f87171', fontSize: '0.85rem', textAlign: 'center' }}>{submitError}</p>}

                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ height: '54px', fontWeight: 800, marginTop: '0.5rem', opacity: isSubmitting ? 0.6 : 1 }}>
                  {isSubmitting ? 'Saving...' : 'Claim Offer'} <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--accent-teal)', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(13, 148, 136, 0.4)' }}>{value}</div>
    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{label}</div>
  </div>
);

const ComparisonCell = ({ label, value, highlight }: { label?: string, value?: string, highlight?: boolean }) => (
  <div style={{ 
    padding: '2.5rem 3rem', background: highlight ? 'rgba(13, 148, 136, 0.03)' : 'rgba(255,255,255,0.01)', 
    fontSize: '1.05rem', fontWeight: highlight ? 800 : 500, color: highlight ? 'var(--accent-teal)' : 'white',
    display: 'flex', alignItems: 'center', justifyContent: label ? 'flex-start' : 'center', textAlign: label ? 'left' : 'center'
  }}>
    {label ? label.toUpperCase() : value}
    {highlight && label === undefined && <CheckCircle2 size={16} style={{ marginLeft: '10px', opacity: 0.8 }} />}
  </div>
);

export default LandingPage;
