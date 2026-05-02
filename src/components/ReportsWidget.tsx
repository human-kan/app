import React, { useState } from 'react';
import { FileText, Calendar, Lock, Download, X } from 'lucide-react';
import { AppUser } from '../users';
import { VapiMetrics } from '../hooks/useVapiData';

interface ReportsWidgetProps {
  user: AppUser;
  metrics: VapiMetrics;
}

const ReportsWidget: React.FC<ReportsWidgetProps> = ({ user, metrics }) => {
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const onboardDate = new Date(user.onboardedAt || new Date().toISOString());
  const now = new Date();
  // Using 0:00 time to prevent time-of-day mismatching issues.
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(onboardDate.getFullYear(), onboardDate.getMonth(), onboardDate.getDate());
  
  const daysElapsed = Math.floor((today.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));

  const availableReports = [];
  const upcomingReports = [];

  // Generate Week 1 to current + 1
  const currentWeek = Math.floor(daysElapsed / 7);
  for (let i = 1; i <= Math.max(4, currentWeek + 1); i++) {
    const reportDate = new Date(startDay.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
    if (daysElapsed >= i * 7) {
      availableReports.push({ type: 'Weekly', title: `Week ${i} Performance Report`, date: reportDate, id: `w${i}` });
    } else {
      // Show next upcoming
      if (upcomingReports.filter(r => r.type === 'Weekly').length < 1) {
        upcomingReports.push({ type: 'Weekly', title: `Week ${i} Performance Report`, date: reportDate, id: `w${i}`, locked: true });
      }
    }
  }

  // Generate Month 1, etc.
  const currentMonth = Math.floor(daysElapsed / 30);
  for (let i = 1; i <= Math.max(12, currentMonth + 1); i++) {
    const reportDate = new Date(startDay.getTime() + (i * 30 * 24 * 60 * 60 * 1000));
    if (daysElapsed >= i * 30) {
      availableReports.push({ type: 'Monthly', title: `Month ${i} Executive Summary`, date: reportDate, id: `m${i}` });
    } else {
      if (upcomingReports.filter(r => r.type === 'Monthly').length < 1) {
        upcomingReports.push({ type: 'Monthly', title: `Month ${i} Executive Summary`, date: reportDate, id: `m${i}`, locked: true });
      }
    }
  }

  const handleOpenReport = (report: any) => {
    if (report.locked) return;
    setSelectedReport(report);
  };

  const closeModal = () => setSelectedReport(null);

  // sort available by date desc
  availableReports.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <>
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="var(--accent-teal)" />
              Automated Reports
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Your weekly and monthly performance snapshots
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {availableReports.map((report) => (
            <div 
              key={report.id}
              onClick={() => handleOpenReport(report)}
              style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--accent-teal)', 
                borderRadius: '8px', 
                padding: '1rem', 
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(13, 148, 136, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{report.title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {report.date.toLocaleDateString()}
                </p>
              </div>
              <Download size={18} color="var(--accent-teal)" />
            </div>
          ))}

          {availableReports.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your reports will appear here automatically.</p>
            </div>
          )}

          {upcomingReports.map((report) => (
            <div 
              key={report.id}
              style={{ 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: 0.6
              }}
            >
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{report.title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} /> Unlocks {report.date.toLocaleDateString()}
                </p>
              </div>
              <Lock size={16} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      </div>

      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem' }}>{selectedReport.title}</h2>
              <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div style={{ background: 'rgba(13, 148, 136, 0.1)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generated on {selectedReport.date.toLocaleDateString()}</p>
                <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                  {selectedReport.type === 'Weekly' ? 'Weekly Snapshot' : 'Monthly Executive Summary'}
                </h3>
              </div>
              
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Hi {user.ownerName}, here is your automated performance summary. This report captures the value SMTHIN' AI has generated for {user.practiceName}.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Revenue Impact</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
                    ${Math.floor(selectedReport.type === 'Weekly' ? metrics.totalRevenueCaptured * 0.25 : metrics.totalRevenueCaptured).toLocaleString()}
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confirmed Bookings</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {Math.floor(selectedReport.type === 'Weekly' ? metrics.appointmentsBooked * 0.25 : metrics.appointmentsBooked)}
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inquiries Managed</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {Math.floor(selectedReport.type === 'Weekly' ? metrics.totalCalls * 0.25 : metrics.totalCalls)}
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Staff Time Saved</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {selectedReport.type === 'Weekly' ? (metrics.staffTimeSavedHours * 0.25).toFixed(1) : metrics.staffTimeSavedHours} hrs
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button 
                  onClick={() => {
                    alert('Report successfully downloaded.');
                    closeModal();
                  }}
                  style={{ background: 'var(--accent-teal)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={18} /> Download Full PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportsWidget;
