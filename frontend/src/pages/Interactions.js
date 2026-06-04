import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';

function Modal({ onClose, onSuccess }) {
  const [drugs, setDrugs] = useState([]);
  const [form, setForm]   = useState({ Drug1_ID: '', Drug2_ID: '', Interaction_Description: '' });

  useEffect(() => { axios.get('http://localhost:5000/api/drugs').then(r => setDrugs(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (form.Drug1_ID === form.Drug2_ID) {
      alert("Please select two different drugs");
      return;
    }
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

function SafetyChecker({ drugs, interactions }) {
  const [contraindications, setContraindications] = useState([]);
  
  // State for Drug-Drug Checker
  const [ddDrug1, setDdDrug1] = useState('');
  const [ddDrug2, setDdDrug2] = useState('');
  const [ddResult, setDdResult] = useState(null);

  // State for Contraindication Checker
  const [ciDrug, setCiDrug] = useState('');
  const [ciCondition, setCiCondition] = useState('');
  const [ciResult, setCiResult] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/contraindications').then(r => setContraindications(r.data));
  }, []);

  const handleDdCheck = (e) => {
    e.preventDefault();
    if (!ddDrug1 || !ddDrug2) return;
    if (ddDrug1 === ddDrug2) {
      setDdResult({ type: 'warning', message: 'You selected the same drug. A drug does not interact with itself!' });
      return;
    }

    const d1 = drugs.find(d => d.Drug_ID === parseInt(ddDrug1));
    const d2 = drugs.find(d => d.Drug_ID === parseInt(ddDrug2));

    // Look for interaction in both directions
    const match = interactions.find(item => 
      (item.Drug_One === d1.Brand_Name && item.Drug_Two === d2.Brand_Name) ||
      (item.Drug_One === d2.Brand_Name && item.Drug_Two === d1.Brand_Name)
    );

    if (match) {
      setDdResult({
        type: 'danger',
        message: `DANGEROUS INTERACTION DETECTED between ${d1.Brand_Name} and ${d2.Brand_Name}!`,
        desc: match.Interaction_Description
      });
    } else {
      setDdResult({
        type: 'safe',
        message: `No known interactions between ${d1.Brand_Name} and ${d2.Brand_Name}. Safe to administer together.`
      });
    }
  };

  const handleCiCheck = (e) => {
    e.preventDefault();
    if (!ciDrug || !ciCondition) return;

    const selectedDrug = drugs.find(d => d.Drug_ID === parseInt(ciDrug));
    const selectedCi = contraindications.find(c => c.Contraindication_ID === parseInt(ciCondition));

    // Check if the selected drug's Brand_Name is linked to this contraindication
    const isContraindicated = selectedCi.Drugs && selectedCi.Drugs.split(', ').includes(selectedDrug.Brand_Name);

    if (isContraindicated) {
      setCiResult({
        type: 'danger',
        message: `CONTRAINDICATED! Do NOT administer ${selectedDrug.Brand_Name} to patients with ${selectedCi.Condition_Name}.`
      });
    } else {
      setCiResult({
        type: 'safe',
        message: `No contraindication reported for ${selectedDrug.Brand_Name} in patients with ${selectedCi.Condition_Name}.`
      });
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Drug-Drug Checker */}
      <div className="card">
        <div className="chart-label"><Icon.Alert />Drug-Drug Interaction Checker</div>
        <form onSubmit={handleDdCheck} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Select First Drug</label>
            <select required value={ddDrug1} onChange={e => { setDdDrug1(e.target.value); setDdResult(null); }}>
              <option value="">Choose drug...</option>
              {drugs.map(d => <option key={d.Drug_ID} value={d.Drug_ID}>{d.Brand_Name} ({d.Generic_Name})</option>)}
            </select>
          </div>
          <div className="field">
            <label>Select Second Drug</label>
            <select required value={ddDrug2} onChange={e => { setDdDrug2(e.target.value); setDdResult(null); }}>
              <option value="">Choose drug...</option>
              {drugs.map(d => <option key={d.Drug_ID} value={d.Drug_ID}>{d.Brand_Name} ({d.Generic_Name})</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}><Icon.Check />Analyze Interaction</button>
        </form>

        {ddResult && (
          <div style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 8,
            border: '1px solid',
            borderColor: ddResult.type === 'danger' ? '#FCA5A5' : ddResult.type === 'warning' ? '#FCD34D' : '#6EE7B7',
            background: ddResult.type === 'danger' ? '#FEF2F2' : ddResult.type === 'warning' ? '#FFFBEB' : '#ECFDF5',
            color: ddResult.type === 'danger' ? '#B91C1C' : ddResult.type === 'warning' ? '#B45309' : '#047857'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              {ddResult.type === 'safe' ? <Icon.Check style={{ width: 16, height: 16 }} /> : <Icon.Alert style={{ width: 16, height: 16 }} />}
              {ddResult.message}
            </div>
            {ddResult.desc && <div style={{ marginTop: 8, fontSize: '0.84rem', color: '#4A5578' }}>{ddResult.desc}</div>}
          </div>
        )}
      </div>

      {/* Contraindication Checker */}
      <div className="card">
        <div className="chart-label"><Icon.Shield />Patient Contraindication Checker</div>
        <form onSubmit={handleCiCheck} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Select Drug</label>
            <select required value={ciDrug} onChange={e => { setCiDrug(e.target.value); setCiResult(null); }}>
              <option value="">Choose drug...</option>
              {drugs.map(d => <option key={d.Drug_ID} value={d.Drug_ID}>{d.Brand_Name} ({d.Generic_Name})</option>)}
            </select>
          </div>
          <div className="field">
            <label>Patient Condition</label>
            <select required value={ciCondition} onChange={e => { setCiCondition(e.target.value); setCiResult(null); }}>
              <option value="">Choose condition...</option>
              {contraindications.map(c => <option key={c.Contraindication_ID} value={c.Contraindication_ID}>{c.Condition_Name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}><Icon.Check />Assess Safety</button>
        </form>

        {ciResult && (
          <div style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 8,
            border: '1px solid',
            borderColor: ciResult.type === 'danger' ? '#FCA5A5' : '#6EE7B7',
            background: ciResult.type === 'danger' ? '#FEF2F2' : '#ECFDF5',
            color: ciResult.type === 'danger' ? '#B91C1C' : '#047857'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              {ciResult.type === 'safe' ? <Icon.Check style={{ width: 16, height: 16 }} /> : <Icon.Alert style={{ width: 16, height: 16 }} />}
              {ciResult.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Interactions({ user }) {
  const [data, setData]       = useState([]);
  const [drugs, setDrugs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setModal] = useState(false);
  const [toast, setToast]     = useState('');
  const [activeTab, setActiveTab] = useState('LIST'); // LIST or CHECKER
  const isAdmin = user.role === 'admin';

  const load = () => {
    Promise.all([
      axios.get('http://localhost:5000/api/interactions'),
      axios.get('http://localhost:5000/api/drugs')
    ]).then(([inter, drg]) => {
      setData(inter.data);
      setDrugs(drg.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this interaction record?')) return;
    await axios.delete(`http://localhost:5000/api/interactions/${id}`);
    flash('Deleted'); load();
  };

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading safety data...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Icon.Alert />Drug Interactions & Safety</div>
          <div className="page-sub">Central clinical safety checker and interactions database</div>
        </div>
        {activeTab === 'LIST' && isAdmin && <button className="btn-primary" onClick={() => setModal(true)}><Icon.Plus />Add Interaction</button>}
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'LIST' ? 'active' : ''}`} onClick={() => setActiveTab('LIST')}>
          Interactions List ({data.length})
        </button>
        <button className={`tab ${activeTab === 'CHECKER' ? 'active' : ''}`} onClick={() => setActiveTab('CHECKER')}>
          <Icon.Check style={{ display: 'inline', width: 14, height: 14, marginRight: 6 }} />Safety Checker
        </button>
      </div>

      {activeTab === 'LIST' ? (
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
      ) : (
        <SafetyChecker drugs={drugs} interactions={data} />
      )}

      {showModal && <Modal onClose={() => setModal(false)} onSuccess={(m) => { flash(m); load(); }} />}
      {toast && <div className="toast"><Icon.Check />{toast}</div>}
    </div>
  );
}