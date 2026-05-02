import React, { useState } from 'react';
import { Shield, Zap, ChevronLeft, ArrowRight, Trophy, Banknote, Clock, CalendarCheck, ShieldCheck, Star, Users, Briefcase, BarChart3, X, Send, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';
import PremiumFooter from './PremiumFooter';

interface WhyChooseUsPageProps {
  onBack: () => void;
  onGetAccessClick: () => void;
}

const WhyChooseUsPage: React.FC<WhyChooseUsPageProps> = ({ onBack, onGetAccessClick }) => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    industry: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setShowLeadForm(false);
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="why-choose-us-container" style={{ 
      minHeight: '100vh', 
      color: 'white',
      overflowX: 'hidden',
      fontFamily: '"Inter", sans-serif',
      position: 'relative'
    }}>
      {/* Background Video is now handled globally by App.tsx */}

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* --- NAVIGATION --- */}
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', width: '92%', maxWidth: '1200px', zIndex: 1000 }}>
          <nav style={{ 
            padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(30px) saturate(200%)',
            borderRadius: '28px', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={onBack}>
              <Logo size={36} color="var(--accent-teal)" />
              <span style={{ fontWeight: 950, fontSize: '1.5rem', letterSpacing: '-0.07em' }}>SMTHIN' <span style={{ color: 'var(--accent-teal)' }}>AI</span></span>
            </div>
            <button 
              onClick={onBack}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', padding: '10px 20px', borderRadius: '14px' }}
            >
              <ChevronLeft size={18} /> Home
            </button>
          </nav>
        </div>

        {/* --- HERO --- */}
        <section style={{ padding: '12rem 2rem 6rem', textAlign: 'center', maxWidth: '1100px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(3.5rem, 9vw, 5.5rem)', fontWeight: 950, letterSpacing: '-0.08em', lineHeight: 0.9, marginBottom: '2.5rem' }}>
            Why High-Revenue <br/>
            Agencies Choose <span style={{ background: 'linear-gradient(to right, #fff, var(--accent-teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SMTHIN'</span>
          </h1>
          <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }}>
            Get a 24/7 Digital Receptionist for just <b>$499/month</b>. <br/>
            No setup fees. No long-term contracts. Just results.
          </p>
        </section>

        {/* --- THE GUARANTEE --- */}
        <section style={{ padding: '4rem 2rem 10rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '56px', border: '1px solid rgba(255,255,255,0.08)', padding: '6rem 4rem',
            textAlign: 'center', backdropFilter: 'blur(40px)', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 5 }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(13, 148, 136, 0.1)', borderRadius: '24px', display: 'grid', placeContent: 'center', margin: '0 auto 3rem', border: '1px solid rgba(13, 148, 136, 0.3)' }}>
                <Shield size={40} color="var(--accent-teal)" />
              </div>
              <h2 style={{ fontSize: '3.8rem', fontWeight: 950, marginBottom: '2rem', letterSpacing: '-0.06em' }}>
                The 7-Day <br/>
                <span style={{ color: 'var(--accent-teal)' }}>"3-Booking" Guarantee</span>
              </h2>
              <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.7)', maxWidth: '750px', margin: '0 auto 5rem', lineHeight: 1.7 }}>
                Only <b>$499/month</b>. If your Digital Receptionist doesn't book at least 3 appointments for your business in the first 7 days, we will issue a 100% refund.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                <EliteCard icon={<Clock size={28} />} title="No Setup Fee" desc="Start for $499/month with zero upfront costs. We build and launch your custom agent for free." />
                <EliteCard icon={<Trophy size={28} />} title="Performance First" desc="We don't count leads—we count booked jobs. If we don't deliver, you don't pay a penny." />
                <EliteCard icon={<Banknote size={28} />} title="Instant Refund" desc="Commit to a plan and change your mind? Our 1-click refund system returns your money immediately." />
              </div>
            </div>
          </div>
        </section>



        {/* --- PREMIUM FOOTER --- */}
        <PremiumFooter />
      </div>

      {/* --- LEAD MODAL --- */}
      {showLeadForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="glass-panel animate-fade-up" style={{ width: '90%', maxWidth: '550px', padding: '4rem', borderRadius: '48px', background: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(40px)', position: 'relative' }}>
            <button onClick={() => setShowLeadForm(false)} style={{ position: 'absolute', top: '2.5rem', right: '2.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={28} /></button>
            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ width: '100px', height: '100px', background: 'rgba(13, 148, 136, 0.1)', borderRadius: '50%', display: 'grid', placeContent: 'center', margin: '0 auto 2.5rem', border: '1px solid rgba(13, 148, 136, 0.3)' }}>
                  <CheckCircle2 size={50} color="var(--accent-teal)" />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '1.25rem' }}>Success!</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>Our team will contact you within 24 hours to initiate your trial.</p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '2.2rem', fontWeight: 950, textAlign: 'center', marginBottom: '1rem' }}>Claim Your Offer</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '2rem' }}>Only $499/month. Zero setup fees.</p>
                <input type="text" required placeholder="Business Name" className="premium-input" style={{ width: '100%' }} />
                <input type="email" required placeholder="Work Email" className="premium-input" style={{ width: '100%' }} />
                <button type="submit" className="btn-primary" style={{ height: '64px', fontWeight: 900, borderRadius: '18px' }}>Initiate My Trial <ArrowRight size={22} /></button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const EliteCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '3.5rem 2.5rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ color: 'var(--accent-teal)', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <h4 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.25rem' }}>{title}</h4>
    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.7 }}>{desc}</p>
  </div>
);

export default WhyChooseUsPage;
