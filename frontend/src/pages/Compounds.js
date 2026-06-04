import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';

function Modal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ Compound_Name: '', Chemical_Formula: '' });

  const submit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/compounds', form);
    onSuccess('Compound added'); onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title"><Icon.Molecule />Add Compound</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          <div className="field">
            <label>Compound Name *</label>
            <input required placeholder="e.g. Ibuprofen Base" value={form.Compound_Name} onChange={e => setForm({ ...form, Compound_Name: e.target.value })} />
          </div>
          <div className="field">
            <label>Chemical Formula</label>
            <input placeholder="e.g. C13H18O2" value={form.Chemical_Formula} onChange={e => setForm({ ...form, Chemical_Formula: e.target.value })} />
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

export default function Compounds({ user }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setModal] = useState(false);
  const [toast, setToast]     = useState('');

  const canAdd = ['admin', 'researcher'].includes(user.role);
  const load = () => axios.get('http://localhost:5000/api/compounds').then(r => { setData(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading compounds...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Icon.Molecule />Compounds</div>
          <div className="page-sub">{data.length} chemical compounds linked to drug formulations</div>
        </div>
        {canAdd && <button className="btn-primary" onClick={() => setModal(true)}><Icon.Plus />Add Compound</button>}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Compound Name</th><th>Chemical Formula</th><th>Used In Drugs</th></tr>
            </thead>
            <tbody>
              {data.map((c, i) => (
                <tr key={c.Compound_ID}>
                  <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td><strong>{c.Compound_Name}</strong></td>
                  <td>{c.Chemical_Formula ? <span className="formula-chip">{c.Chemical_Formula}</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                  <td>{c.Drugs ? c.Drugs.split(', ').map(d => <span key={d} className="badge badge-blue" style={{ marginRight: 4 }}>{d}</span>) : <span style={{ color: 'var(--text3)' }}>None</span>}</td>
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