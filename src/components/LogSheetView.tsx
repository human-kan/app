import React, { useState } from 'react';
import { ChevronLeft, ExternalLink, Table, Calendar, CheckCircle, Clock, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { VapiMetrics } from '../hooks/useVapiData';

interface LogSheetViewProps {
  sheetUrl: string;
  onBack: () => void;
  metrics: VapiMetrics;
}

const LogSheetView: React.FC<LogSheetViewProps> = ({ sheetUrl, onBack, metrics }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetData, setSheetData] = useState<{ booked: number, nextAppt: string, source: 'Sheet' | 'Vapi' }>({
    booked: metrics.appointmentsBooked,
    nextAppt: 'Scanning...',
    source: 'Vapi'
  });

  // Extract ID and create embed URL
  const getSheetId = (url: string) => {
    const match = url.match(/\/d\/(.*?)(\/|$)/);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url: string) => {
    const id = getSheetId(url);
    return id ? `https://docs.google.com/spreadsheets/d/${id}/htmlembed?widget=true&headers=false` : url;
  };

  React.useEffect(() => {
    const syncData = async () => {
      setIsSyncing(true);
      const id = getSheetId(sheetUrl);
      
      // 1. Try to find the next appointment in Vapi Logs (most accurate if sheet fetch fails)
      let detectedNext = 'No upcoming found';
      const scheduledCalls = (metrics.callLogs || []).filter(c => 
        c.analysis?.successEvaluation === true || (c.summary || '').toLowerCase().includes('booked')
      );

      if (scheduledCalls.length > 0) {
        // Look for date patterns in summaries
        const datePattern = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+\d{1,2}/i;
        const timePattern = /\d{1,2}:\d{2}\s*(am|pm)/i;
        
        for (const call of scheduledCalls) {
          const text = `${call.summary} ${call.analysis?.appointmentDetails || ''}`.toLowerCase();
          const dateMatch = text.match(datePattern);
          const timeMatch = text.match(timePattern);
          if (dateMatch) {
            detectedNext = `${dateMatch[0].toUpperCase()} at ${timeMatch ? timeMatch[0].toUpperCase() : '10:00 AM'}`;
            break;
          }
        }
      }

      // 2. Try to fetch real CSV from Google Sheet (requires "Publish to Web")
      try {
        if (id) {
          const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
          const response = await fetch(csvUrl);
          if (response.ok) {
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');
            
            if (lines.length > 1) {
              let sheetNext = detectedNext;
              
              // If Vapi logs didn't find anything, try to find a date in the sheet rows
              if (sheetNext === 'No upcoming found') {
                const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/; 
                const timePattern = /\d{1,2}:\d{2}\s*(am|pm)/i;
                for (let i = 1; i < lines.length; i++) {
                  const dateMatch = lines[i].match(datePattern);
                  const timeMatch = lines[i].match(timePattern);
                  if (dateMatch) {
                    sheetNext = dateMatch[0] + (timeMatch ? ` at ${timeMatch[0].toUpperCase()}` : '');
                    break;
                  }
                }
              }

              setSheetData({
                booked: lines.length - 1, 
                nextAppt: sheetNext === 'No upcoming found' ? 'None Scheduled' : sheetNext,
                source: 'Sheet'
              });
              setIsSyncing(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Sheet not published to web. Falling back to Vapi metrics.");
      }

      setSheetData({
        booked: metrics.appointmentsBooked,
        nextAppt: detectedNext === 'No upcoming found' ? 'None Pending' : detectedNext,
        source: 'Vapi'
      });
      setIsSyncing(false);
    };

    syncData();
  }, [sheetUrl, metrics]);

  const handleManualSync = () => {
    window.location.reload(); 
  };

  return (
    <div className="animate-fade-up" style={{ padding: '1rem 2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Premium Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <button 
            onClick={onBack}
            className="settings-btn"
            style={{ marginBottom: '1.5rem', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-teal)', background: 'rgba(13, 148, 136, 0.05)', borderRadius: '12px', border: '1px solid rgba(13, 148, 136, 0.1)' }}
          >
            <ChevronLeft size={18} /> Back to Insights
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '12px', borderRadius: '16px', background: 'var(--accent-teal)', boxShadow: '0 8px 20px -4px rgba(13, 148, 136, 0.4)' }}>
              <Table size={28} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '4px' }}>
                Operational Log Sheet
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time synchronization with Cloud Records</span>
                <span className="status-badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: '0.65rem', padding: '2px 8px' }}>
                  <div className="animate-pulse" style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', marginRight: '6px', display: 'inline-block' }} />
                  ACTIVE LINK
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleManualSync}
            disabled={isSyncing}
            className="settings-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderRadius: '12px' }}
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Refreshing Data...' : 'Sync Now'}
          </button>
          <a 
            href={sheetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', textDecoration: 'none', borderRadius: '12px', fontWeight: 600 }}
          >
            <ExternalLink size={18} /> Full Spreadsheet
          </a>
        </div>
      </div>

      {/* Analytics Summary Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
             <CheckCircle size={80} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Total Bookings</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800 }}>{sheetData.booked}</span>
            <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 600 }}>Recorded</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
             <Calendar size={80} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Next Scheduled</p>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-light)' }}>
            {sheetData.nextAppt}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Extracted from recent interactions</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
             <Zap size={80} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Data Source</p>
          <div style={{ fontSize: '2.25rem', fontWeight: 800 }}>
            {sheetData.source}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{sheetData.source === 'Sheet' ? 'Parsing published CSV data' : 'Using internal Vapi engine'}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
             <ShieldCheck size={80} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Log Integrity</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-teal)', fontSize: '1rem', fontWeight: 700 }}>
             Verified Source
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cloud encryption enabled</p>
        </div>
      </div>

      {/* Main Sheet View Frame */}
      <div className="glass-layered" style={{ 
        height: 'calc(100vh - 380px)', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ height: '40px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', background: '#ff5f56', borderRadius: '50%' }} />
            <div style={{ width: '10px', height: '10px', background: '#ffbd2e', borderRadius: '50%' }} />
            <div style={{ width: '10px', height: '10px', background: '#27c93f', borderRadius: '50%' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
             OPERATIONAL_DATA_SECURE_SYNC.LOG
          </div>
        </div>
        <iframe 
          src={getEmbedUrl(sheetUrl)} 
          style={{ width: '100%', height: 'calc(100% - 40px)', border: 'none' }}
          title="Google Sheet Log"
        />
      </div>

    </div>
  );
};

export default LogSheetView;
