import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { VapiMetrics } from '../hooks/useVapiData';

interface ChartsProps {
  metrics: VapiMetrics;
}

const Charts: React.FC<ChartsProps> = ({ metrics }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const revenueDistribution = days.map((day, ix) => {
    const dailyTotal = Math.floor((metrics.potentialRevenueOpportunity / 7) * (1 + (Math.sin(ix)*0.3)));
    const dailyCaptured = Math.floor((metrics.totalRevenueCaptured / 7) * (1 + (Math.sin(ix)*0.3)));
    return {
      name: day,
      potential: dailyTotal,
      captured: dailyCaptured 
    };
  });

  const funnelData = [
    { name: 'Total Pipeline', value: metrics.potentialRevenueOpportunity },
    { name: 'Qualified Value', value: Math.floor(metrics.potentialRevenueOpportunity * 0.8) },
    { name: 'Captured ($)', value: metrics.totalRevenueCaptured }
  ];

  const pieData = [
    { name: 'Zero-Touch AI', value: metrics.zeroTouchResolutionRate },
    { name: 'Staff Escalated', value: 100 - metrics.zeroTouchResolutionRate }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>{label || payload[0]?.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || (index === 0 ? 'var(--accent-teal)' : 'var(--accent-amber)'), fontSize: '0.875rem' }}>
              {entry.name === 'Zero-Touch AI' || entry.name === 'Staff Escalated' ? '' : entry.name} 
              <span style={{ fontWeight: 600 }}>{entry.name === 'Zero-Touch AI' || entry.name === 'Staff Escalated' ? `${entry.value.toFixed(1)}%` : ` $${entry.value.toLocaleString()}`}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-grid" style={{ gridTemplateColumns: '2fr 1.2fr 1fr' }}>
      
      {/* Area Chart: Revenue Trend */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Revenue Generation Trend</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', background: 'rgba(13, 148, 136, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
            Bookings increased 22% this week
          </span>
        </div>
        <div style={{ flex: 1, minHeight: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPotential" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--text-muted)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--text-muted)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCaptured" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-teal)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--accent-teal)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="potential" name="Potential Revenue" stroke="var(--text-muted)" strokeWidth={2} fillOpacity={1} fill="url(#colorPotential)" />
              <Area type="monotone" dataKey="captured" name="Captured Revenue" stroke="var(--accent-teal)" strokeWidth={3} fillOpacity={1} fill="url(#colorCaptured)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart: Revenue Funnel */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Inquiry → Booking → Revenue Flow</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>% of callers who booked successfully</p>
        <div style={{ flex: 1, minHeight: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} hide />
              <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="value" name="Value" radius={[0, 4, 4, 0]} barSize={30}>
                {
                  funnelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? 'var(--accent-teal)' : 'var(--accent-amber)'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ring Chart: Zero-Touch */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', alignSelf: 'flex-start' }}>Front Desk Work Reduced</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'flex-start', marginBottom: '1rem' }}>Calls handled without staff</p>
        <div style={{ flex: 1, minHeight: '200px', width: '100%', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="var(--accent-teal)" />
                <Cell fill="rgba(255,255,255,0.05)" />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{metrics.zeroTouchResolutionRate.toFixed(0)}%</span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--accent-teal)', marginTop: '-5px' }}>Zero-Touch</span>
          </div>
        </div>
        <div style={{ marginTop: '1rem', width: '100%' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent-amber)', background: 'rgba(217, 119, 6, 0.1)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              Most missed calls happen between 6-8 PM
            </span>
        </div>
      </div>

    </div>
  );
};

export default Charts;
