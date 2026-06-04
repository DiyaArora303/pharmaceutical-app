import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';

const IconPencil = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>
);

function MoleculeVisualizer({ formula }) {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Parse formula
    const parsed = [];
    const regex = /([A-Z][a-z]*)(\d*)/g;
    let match;
    while ((match = regex.exec(formula)) !== null) {
      parsed.push({ symbol: match[1], count: match[2] ? parseInt(match[2]) : 1 });
    }

    const nodes = [];
    const links = [];

    const atomProps = {
      C: { color: '#4B5563', radius: 10, name: 'Carbon' },
      H: { color: '#38BDF8', radius: 6, name: 'Hydrogen' },
      O: { color: '#EF4444', radius: 9, name: 'Oxygen' },
      N: { color: '#8B5CF6', radius: 9, name: 'Nitrogen' },
      S: { color: '#F59E0B', radius: 11, name: 'Sulfur' },
      P: { color: '#EC4899', radius: 11, name: 'Phosphorus' },
      Cl: { color: '#10B981', radius: 10, name: 'Chlorine' },
      Na: { color: '#6366F1', radius: 10, name: 'Sodium' }
    };
    const defaultProp = { color: '#14B8A6', radius: 8, name: 'Unknown' };

    let idCounter = 0;
    const carbons = [];
    const others = [];

    parsed.forEach(atom => {
      const prop = atomProps[atom.symbol] || defaultProp;
      // Cap number of atoms to keep the visualization clean
      const count = Math.min(atom.count, atom.symbol === 'H' ? 6 : atom.symbol === 'C' ? 8 : 4);
      for (let i = 0; i < count; i++) {
        const node = {
          id: idCounter++,
          symbol: atom.symbol,
          color: prop.color,
          radius: prop.radius,
          name: prop.name,
          x: canvas.width / 2 + (Math.random() - 0.5) * 120,
          y: canvas.height / 2 + (Math.random() - 0.5) * 120,
          vx: 0,
          vy: 0
        };
        nodes.push(node);
        if (atom.symbol === 'C') carbons.push(node);
        else others.push(node);
      }
    });

    if (nodes.length === 0) {
      nodes.push({ id: 0, symbol: 'O', color: '#EF4444', radius: 9, name: 'Oxygen', x: 150, y: 100, vx: 0, vy: 0 });
      nodes.push({ id: 1, symbol: 'H', color: '#38BDF8', radius: 6, name: 'Hydrogen', x: 110, y: 130, vx: 0, vy: 0 });
      nodes.push({ id: 2, symbol: 'H', color: '#38BDF8', radius: 6, name: 'Hydrogen', x: 190, y: 130, vx: 0, vy: 0 });
      links.push({ source: 0, target: 1 });
      links.push({ source: 0, target: 2 });
    } else {
      for (let i = 0; i < carbons.length; i++) {
        if (i > 0) {
          links.push({ source: carbons[i-1].id, target: carbons[i].id });
        }
        if (carbons.length > 3 && i === carbons.length - 1) {
          links.push({ source: carbons[i].id, target: carbons[0].id });
        }
      }

      others.forEach((node, idx) => {
        if (carbons.length > 0) {
          const cNode = carbons[idx % carbons.length];
          links.push({ source: cNode.id, target: node.id });
        } else if (nodes.length > 1) {
          links.push({ source: nodes[0].id, target: node.id });
        }
      });
    }

    let hoveredNode = null;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      hoveredNode = null;
      for (let node of nodes) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        if (dx * dx + dy * dy < (node.radius + 6) * (node.radius + 6)) {
          hoveredNode = node;
          break;
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const kRepulsion = 500;
    const kSpring = 0.08;
    const springLength = 45;
    const gravity = 0.025;
    const friction = 0.9;

    const update = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          if (dist < 120) {
            const force = kRepulsion / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      links.forEach(link => {
        const n1 = nodes.find(n => n.id === link.source);
        const n2 = nodes.find(n => n.id === link.target);
        if (!n1 || !n2) return;
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const diff = dist - springLength;
        const force = diff * kSpring;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        n1.vx += fx;
        n1.vy += fy;
        n2.vx -= fx;
        n2.vy -= fy;
      });

      nodes.forEach(node => {
        node.vx += (cx - node.x) * gravity;
        node.vy += (cy - node.y) * gravity;

        node.x += node.vx;
        node.y += node.vy;
        node.vx *= friction;
        node.vy *= friction;

        if (node.x < node.radius) { node.x = node.radius; node.vx *= -0.5; }
        if (node.x > w - node.radius) { node.x = w - node.radius; node.vx *= -0.5; }
        if (node.y < node.radius) { node.y = node.radius; node.vy *= -0.5; }
        if (node.y > h - node.radius) { node.y = h - node.radius; node.vy *= -0.5; }
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = 'rgba(228, 231, 239, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Bonds
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 2.5;
      links.forEach(link => {
        const n1 = nodes.find(n => n.id === link.source);
        const n2 = nodes.find(n => n.id === link.target);
        if (!n1 || !n2) return;
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      });

      // Atoms
      nodes.forEach(node => {
        ctx.shadowBlur = 10;
        ctx.shadowColor = node.color;

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        if (hoveredNode && hoveredNode.id === node.id) {
          ctx.strokeStyle = 'var(--text)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.shadowBlur = 0;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${node.radius > 8 ? 10 : 8}px 'DM Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.symbol, node.x, node.y);
      });

      // Tooltip
      if (hoveredNode) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(10, canvas.height - 35, canvas.width - 20, 25);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `11px 'DM Sans', sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(`${hoveredNode.name} Atom (${hoveredNode.symbol})`, 20, canvas.height - 23);
      }
    };

    const tick = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [formula]);

  return (
    <div style={{ position: 'relative', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF', padding: 8 }}>
      <div style={{ position: 'absolute', top: 8, left: 12, fontSize: '0.68rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Interactive Molecule Simulation
      </div>
      <canvas ref={canvasRef} width={410} height={200} style={{ display: 'block', cursor: 'pointer' }} />
    </div>
  );
}

function Modal({ onClose, onSuccess, drugToEdit }) {
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState({ Brand_Name: '', Generic_ID: '', Therapeutic_Class_ID: '', Dosage_Form_ID: '', Regulatory_Status_ID: '', Ingredient_ID: '', Strength: '', Compound_ID: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    axios.get('http://localhost:5000/api/drugs/meta').then(r => {
      setMeta(r.data);
      if (drugToEdit) {
        axios.get(`http://localhost:5000/api/drugs/${drugToEdit.Drug_ID}/details`).then(res => {
          const detail = res.data;
          setForm({
            Brand_Name: detail.Brand_Name,
            Generic_ID: detail.Generic_ID || '',
            Therapeutic_Class_ID: detail.Therapeutic_Class_ID || '',
            Dosage_Form_ID: detail.Dosage_Form_ID || '',
            Regulatory_Status_ID: detail.Regulatory_Status_ID || '',
            Ingredient_ID: detail.ingredients[0]?.Ingredient_ID || '',
            Strength: detail.ingredients[0]?.Strength || '',
            Compound_ID: detail.compounds[0]?.Compound_ID || ''
          });
        });
      }
    });
  }, [drugToEdit]);

  const submit = async (e) => {
    e.preventDefault();
    if (drugToEdit) {
      await axios.put(`http://localhost:5000/api/drugs/${drugToEdit.Drug_ID}`, form);
      onSuccess('Drug updated successfully');
    } else {
      await axios.post('http://localhost:5000/api/drugs', form);
      onSuccess('Drug added successfully');
    }
    onClose();
  };

  if (!meta) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div className="modal-title">{drugToEdit ? <IconPencil style={{ width: 18, height: 18 }} /> : <Icon.Plus />} {drugToEdit ? 'Edit Drug' : 'Add New Drug'}</div>
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
            <button type="submit" className="btn-primary"><Icon.Check />{drugToEdit ? 'Save Changes' : 'Add Drug'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailPanel({ drugId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/drugs/${drugId}/details`)
      .then(r => { setDetail(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [drugId]);

  if (loading) return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="loading"><div className="spinner" /><p>Loading details...</p></div>
      </div>
    </div>
  );

  if (!detail) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h3>{detail.Brand_Name}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>{detail.Generic_Name}</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="drawer-content">
          <div className="detail-section">
            <h4>Classification & Status</h4>
            <div className="detail-grid">
              <div><strong>Therapeutic Class:</strong> <span className="badge badge-blue">{detail.Class_Name}</span></div>
              <div><strong>Dosage Form:</strong> {detail.Form_Name}</div>
              <div><strong>Regulatory Status:</strong> <span className="badge badge-green">{detail.Status_Name}</span></div>
            </div>
          </div>

          <div className="detail-section">
            <h4>Active Ingredients</h4>
            {detail.ingredients.length === 0 ? <p className="none-text">None listed</p> : (
              detail.ingredients.map(i => (
                <div key={i.Ingredient_ID} className="ingredient-row">
                  <span className="dot" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                  <strong>{i.Ingredient_Name}</strong>
                  <span className="strength">{i.Strength}</span>
                </div>
              ))
            )}
          </div>

          <div className="detail-section">
            <h4>Chemical Compounds</h4>
            {detail.compounds.length === 0 ? <p className="none-text">None linked</p> : (
              detail.compounds.map(c => (
                <div key={c.Compound_ID} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="compound-row">
                    <strong>{c.Compound_Name}</strong>
                    <span className="formula">{c.Chemical_Formula}</span>
                  </div>
                  {c.Chemical_Formula && <MoleculeVisualizer formula={c.Chemical_Formula} />}
                </div>
              ))
            )}
          </div>

          <div className="detail-section">
            <h4>Safety & Side Effects</h4>
            {detail.sideEffects.length === 0 ? <p className="none-text">No side effects reported</p> : (
              <div className="side-effects-list">
                {detail.sideEffects.map(se => {
                  const sCls = se.Severity === 'Severe' ? 'badge-red' : se.Severity === 'Moderate' ? 'badge-amber' : 'badge-gray';
                  return (
                    <div key={se.SideEffect_ID} className="se-row">
                      <span>{se.Description}</span>
                      <span className={`badge ${sCls}`}>{se.Severity}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="detail-section">
            <h4>Contraindications</h4>
            {detail.contraindications.length === 0 ? <p className="none-text">No contraindications listed</p> : (
              <div className="contra-list">
                {detail.contraindications.map(c => (
                  <div key={c.Contraindication_ID} style={{ margin: '2px 0' }}>
                    <span className="badge badge-red">{c.Condition_Name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Drugs({ user }) {
  const [drugs, setDrugs]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus]= useState('');
  const [classes, setClasses]         = useState([]);
  const [statuses, setStatuses]       = useState([]);
  
  const [showModal, setModal]         = useState(false);
  const [drugToEdit, setDrugToEdit]   = useState(null);
  const [selectedDrugId, setSelectedDrugId] = useState(null);
  const [toast, setToast]             = useState('');

  const canAdd    = ['admin', 'researcher'].includes(user.role);
  const canEdit   = ['admin', 'researcher'].includes(user.role);
  const canDelete = user.role === 'admin';

  const load = () => {
    axios.get('http://localhost:5000/api/drugs').then(r => { setDrugs(r.data); setLoading(false); });
  };

  useEffect(() => {
    load();
    axios.get('http://localhost:5000/api/drugs/meta').then(r => {
      setClasses(r.data.classes);
      setStatuses(r.data.statuses);
    });
  }, []);

  const del = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this drug and all its related records?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/drugs/${id}`);
      flash('Drug deleted successfully');
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete drug');
    }
  };

  const startEdit = (d, e) => {
    e.stopPropagation();
    setDrugToEdit(d);
    setModal(true);
  };

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = drugs.filter(d => {
    const matchesSearch = d.Brand_Name.toLowerCase().includes(search.toLowerCase()) || d.Generic_Name.toLowerCase().includes(search.toLowerCase());
    const matchesClass  = filterClass === '' || d.Class_Name === filterClass;
    const matchesStatus = filterStatus === '' || d.Status_Name === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading drugs...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Icon.Pill />Drug Registry</div>
          <div className="page-sub">{drugs.length} drugs across all therapeutic classes</div>
        </div>
        {canAdd && <button className="btn-primary" onClick={() => { setDrugToEdit(null); setModal(true); }}><Icon.Plus />Add Drug</button>}
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div className="search-wrap" style={{ marginBottom: 0 }}>
            <Icon.Search />
            <input className="search-input" placeholder="Search by brand or generic name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="field">
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ padding: '9px 14px' }}>
              <option value="">All Therapeutic Classes</option>
              {classes.map(c => <option key={c.Therapeutic_Class_ID} value={c.Class_Name}>{c.Class_Name}</option>)}
            </select>
          </div>
          <div className="field">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '9px 14px' }}>
              <option value="">All Regulatory Statuses</option>
              {statuses.map(s => <option key={s.Regulatory_Status_ID} value={s.Status_Name}>{s.Status_Name}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Brand Name</th><th>Generic Name</th>
                <th>Therapeutic Class</th><th>Dosage Form</th><th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state"><Icon.Search /><p>No drugs found</p></div>
                </td></tr>
              ) : filtered.map((d, i) => (
                <tr key={d.Drug_ID} onClick={() => setSelectedDrugId(d.Drug_ID)} style={{ cursor: 'pointer' }}>
                  <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td><strong>{d.Brand_Name}</strong></td>
                  <td>{d.Generic_Name}</td>
                  <td><span className="badge badge-blue">{d.Class_Name}</span></td>
                  <td>{d.Form_Name}</td>
                  <td><span className="badge badge-green">{d.Status_Name}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      {canEdit && (
                        <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={(e) => startEdit(d, e)}>
                          <IconPencil style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />Edit
                        </button>
                      )}
                      {canDelete && (
                        <button className="btn-danger" onClick={(e) => del(d.Drug_ID, e)}>
                          <Icon.Trash />Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <Modal drugToEdit={drugToEdit} onClose={() => setModal(false)} onSuccess={(m) => { flash(m); load(); }} />}
      {selectedDrugId && <DetailPanel drugId={selectedDrugId} onClose={() => setSelectedDrugId(null)} />}
      {toast && <div className="toast"><Icon.Check />{toast}</div>}
    </div>
  );
}
