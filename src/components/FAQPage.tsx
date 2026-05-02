import React, { useState } from 'react';
import { ChevronLeft, HelpCircle, Plus, Minus, ArrowRight, Zap, X, Send } from 'lucide-react';
import Logo from './Logo';
import PremiumFooter from './PremiumFooter';

interface FAQPageProps {
  onBack: () => void;
  onGetAccessClick: () => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ onBack, onGetAccessClick }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const faqs = [
    {
      q: "Is there any setup charge?",
      a: "No, there is zero setup charge. You simply pay a flat monthly fee of $499/month for full access to your Digital Receptionist and the SMTHIN' AI Dashboard."
    },
    {
      q: "Do I have to replace my current receptionist?",
      a: "Absolutely not. Think of SMTHIN' AI as your fail-safe backup. It can act as a fallback system that catches every call your staff misses, or handles overflow during peak hours."
    },
    {
      q: "Does it book directly into my calendar?",
      a: "Yes. Our agents are deeply integrated with your existing calendar (Google, Outlook, etc.). The AI qualifies the lead, checks your availability, and books the appointment instantly."
    },
    {
      q: "Does it sound like a robot?",
      a: "Not at all. We use state-of-the-art LLMs and high-fidelity voice synthesis to ensure our agents are indistinguishable from a top-tier human receptionist."
    },
    {
      q: "Is it really available 24/7/365?",
      a: "Yes. Your AI employee never sleeps and works through every holiday, keeping your business open even when you are offline."
    },
    {
      q: "Is SMTHIN' AI right for my business?",
      a: "Absolutely. If your business ever misses calls, struggles with after-hours inquiries, or needs to automate appointment booking, SMTHIN' AI is built for you. It ensures you never lose revenue to an unanswered phone, no matter the time of day."
    }
  ];

  return (
    <div className="faq-page-container" style={{ 
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
        <section style={{ padding: '8.1875rem 2rem 8rem', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 10vw, 5.5rem)', fontWeight: 950, letterSpacing: '-0.07em', lineHeight: 0.9, marginBottom: '2.5rem' }}>
            Common <span style={{ color: 'var(--accent-teal)' }}>Questions.</span>
          </h1>
          <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.7)', maxWidth: '850px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
            Everything you need to know about deploying your Digital Receptionist.
          </p>
        </section>

        {/* --- FAQ --- */}
        <section style={{ padding: '2rem 2rem 10rem', maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="glass-panel" 
                style={{ 
                  borderRadius: '24px', 
                  border: openIndex === index ? '1px solid rgba(13, 148, 136, 0.3)' : '1px solid rgba(255,255,255,0.08)', 
                  background: openIndex === index ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)', 
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)} 
                  style={{ width: '100%', padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{faq.q}</span>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', background: openIndex === index ? 'rgba(13, 148, 136, 0.1)' : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease'
                  }}>
                    {openIndex === index ? <Minus size={18} color="var(--accent-teal)" /> : <Plus size={18} color="rgba(255,255,255,0.4)" />}
                  </div>
                </button>
                <div style={{ 
                  maxHeight: openIndex === index ? '300px' : '0', 
                  opacity: openIndex === index ? 1 : 0, 
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                  padding: openIndex === index ? '0 2.5rem 2.5rem' : '0 2.5rem', 
                  color: 'rgba(255,255,255,0.85)', 
                  lineHeight: 1.7,
                  fontSize: '1.05rem'
                }}>
                  <div style={{ padding: '1.5rem', background: 'rgba(13, 148, 136, 0.05)', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.1)' }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- PREMIUM FOOTER --- */}
        <PremiumFooter />
      </div>
    </div>
  );
};

export default FAQPage;
