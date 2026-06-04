import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';

function Modal({ onClose, onSuccess }) {
  const [drugs, setDrugs] = useState([]);
  const [form, setForm]   = useState({ Drug1_ID: '', Drug2_ID: '', Interaction_Description: '' });

  useEffect(() => { axios.get('http://localhost:5000/api/drugs').then(r => setDrugs(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/interactions', form);
    onSuccess('Interaction added'); onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title"><Icon.Alert />Add Drug Interaction</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          <div className="field">
            <label>Drug One *</label>
            <select required value={form.Drug1_ID} onChange={e => setForm({ ...form, Drug1_ID: e.target.value })}>
              <option value="">Select drug...</option>
              {drugs.map(d => <option key={d.Drug_ID} value={d.Drug_ID}>{d.Brand_Name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Drug Two *</label>
            <select required value={form.Drug2_ID} onChange={e => setForm({ ...form, Drug2_ID: e.target.value })}>
              <option value="">Select drug...</option>
              {drugs.map(d => <option key={d.Drug_ID} value={d.Drug_ID}>{d.Brand_Name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Interaction Description *</label>
            <textarea required rows={3} placeholder="Describe the clinical interaction..." value={form.Interaction_Description} onChange={e => setForm({ ...form, Interaction_Description: e.target.value })} style={{ resize: 'vertical' }} />
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

export default function Interactions({ user }) {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setModal] = useState(false);
  const [toast, setToast]   = useState('');
  const isAdmin = user.role === 'admin';

  const load = () => axios.get('http://localhost:5000/api/interactions').then(r => { setData(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this interaction record?')) return;
    await axios.delete(`http://localhost:5000/api/interactions/${id}`);
    flash('Deleted'); load();
  };

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Icon.Alert />Drug Interactions</div>
          <div className="page-sub">{data.length} known interactions requiring clinical attention</div>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setModal(true)}><Icon.Plus />Add Interaction</button>}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Drug One</th><th>Drug Two</th><th>Interaction Description</th>{isAdmin && <th>Action</th>}</tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.Interaction_ID}>
                  <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td><span className="badge badge-blue">{row.Drug_One}</span></td>
                  <td><span className="badge badge-purple">{row.Drug_Two}</span></td>
                  <td style={{ maxWidth: 400 }}>{row.Interaction_Description}</td>
                  {isAdmin && <td><button className="btn-danger" onClick={() => del(row.Interaction_ID)}><Icon.Trash />Delete</button></td>}
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