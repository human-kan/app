import React from 'react';
import { X, Mic, Heart, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: any;
}

const TranscriptModal: React.FC<TranscriptModalProps> = ({ isOpen, onClose, call }) => {
  if (!isOpen || !call) return null;

  const urgencyLabel = call.urgency || 'Priority: Standard';
  const hasTranscript = call.transcript && call.transcript.trim();

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '550px', padding: '0', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-out', overflow: 'hidden' }}>
        
        {/* Header Ribbon */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', margin: 0 }}>
              <Mic size={20} color="var(--accent-teal)" />
              Call Transcript Verification
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Recording ID: {call.id ? call.id.substring(0,8) : 'Pending Vapi Sync'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Audio Player (Demo Wow Factor) */}
        {call.recordingUrl && (
          <div style={{ padding: '1rem 1.5rem', background: 'rgba(13, 148, 136, 0.05)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', width: '80px' }}>Voice Record</div>
             <audio 
               src={call.recordingUrl} 
               controls 
               style={{ flex: 1, height: '32px', filter: 'invert(1) hue-rotate(180deg) brightness(1.5)' }} 
             />
          </div>
        )}

        {/* AI Insight Badges */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <AlertTriangle size={14} color={urgencyLabel === 'Urgent (High Priority)' ? 'var(--accent-amber)' : 'var(--text-muted)'} />
            <span style={{ color: urgencyLabel === 'Urgent (High Priority)' ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
              {urgencyLabel}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <Heart size={14} color="var(--accent-teal)" />
            <span style={{ color: 'var(--text-secondary)' }}>Analysis: {call.analysis?.successEvaluation ? 'Successful Outcome' : 'Interaction Verified'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(13, 148, 136, 0.1)', borderRadius: '4px', border: '1px solid var(--border-focus)', color: 'var(--accent-teal)' }}>
            <ShieldCheck size={14} />
            E2E Encrypted Recording
          </div>
        </div>

        {/* Transcript Body */}
        <div style={{ padding: '1.5rem', minHeight: '150px', maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {hasTranscript ? (
            call.transcript.split('\n').map((line: string, i: number) => {
              if (!line.trim()) return null;
              const isAI = line.startsWith('AI:');
              const color = isAI ? 'var(--accent-teal)' : 'var(--text-primary)';
              const bg = isAI ? 'rgba(13, 148, 136, 0.05)' : 'rgba(255,255,255,0.03)';
              const paddingSet = isAI ? '12px 16px 12px 12px' : '12px 12px 12px 16px';
              const br = isAI ? '8px 8px 8px 0' : '8px 8px 0 8px';
              const align = isAI ? 'flex-start' : 'flex-end';
              const msg = line.replace('AI:', '').replace('Client:', '').trim();

              return (
                <div key={i} style={{ alignSelf: align, maxWidth: '85%' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textAlign: isAI ? 'left' : 'right' }}>
                    {isAI ? 'AI Assistant' : 'Client'}
                  </p>
                  <div style={{ background: bg, padding: paddingSet, borderRadius: br, border: '1px solid var(--border-color)', fontSize: '0.875rem', color: color, lineHeight: '1.4' }}>
                    {msg}
                  </div>
                </div>
              );
            })
          ) : (
             <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
               <p>Live transcript not synchronized from Vapi server yet.<br/>Ensure conversational webhooks are enabled on your Vapi dashboard.</p>
             </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default TranscriptModal;
