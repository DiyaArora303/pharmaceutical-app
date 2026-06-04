import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';

function Modal({ onClose, onSuccess }) {
  const [drugs, setDrugs] = useState([]);
  const [form, setForm]   = useState({ Drug_ID: '', Description: '', Severity: 'Mild' });

  useEffect(() => { axios.get('http://localhost:5000/api/drugs').then(r => setDrugs(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/sideeffects', form);
    onSuccess('Side effect added'); onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title"><Icon.Stethoscope />Add Side Effect</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          <div className="field">
            <label>Drug *</label>
            <select required value={form.Drug_ID} onChange={e => setForm({ ...form, Drug_ID: e.target.value })}>
              <option value="">Select drug...</option>
              {drugs.map(d => <option key={d.Drug_ID} value={d.Drug_ID}>{d.Brand_Name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Description *</label>
            <input required placeholder="e.g. Nausea, Headache..." value={form.Description} onChange={e => setForm({ ...form, Description: e.target.value })} />
          </div>
          <div className="field">
            <label>Severity *</label>
            <select value={form.Severity} onChange={e => setForm({ ...form, Severity: e.target.value })}>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Icon.Check />Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SideEffects({ user }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('All');
  const [showModal, setModal] = useState(false);
  const [toast, setToast]     = useState('');
  const isAdmin = user.role === 'admin';

  const load = () => axios.get('http://localhost:5000/api/sideeffects').then(r => { setData(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const badgeCls = s => s === 'Severe' ? 'badge-red' : s === 'Moderate' ? 'badge-amber' : 'badge-green';
  const filtered = filter === 'All' ? data : data.filter(r => r.Severity === filter);

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Icon.Stethoscope />Side Effects</div>
          <div className="page-sub">Adverse reactions categorised by severity — {data.length} recorded</div>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setModal(true)}><Icon.Plus />Add Side Effect</button>}
      </div>
      <div className="tabs">
        {['All', 'Mild', 'Moderate', 'Severe'].map(s => (
          <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s}{s !== 'All' && ` (${data.filter(r => r.Severity === s).length})`}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Drug</th><th>Side Effect</th><th>Severity</th></tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td><strong>{r.Brand_Name}</strong></td>
                  <td>{r.Description}</td>
                  <td><span className={`badge ${badgeCls(r.Severity)}`}>{r.Severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <Modal onClose={() => setModal(false)} onSuccess={(m) => { flash(m); load(); }} />}
      {toast && <div className="toast"><Icon.Check />{toast}</div>}
    </div>
  );
}