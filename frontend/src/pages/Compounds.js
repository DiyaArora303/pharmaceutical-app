import React, { useEffect, useState, useRef } from 'react';
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

function MolecularLab({ onCompoundSaved }) {
  const canvasRef = useRef(null);
  const [backbone, setBackbone] = useState('');
  const [functional, setFunctional] = useState('');
  const [synthesizing, setSynthesizing] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const BACKBONES = [
    { formula: 'C8H9', name: 'Ethylbenzene Backbone' },
    { formula: 'C13H18', name: 'Isobutylbenzene Backbone' },
    { formula: 'C16H19', name: 'Penam Core Backbone' },
    { formula: 'C4H11', name: 'Metformin Backbone' },
    { formula: 'C21H31', name: 'Lisinopril Backbone' },
    { formula: 'C21H25Cl', name: 'Cetirizine Backbone' }
  ];

  const FUNCTIONALS = [
    { formula: 'NO2', name: 'Nitro / Hydroxyl Group' },
    { formula: 'O2', name: 'Carboxylic Acid Group' },
    { formula: 'N3O5S', name: 'Amino Penicillin Chain' },
    { formula: 'N5', name: 'Biguanide Group' },
    { formula: 'N3O5', name: 'Proline Peptide Chain' },
    { formula: 'N2O3', name: 'Ethoxyacetic Acid Chain' }
  ];

  const MAPPING = {
    'C8H9+NO2': { formula: 'C8H9NO2', name: 'Acetaminophen Base', desc: 'Used in: Tylenol, Panadol' },
    'C13H18+O2': { formula: 'C13H18O2', name: 'Ibuprofen Base', desc: 'Used in: Advil' },
    'C16H19+N3O5S': { formula: 'C16H19N3O5S', name: 'Amoxicillin', desc: 'Used in: Amoxil, Zithromax' },
    'C4H11+N5': { formula: 'C4H11N5', name: 'Metformin', desc: 'Used in: Glucophage' },
    'C21H31+N3O5': { formula: 'C21H31N3O5', name: 'Lisinopril', desc: 'Used in: Prinivil' },
    'C21H25Cl+N2O3': { formula: 'C21H25ClN2O3', name: 'Cetirizine Base', desc: 'Used in: Antihistamines' }
  };

  const handleSynthesize = (e) => {
    e.preventDefault();
    if (!backbone || !functional) return;

    setSynthesizing(true);
    setResult(null);
    setSaved(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let startTime = Date.now();

    // Setup animation particles
    const particles = [];
    
    // Cloud 1: Backbone (Left to Right)
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: 30 + Math.random() * 40,
        y: canvas.height / 2 + (Math.random() - 0.5) * 50,
        vx: 4 + Math.random() * 2,
        vy: (Math.random() - 0.5) * 2,
        color: '#2563EB',
        size: 3 + Math.random() * 4
      });
    }

    // Cloud 2: Functional Group (Right to Left)
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: canvas.width - 70 + Math.random() * 40,
        y: canvas.height / 2 + (Math.random() - 0.5) * 50,
        vx: -(4 + Math.random() * 2),
        vy: (Math.random() - 0.5) * 2,
        color: '#EF4444',
        size: 3 + Math.random() * 4
      });
    }

    const explosionParticles = [];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = 'rgba(228, 231, 239, 0.3)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      if (elapsed < 800) {
        // Particles move towards center
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (elapsed < 1400) {
        // Explode
        if (explosionParticles.length === 0) {
          // Generate sparks
          for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            explosionParticles.push({
              x: canvas.width / 2,
              y: canvas.height / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: `hsl(${Math.random() * 60 + 20}, 100%, 60%)`,
              alpha: 1,
              size: 2 + Math.random() * 3
            });
          }
        }

        explosionParticles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.02;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      } else {
        // Draw the synthesized molecule spinning
        const angle = (elapsed - 1400) * 0.03;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#2563EB';

        // Draw ring bonds
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const x = cx + Math.cos(angle + (i * Math.PI) / 3) * 45;
          const y = cy + Math.sin(angle + (i * Math.PI) / 3) * 45;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Draw atoms
        for (let i = 0; i < 6; i++) {
          const x = cx + Math.cos(angle + (i * Math.PI) / 3) * 45;
          const y = cy + Math.sin(angle + (i * Math.PI) / 3) * 45;
          ctx.fillStyle = i % 2 === 0 ? '#4B5563' : '#EF4444';
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
      }

      if (elapsed < 2200) {
        frameId = requestAnimationFrame(animate);
      } else {
        // Animation finished
        setSynthesizing(false);
        const combo = `${backbone}+${functional}`;
        const match = MAPPING[combo];
        if (match) {
          setResult({ success: true, ...match });
        } else {
          setResult({ success: false, formula: backbone + functional, name: 'Unstable Synthesis', desc: 'The resulting structure has unstable valence electrons and immediately decomposed.' });
        }
      }
    };

    animate();
  };

  const handleSaveToDb = async () => {
    if (!result || !result.success) return;
    try {
      await axios.post('http://localhost:5000/api/compounds', {
        Compound_Name: result.name,
        Chemical_Formula: result.formula
      });
      setSaved(true);
      if (onCompoundSaved) onCompoundSaved();
    } catch (err) {
      alert("Error saving compound: " + err.message);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>
      {/* Configuration Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="chart-label"><Icon.Molecule />Synthesizer Controls</div>
        <form onSubmit={handleSynthesize} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Select Backbone Core</label>
            <select required value={backbone} onChange={e => { setBackbone(e.target.value); setResult(null); }} disabled={synthesizing}>
              <option value="">Select structure...</option>
              {BACKBONES.map(b => <option key={b.formula} value={b.formula}>{b.formula} ({b.name})</option>)}
            </select>
          </div>
          <div className="field">
            <label>Select Functional Group</label>
            <select required value={functional} onChange={e => { setFunctional(e.target.value); setResult(null); }} disabled={synthesizing}>
              <option value="">Select group...</option>
              {FUNCTIONALS.map(f => <option key={f.formula} value={f.formula}>{f.formula} ({f.name})</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={synthesizing || !backbone || !functional} style={{ alignSelf: 'flex-start' }}>
            🧪 Synthesize Compound
          </button>
        </form>
      </div>

      {/* Animation & Result Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="chart-label"><Icon.Flask />Reaction Chamber</div>
        <div style={{ position: 'relative', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <canvas ref={canvasRef} width={420} height={200} style={{ display: 'block' }} />
          {!synthesizing && !result && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', color: 'var(--text3)', fontSize: '0.86rem' }}>
              Select groups and click synthesize to load the chamber.
            </div>
          )}
        </div>

        {/* Results Info */}
        {result && (
          <div style={{
            padding: 16,
            borderRadius: 10,
            border: '1.5px solid',
            borderColor: result.success ? '#6EE7B7' : '#FCA5A5',
            background: result.success ? '#ECFDF5' : '#FEF2F2',
            color: result.success ? '#047857' : '#B91C1C'
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {result.success ? '✅ SYNTHESIS SUCCESSFUL!' : '❌ SYNTHESIS FAILED!'}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              {result.name} ({result.formula})
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text2)', marginBottom: 12 }}>
              {result.desc}
            </p>
            {result.success && (
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem', border: saved ? '1px solid #6EE7B7' : '1.5px solid var(--border)', color: saved ? '#047857' : 'var(--text2)', background: saved ? '#ECFDF5' : '#FFFFFF' }} onClick={handleSaveToDb} disabled={saved}>
                {saved ? '✓ Saved to Database' : '💾 Register Compound in Database'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Compounds({ user }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setModal] = useState(false);
  const [toast, setToast]     = useState('');
  const [activeTab, setActiveTab] = useState('LIST'); // LIST or LAB

  const canAdd = ['admin', 'researcher'].includes(user.role);
  const load = () => axios.get('http://localhost:5000/api/compounds').then(r => { setData(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading compounds...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Icon.Molecule />Compounds Library</div>
          <div className="page-sub">{data.length} chemical structures linked to drug formulations</div>
        </div>
        {activeTab === 'LIST' && canAdd && <button className="btn-primary" onClick={() => setModal(true)}><Icon.Plus />Add Compound</button>}
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'LIST' ? 'active' : ''}`} onClick={() => setActiveTab('LIST')}>
          Compounds List ({data.length})
        </button>
        <button className={`tab ${activeTab === 'LAB' ? 'active' : ''}`} onClick={() => setActiveTab('LAB')}>
          🧪 Molecular Lab Synthesizer
        </button>
      </div>

      {activeTab === 'LIST' ? (
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
      ) : (
        <MolecularLab onCompoundSaved={() => { flash('Compound registered in database'); load(); }} />
      )}

      {showModal && <Modal onClose={() => setModal(false)} onSuccess={(m) => { flash(m); load(); }} />}
      {toast && <div className="toast"><Icon.Check />{toast}</div>}
    </div>
  );
}