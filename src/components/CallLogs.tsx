import React, { useState } from 'react';
import { PhoneOutgoing, PhoneIncoming, CheckCircle, Mic, Play, Heart, TrendingUp, Trash2 } from 'lucide-react';
import { VapiMetrics } from '../hooks/useVapiData';
import TranscriptModal from './TranscriptModal';

interface CallLogsProps {
  metrics: VapiMetrics;
}

const CallLogs: React.FC<CallLogsProps> = ({ metrics }) => {
  const { callLogs, loading, error, onUpdateSentiment, onDeleteCall } = metrics;
  const [selectedCall, setSelectedCall] = useState<any>(null);

  const handleOpenModal = (call: any) => setSelectedCall(call);
  const handleCloseModal = () => setSelectedCall(null);

  // --- 🧠 SENTIMENT ENGINE ---
  const getSentimentConfig = (label: string) => {
    switch (label) {
      case 'High Value': return { icon: <TrendingUp size={12} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'Scheduled': return { icon: <CheckCircle size={12} />, color: 'var(--accent-teal)', bg: 'rgba(13, 148, 136, 0.1)' };
      case 'Satisfied': default: return { icon: <Heart size={12} />, color: 'var(--accent-light)', bg: 'rgba(103, 232, 249, 0.1)' };
    }
  };

  const calculateAutoSentiment = (call: any) => {
    const summary = (call.summary || '').toLowerCase();
    const transcript = (call.transcript || '').toLowerCase();
    const highValueKeywords = ['policy', 'retainer', 'litigation', 'settlement', 'premium', 'coverage', 'contract', 'billing', 'payment', 'consultation', 'onboarding'];
    
    const isBooking = call.analysis?.successEvaluation === true || 
                       ['booked', 'appointment', 'schedule'].some(kw => summary.includes(kw));

    const isHighValue = highValueKeywords.some(kw => summary.includes(kw)) || 
                        highValueKeywords.some(kw => transcript.includes(kw));

    if (isHighValue) return 'High Value';
    if (isBooking) return 'Scheduled';
    return 'Satisfied';
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem' }}>Client Interaction Audit</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Verify AI performance and client sentiment | Secured & analyzed by SMTHIN' AI</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', padding: '0.5rem 1rem', background: 'rgba(13, 148, 136, 0.1)', borderRadius: '20px', color: 'var(--accent-teal)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-teal)', animation: 'pulse 2s infinite' }}></div>
          Biometric Voice Sync: Active
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem' }}>Date & Time</th>
              <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem' }}>Direction</th>
              <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem' }}>Contact Info</th>
              <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem' }}>Duration</th>
              <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem' }}>Audit / Sentiment</th>
              <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem', textAlign: 'right' }}>Analysis</th>
            </tr>
          </thead>
          <tbody>
            {!callLogs || callLogs.length === 0 ? (
               <tr>
                 <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                   {loading ? 'Fetching call logs...' : error ? error : 'No call logs found for this system.'}
                 </td>
               </tr>
            ) : (
              callLogs.map((call, index) => {
                const currentLabel = call.manualSentiment || calculateAutoSentiment(call);
                const config = getSentimentConfig(currentLabel);
                const hasRecording = !!call.recordingUrl;
                
                return (
                  <tr key={call.id || index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background-color 0.2s', ...({ ':hover': { backgroundColor: 'var(--bg-hover)' } } as any) }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {new Date(call.createdAt || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      {call.type === 'inboundPhoneCall' ? <PhoneIncoming size={16} color="var(--accent-light)" /> : <PhoneOutgoing size={16} color="var(--accent-teal)" />}
                      {call.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {call.customer?.number || 'Private Caller'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {((call.endedAt ? new Date(call.endedAt).getTime() - new Date(call.createdAt).getTime() : 120000) / 60000).toFixed(1)}m
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                          <span style={{ 
                            position: 'absolute',
                            left: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            pointerEvents: 'none',
                            color: config.color
                          }}>
                            {config.icon}
                          </span>
                          <select 
                            value={currentLabel}
                            onChange={(e) => onUpdateSentiment?.(call.id, e.target.value)}
                            style={{ 
                              appearance: 'none',
                              color: config.color, 
                              background: config.bg, 
                              padding: '4px 10px 4px 28px', 
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.02em',
                              border: '1px solid transparent',
                              cursor: 'pointer',
                              outline: 'none',
                              transition: 'all 0.2s'
                            }}
                          >
                            <option value="Satisfied">Satisfied</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="High Value">High Value</option>
                          </select>
                        </div>
                        {currentLabel === 'High Value' && <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>💰</span>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {hasRecording && (
                          <button 
                            onClick={() => window.open(call.recordingUrl, '_blank')}
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Play Recording"
                          >
                            <Play size={14} fill="currentColor" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenModal(call)}
                          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Mic size={14} /> Audit
                        </button>
                        <button 
                          onClick={() => onDeleteCall?.(call.id)}
                          style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                          title="Delete Log & Reset Stats"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedCall && (
        <TranscriptModal isOpen={!!selectedCall} onClose={handleCloseModal} call={selectedCall} />
      )}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(13, 148, 136, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
        }
      `}</style>
    </div>
  );
};

export default CallLogs;
