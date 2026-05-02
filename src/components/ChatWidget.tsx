import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Minus, Maximize2 } from 'lucide-react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY;
const SYSTEM_CONTEXT = `You are Smthin' Help AI, the assistant for SMTHIN' AI. 
SMTHIN' AI provides a 24/7 Digital Receptionist for all service-based businesses that rely on phone calls and appointments.

WE SERVE: 
Dental practices, Medical offices, Med Spas, HVAC companies, Plumbers, Law firms, and any business that misses revenue when they miss a call.

STRICT CONSTRAINTS:
1. BE EXTREMELY CONCISE. Answer only what is asked. No fluff.
2. SYMBOL BAN: Never use these symbols: * [ ] { } < >. No markdown.
3. Keep responses to 1-2 short sentences whenever possible.

KEY BUSINESS DATA:
- PRICING: Flat $499 per month. No setup fees.
- GUARANTEE: 3 bookings in month 1 or full refund.
- AVAILABILITY: 24/7/365. Handles infinite calls.
- INTEGRATION: Works with Google Calendar and major scheduling/EHR systems.
- HOW TO START: Click the "Start 7-Day Free Trial" button on this page.
- EMAIL: hi@smthin.com`;

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Smthin' Help AI. How can I help you automate your practice's phone lines today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://smthin.app',
          'X-Title': 'Smthin AI Assistant',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            { role: 'system', content: SYSTEM_CONTEXT },
            ...messages.map(m => ({
              role: m.role,
              content: m.content
            })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Request Failed');
      }

      const data = await response.json();
      const assistantResponse = data.choices?.[0]?.message?.content || "I'm sorry, I'm having trouble thinking clearly right now. Please try again.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
    } catch (error: any) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered a connection issue. Please check your network or email hi@smthin.com." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
        <div style={{ 
          background: 'white', 
          color: '#0f1115', 
          padding: '8px 16px', 
          borderRadius: '14px', 
          fontSize: '0.85rem', 
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          position: 'relative',
          animation: 'float 3s ease-in-out infinite',
          whiteSpace: 'nowrap'
        }}>
          Let me help!
          <div style={{ 
            position: 'absolute', 
            bottom: '-6px', 
            right: '24px', 
            width: '12px', 
            height: '12px', 
            background: 'white', 
            transform: 'rotate(45deg)' 
          }} />
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--accent-teal)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 32px rgba(13, 148, 136, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="hover-scale pulse-teal"
        >
          <MessageSquare size={28} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: isMinimized ? '200px' : '400px',
      height: isMinimized ? '60px' : '600px',
      maxHeight: '80vh',
      background: 'rgba(15, 17, 21, 0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 9999,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        padding: '16px 20px',
        background: 'rgba(13, 148, 136, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Sparkles size={18} color="var(--accent-teal)" />
            <div style={{ 
              position: 'absolute', bottom: -2, right: -2, width: '8px', height: '8px', 
              background: '#22c55e', borderRadius: '50%', border: '2px solid #0f1115' 
            }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>Smthin' Help AI</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
            {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div 
            ref={scrollRef}
            style={{
              flex: 1,
              padding: '24px 20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              scrollBehavior: 'smooth'
            }}
          >
            {messages.map((m, i) => (
              <div 
                key={i} 
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  borderRadius: m.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  background: m.role === 'user' ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                  color: m.role === 'user' ? 'white' : 'rgba(255,255,255,0.9)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.content}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role === 'assistant' ? "Smthin' AI" : 'You'}
                </span>
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--accent-teal)', fontSize: '0.85rem' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          <form 
            onSubmit={handleSendMessage}
            style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              gap: '12px'
            }}
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-teal)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--accent-teal)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (!input.trim() || isLoading) ? 0.5 : 1,
                transition: 'transform 0.2s'
              }}
              className="hover-scale"
            >
              <Send size={20} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
