import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <p style={{ color: 'var(--text2)', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--accent)', fontSize: '0.95rem', fontWeight: 700 }}>
          {payload[0].value} {payload[0].value === 1 ? 'Drug' : 'Drugs'}
        </p>
      </div>
    );
  }
  return null;
};

const STATS_META = [
  { key: 'totalDrugs',            label: 'Total Drugs',            Icon: Icon.Pill,         cls: 'si-blue',   trend: '+4% this wk',  trendCls: 'trend-up' },
  { key: 'totalInteractions',     label: 'Interactions',           Icon: Icon.Alert,        cls: 'si-amber',  trend: 'High Alert',   trendCls: 'trend-warning' },
  { key: 'totalIngredients',      label: 'Active Ingredients',     Icon: Icon.Ingredient,   cls: 'si-green',  trend: 'Stable',       trendCls: 'trend-stable' },
  { key: 'totalSideEffects',      label: 'Side Effects',           Icon: Icon.Stethoscope,  cls: 'si-red',    trend: '2 Critical',   trendCls: 'trend-down' },
  { key: 'totalCompounds',        label: 'Compounds',              Icon: Icon.Molecule,     cls: 'si-purple', trend: 'Updated today', trendCls: 'trend-stable' },
  { key: 'totalContraindications',label: 'Contraindications',      Icon: Icon.Shield,       cls: 'si-teal',   trend: '+1 New',       trendCls: 'trend-up' },
];

const PIE_COLORS = ['#38BDF8', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [classes, setClasses] = useState([]);
  const [sev, setSev]         = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/dashboard'),
      axios.get('http://localhost:5000/api/classes'),
      axios.get('http://localhost:5000/api/sideeffects'),
      axios.get('http://localhost:5000/api/auditlog'),
    ]).then(([s, c, se, act]) => {
      setStats(s.data);
      setClasses(c.data);
      
      const counts = { Mild: 0, Moderate: 0, Severe: 0 };
      se.data.forEach(r => { if (counts[r.Severity] !== undefined) counts[r.Severity]++; });
      setSev(Object.entries(counts).map(([name, value]) => ({ name, value })));
      
      setActivities(act.data.slice(0, 5)); // Get latest 5 activities
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getRelativeTime = (timeStr) => {
    if (!timeStr) return '—';
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 600);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getActionText = (act) => {
    const brand = act.Brand_Name || 'Drug record';
    if (act.Action === 'INSERT') return `New drug registry added: ${brand}`;
    if (act.Action === 'UPDATE') {
      if (brand.startsWith('Changed from:')) return brand;
      return `Registry details updated for ${brand}`;
    }
    if (act.Action === 'DELETE') return `Drug profile deleted: ${brand}`;
    return `${act.Action} performed on ${brand}`;
  };

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Premium Welcome Banner */}
      <div className="welcome-banner" style={{
        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
        border: '1.5px solid var(--border)',
        borderRadius: 16,
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            Welcome to PharmaDB
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.88rem', fontWeight: 500 }}>
            Clinical Safety & Drug Composition Registry Console is fully synchronized.
          </p>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(4px)',
          border: '1.5px solid var(--border)',
          borderRadius: 12,
          padding: '10px 16px',
          textAlign: 'right',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--text2)'
        }}>
          <div>📅 LOGGED IN AS</div>
          <div style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 800, marginTop: 2 }}>System Admin</div>
        </div>
      </div>

      {/* Grid statistics */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {STATS_META.map(s => (
          <div className="stat-card" key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className={`stat-icon-wrap ${s.cls}`}><s.Icon /></div>
              <div>
                <div className="stat-value">{stats?.[s.key] ?? '—'}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
            <div className={`trend-badge ${s.trendCls}`} style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: 6,
              background: s.trendCls === 'trend-up' ? 'var(--green-bg)' : s.trendCls === 'trend-down' ? 'var(--red-bg)' : s.trendCls === 'trend-warning' ? 'var(--amber-bg)' : 'var(--surface2)',
              color: s.trendCls === 'trend-up' ? 'var(--green)' : s.trendCls === 'trend-down' ? 'var(--red)' : s.trendCls === 'trend-warning' ? 'var(--amber)' : 'var(--text2)'
            }}>
              {s.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid" style={{ gap: 16 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-label"><Icon.ChartBar />Drugs by Therapeutic Class</div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classes} barSize={26} margin={{ left: -15, bottom: 5 }}>
                <XAxis dataKey="Class_Name" tick={{ fill: '#8A93B0', fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#8A93B0', fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.03)' }} />
                {/* Visual enhancement: Bar has dual gradient colors */}
                <Bar dataKey="Drug_Count" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-label"><Icon.Stethoscope />Side Effects by Severity</div>
          <div style={{ width: '100%', height: 240, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sev} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={78} innerRadius={48} paddingAngle={3}>
                  {sev.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend verticalAlign="bottom" height={36} formatter={v => <span style={{ color: 'var(--text2)', fontSize: '0.78rem', fontWeight: 600 }}>{v}</span>} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dynamic Activity Feed Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="chart-label"><Icon.Log />Recent Audit & Operations Stream</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {activities.length === 0 ? (
            <div className="none-text" style={{ padding: '20px 0', textAlign: 'center' }}>No recent database actions logged.</div>
          ) : (
            activities.map((act, index) => {
              const actionClass = act.Action === 'INSERT' ? 'audit-action-insert' : act.Action === 'UPDATE' ? 'audit-action-update' : 'audit-action-delete';
              return (
                <div key={act.Log_ID} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderBottom: index === activities.length - 1 ? 'none' : '1.5px solid var(--border)',
                  background: index % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
                  borderRadius: 8,
                  fontSize: '0.88rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <span className={`badge ${actionClass}`} style={{ textTransform: 'uppercase', fontSize: '0.66rem', padding: '2px 8px' }}>
                      {act.Action}
                    </span>
                    <span style={{
                      fontWeight: 600,
                      color: 'var(--text2)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '85%'
                    }}>
                      {getActionText(act)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--text3)',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    marginLeft: 12
                  }}>
                    <Icon.Clock style={{ width: 12, height: 12 }} />
                    {getRelativeTime(act.Action_Time)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
