import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';

function Modal({ onClose, onSuccess }) {
  const [drugs, setDrugs] = useState([]);
  const [form, setForm]   = useState({ Condition_Name: '', Drug_ID: '' });

  useEffect(() => { axios.get('http://localhost:5000/api/drugs').then(r => setDrugs(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/contraindications', form);
    onSuccess('Contraindication added'); onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title"><Icon.Shield />Add Contraindication</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          <div className="field">
            <label>Condition Name *</label>
            <input required placeholder="e.g. Liver Disease, Pregnancy..." value={form.Condition_Name} onChange={e => setForm({ ...form, Condition_Name: e.target.value })} />
          </div>
          <div className="field">
            <label>Link to Drug (optional)</label>
            <select value={form.Drug_ID} onChange={e => setForm({ ...form, Drug_ID: e.target.value })}>
              <option value="">None</option>
              {drugs.map(d => <option key={d.Drug_ID} value={d.Drug_ID}>{d.Brand_Name}</option>)}
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

export default function Contraindications({ user }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setModal] = useState(false);
  const [toast, setToast]     = useState('');
  const isAdmin = user.role === 'admin';

  const load = () => axios.get('http://localhost:5000/api/contraindications').then(r => { setData(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Icon.Shield />Contraindications</div>
          <div className="page-sub">{data.length} conditions where drug use is contraindicated</div>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setModal(true)}><Icon.Plus />Add Contraindication</button>}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Condition</th><th>Contraindicated Drugs</th></tr>
            </thead>
            <tbody>
              {data.map((c, i) => (
                <tr key={c.Contraindication_ID}>
                  <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td><strong>{c.Condition_Name}</strong></td>
                  <td>
                    {c.Drugs
                      ? c.Drugs.split(', ').map(d => <span key={d} className="badge badge-red" style={{ marginRight: 4 }}>{d}</span>)
                      : <span style={{ color: 'var(--text3)' }}>None linked</span>}
                  </td>
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