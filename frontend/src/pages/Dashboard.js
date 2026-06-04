import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const TT = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{ background: '#fff', border: '1px solid #E4E7EF', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
    <p style={{ color: '#4A5578', marginBottom: 2 }}>{label}</p>
    <p style={{ color: '#2563EB', fontWeight: 700 }}>{payload[0].value}</p>
  </div>
) : null;

const STATS = [
  { key: 'totalDrugs',            label: 'Total Drugs',            Icon: Icon.Pill,         cls: 'si-blue'   },
  { key: 'totalInteractions',     label: 'Interactions',           Icon: Icon.Alert,        cls: 'si-amber'  },
  { key: 'totalIngredients',      label: 'Active Ingredients',     Icon: Icon.Ingredient,   cls: 'si-green'  },
  { key: 'totalSideEffects',      label: 'Side Effects',           Icon: Icon.Stethoscope,  cls: 'si-red'    },
  { key: 'totalCompounds',        label: 'Compounds',              Icon: Icon.Molecule,     cls: 'si-purple' },
  { key: 'totalContraindications',label: 'Contraindications',      Icon: Icon.Shield,       cls: 'si-teal'   },
];

const PIE_COLORS = ['#D97706', '#F97316', '#DC2626'];

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [classes, setClasses] = useState([]);
  const [sev, setSev]         = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/dashboard'),
      axios.get('http://localhost:5000/api/classes'),
      axios.get('http://localhost:5000/api/sideeffects'),
    ]).then(([s, c, se]) => {
      setStats(s.data);
      setClasses(c.data);
      const counts = { Mild: 0, Moderate: 0, Severe: 0 };
      se.data.forEach(r => { if (counts[r.Severity] !== undefined) counts[r.Severity]++; });
      setSev(Object.entries(counts).map(([name, value]) => ({ name, value })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Icon.Dashboard />Dashboard</div>
          <div className="page-sub">Overview of the Pharmaceutical Drug Management System</div>
        </div>
      </div>

      <div className="stats-grid">
        {STATS.map(s => (
          <div className="stat-card" key={s.key}>
            <div className={`stat-icon-wrap ${s.cls}`}><s.Icon /></div>
            <div>
              <div className="stat-value">{stats?.[s.key] ?? '—'}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="chart-label"><Icon.ChartBar />Drugs by Therapeutic Class</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classes} barSize={28} margin={{ left: -10 }}>
              <XAxis dataKey="Class_Name" tick={{ fill: '#8A93B0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#8A93B0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
              <Bar dataKey="Drug_Count" fill="#2563EB" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="chart-label"><Icon.Stethoscope />Side Effects by Severity</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sev} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={42}>
                {sev.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Legend formatter={v => <span style={{ color: '#4A5578', fontSize: '0.8rem' }}>{v}</span>} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E4E7EF', borderRadius: 8, fontSize: '0.82rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}