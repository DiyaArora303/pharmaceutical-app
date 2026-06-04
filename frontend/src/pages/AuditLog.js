import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';

export default function AuditLog() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');

  useEffect(() => {
    axios.get('http://localhost:5000/api/auditlog').then(r => { setData(r.data); setLoading(false); });
  }, []);

  const badgeCls  = a => a === 'INSERT' ? 'badge-green' : a === 'UPDATE' ? 'badge-amber' : 'badge-red';
  const filtered  = filter === 'ALL' ? data : data.filter(r => r.Action === filter);
  const fmt       = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading audit log...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Icon.Log />Audit Log</div>
          <div className="page-sub">Complete history of all drug record modifications — last 100 entries</div>
        </div>
      </div>

      <div className="tabs">
        {['ALL', 'INSERT', 'UPDATE', 'DELETE'].map(a => (
          <button key={a} className={`tab ${filter === a ? 'active' : ''}`} onClick={() => setFilter(a)}>
            {a}{a !== 'ALL' && ` (${data.filter(r => r.Action === a).length})`}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Log ID</th><th>Drug ID</th><th>Record</th><th>Action</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state"><Icon.Log /><p>No log entries</p></div>
                </td></tr>
              ) : filtered.map(r => (
                <tr key={r.Log_ID}>
                  <td className="mono" style={{ color: 'var(--text3)' }}>#{r.Log_ID}</td>
                  <td className="mono">{r.Drug_ID}</td>
                  <td style={{ maxWidth: 360 }}><strong>{r.Brand_Name}</strong></td>
                  <td><span className={`badge ${badgeCls(r.Action)}`}>{r.Action}</span></td>
                  <td style={{ color: 'var(--text3)', fontSize: '0.82rem' }}><Icon.Clock style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />{fmt(r.Action_Time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}