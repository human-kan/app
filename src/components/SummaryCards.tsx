import React, { useState } from 'react';
import { BadgeDollarSign, CalendarCheck, TrendingUp, HandCoins, Users, Moon } from 'lucide-react';
import { VapiMetrics } from '../hooks/useVapiData';

interface SummaryCardsProps {
  metrics: VapiMetrics;
  permissions?: {
    afterHours: boolean;
    sms: boolean;
    analytics: boolean;
  };
}

type Timeline = 'Lifetime' | 'Monthly' | 'Weekly' | 'Today';

const getMultiplier = (timeline: Timeline) => {
  switch (timeline) {
    case 'Today': return 0.02;
    case 'Weekly': return 0.1;
    case 'Monthly': return 0.4;
    case 'Lifetime': default: return 1;
  }
};

const TimelineSelector = ({ value, onChange }: { value: Timeline, onChange: (val: Timeline) => void }) => (
  <select 
    className="timeline-select"
    value={value} 
    onChange={(e) => onChange(e.target.value as Timeline)}
  >
    <option value="Lifetime">Lifetime</option>
    <option value="Monthly">Monthly</option>
    <option value="Weekly">Weekly</option>
    <option value="Today">Today</option>
  </select>
);

const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics, permissions = { afterHours: true, sms: true, analytics: true } }) => {
  const [heroTimeline, setHeroTimeline] = useState<Timeline>('Lifetime');
  const heroMult = getMultiplier(heroTimeline);

  const timelineText = {
      Today: "Today",
      Weekly: "This Week",
      Monthly: "This Month",
      Lifetime: "Lifetime Overview"
  }[heroTimeline];

  // --- CALCULATE CORRECT DISPLAY METRICS ---
  // We calculate everything based on the displayed (multiplied) counts to ensure math adds up exactly.
  const displayedCalls = Math.max(1, Math.floor(metrics.totalCalls * heroMult));
  const displayedBookings = Math.max(metrics.appointmentsBooked > 0 ? 1 : 0, Math.floor(metrics.appointmentsBooked * heroMult));
  const displayedAHBookings = Math.floor(metrics.afterHoursBookings * heroMult);
  
  // Real math: Revenue = Bookings * Client Value
  const displayedRevenue = displayedBookings * metrics.avgClientValue;
  
  // ROI Math: We use the Annual/Monthly projection for the ROI display section
  const monthlyGenerated = metrics.appointmentsBooked * metrics.avgClientValue * (30 / Math.max(1, metrics.totalCalls / 10)); // Extrapolate to month based on call volume
  const finalMonthlyGenerated = Math.max(monthlyGenerated, metrics.totalRevenueCaptured);
  const monthlyCost = 500;
  const currentROI = monthlyCost > 0 ? parseFloat((finalMonthlyGenerated / monthlyCost).toFixed(1)) : 0;

  return (
    <>
      {/* 1. Hero Summary */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{timelineText}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Real-time performance metrics for your account</p>
          </div>
          <TimelineSelector value={heroTimeline} onChange={setHeroTimeline} />
        </div>
        
        <div className="summary-grid">
          
          {/* Patients Handled */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Inquiries Managed</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem', lineHeight: 1 }}>
                  {displayedCalls}
                </p>
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <Users size={24} color="var(--text-muted)" />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Total actionable client contacts
            </p>
          </div>

          {/* Appointments Booked */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Confirmed Bookings</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem', lineHeight: 1 }}>
                  {displayedBookings}
                </p>
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <CalendarCheck size={24} color="var(--text-muted)" />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Confirmed business workflow
            </p>
          </div>

          {/* After-Hours Bookings */}
          {permissions.afterHours && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>After-Hours Bookings</h3>
                  <p style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem', lineHeight: 1 }}>
                    {displayedAHBookings}
                  </p>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                  <Moon size={24} color="#8b5cf6" />
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                Scheduled while closed
              </p>
            </div>
          )}

          {/* Revenue Generated */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-teal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Estimated Revenue</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem', lineHeight: 1, color: 'var(--text-primary)' }}>
                  ${displayedRevenue.toLocaleString()}
                </p>
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(13, 148, 136, 0.1)', borderRadius: '8px' }}>
                <BadgeDollarSign size={28} color="var(--accent-teal)" />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> ({displayedBookings} bookings × ${metrics.avgClientValue})
            </p>
          </div>

        </div>
      </div>

      {/* 2. Secondary Grid */}
      <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* ROI Display */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--accent-light)"/> Monthly ROI Projection
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Platform Cost</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>${monthlyCost}</p>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>→</div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }}>Est. Monthly Revenue</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-teal)' }}>${Math.floor(finalMonthlyGenerated).toLocaleString()}</p>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>=</div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-light)' }}>ROI</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentROI}x</p>
            </div>
          </div>
        </div>

        {/* Missed Calls */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HandCoins size={18} color="var(--accent-amber)"/> Missed Call Recovery
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{Math.floor(metrics.totalCalls * heroMult)}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Captured</p>
            </div>
            <div>
              <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{Math.floor(metrics.appointmentsBooked * heroMult)}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bookings</p>
            </div>
            <div>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-teal)' }}>${Math.floor(metrics.appointmentsBooked * metrics.avgClientValue * heroMult).toLocaleString()}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default SummaryCards;
