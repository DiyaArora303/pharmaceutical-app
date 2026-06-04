import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';

function Modal({ onClose, onSuccess }) {
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState({ Brand_Name: '', Generic_ID: '', Therapeutic_Class_ID: '', Dosage_Form_ID: '', Regulatory_Status_ID: '', Ingredient_ID: '', Strength: '', Compound_ID: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { axios.get('http://localhost:5000/api/drugs/meta').then(r => setMeta(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/drugs', form);
    onSuccess('Drug added successfully'); onClose();
  };

  if (!meta) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div className="modal-title"><Icon.Plus />Add New Drug</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Brand Name *</label>
              <input placeholder="e.g. Tylenol" required value={form.Brand_Name} onChange={e => set('Brand_Name', e.target.value)} />
            </div>
            <div className="field">
              <label>Generic Drug *</label>
              <select required value={form.Generic_ID} onChange={e => set('Generic_ID', e.target.value)}>
                <option value="">Select...</option>
                {meta.generics.map(g => <option key={g.Generic_ID} value={g.Generic_ID}>{g.Generic_Name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Therapeutic Class *</label>
              <select required value={form.Therapeutic_Class_ID} onChange={e => set('Therapeutic_Class_ID', e.target.value)}>
                <option value="">Select...</option>
                {meta.classes.map(c => <option key={c.Therapeutic_Class_ID} value={c.Therapeutic_Class_ID}>{c.Class_Name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Dosage Form *</label>
              <select required value={form.Dosage_Form_ID} onChange={e => set('Dosage_Form_ID', e.target.value)}>
                <option value="">Select...</option>
                {meta.forms.map(f => <option key={f.Dosage_Form_ID} value={f.Dosage_Form_ID}>{f.Form_Name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Regulatory Status *</label>
              <select required value={form.Regulatory_Status_ID} onChange={e => set('Regulatory_Status_ID', e.target.value)}>
                <option value="">Select...</option>
                {meta.statuses.map(s => <option key={s.Regulatory_Status_ID} value={s.Regulatory_Status_ID}>{s.Status_Name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Active Ingredient</label>
              <select value={form.Ingredient_ID} onChange={e => set('Ingredient_ID', e.target.value)}>
                <option value="">None</option>
                {meta.ingredients.map(i => <option key={i.Ingredient_ID} value={i.Ingredient_ID}>{i.Ingredient_Name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Strength</label>
              <input placeholder="e.g. 500mg" value={form.Strength} onChange={e => set('Strength', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Compound</label>
              <select value={form.Compound_ID} onChange={e => set('Compound_ID', e.target.value)}>
                <option value="">None</option>
                {meta.compounds.map(c => <option key={c.Compound_ID} value={c.Compound_ID}>{c.Compound_Name} ({c.Chemical_Formula})</option>)}
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Icon.Check />Add Drug</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Drugs({ user }) {
  const [drugs, setDrugs]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showModal, setModal]   = useState(false);
  const [toast, setToast]       = useState('');

  const canAdd    = ['admin', 'researcher'].includes(user.role);
  const canDelete = user.role === 'admin';

  const load = () => axios.get('http://localhost:5000/api/drugs').then(r => { setDrugs(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this drug and all its related records?')) return;
    await axios.delete(`http://localhost:5000/api/drugs/${id}`);
    flash('Drug deleted successfully'); load();
  };

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = drugs.filter(d =>
    d.Brand_Name.toLowerCase().includes(search.toLowerCase()) ||
    d.Generic_Name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading drugs...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Icon.Pill />Drug Registry</div>
          <div className="page-sub">{drugs.length} drugs across all therapeutic classes</div>
        </div>
        {canAdd && <button className="btn-primary" onClick={() => setModal(true)}><Icon.Plus />Add Drug</button>}
      </div>

      <div className="card">
        <div className="search-wrap">
          <Icon.Search />
          <input className="search-input" placeholder="Search by brand or generic name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Brand Name</th><th>Generic Name</th>
                <th>Therapeutic Class</th><th>Dosage Form</th><th>Status</th>
                {canDelete && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={canDelete ? 7 : 6}>
                  <div className="empty-state"><Icon.Search /><p>No drugs found</p></div>
                </td></tr>
              ) : filtered.map((d, i) => (
                <tr key={d.Drug_ID}>
                  <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td><strong>{d.Brand_Name}</strong></td>
                  <td>{d.Generic_Name}</td>
                  <td><span className="badge badge-blue">{d.Class_Name}</span></td>
                  <td>{d.Form_Name}</td>
                  <td><span className="badge badge-green">{d.Status_Name}</span></td>
                  {canDelete && (
                    <td>
                      <button className="btn-danger" onClick={() => del(d.Drug_ID)}>
                        <Icon.Trash />Delete
                      </button>
                    </td>
                  )}
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