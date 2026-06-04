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

function SafetyNetworkGraph({ drugs, interactions }) {
  const canvasRef = React.useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const nodes = drugs.map((d) => ({
      id: d.Drug_ID,
      label: d.Brand_Name,
      className: d.Class_Name,
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2 + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
      radius: 20
    }));

    const links = [];
    interactions.forEach((item, idx) => {
      const d1 = drugs.find(d => d.Brand_Name === item.Drug_One);
      const d2 = drugs.find(d => d.Brand_Name === item.Drug_Two);
      if (d1 && d2) {
        links.push({
          id: idx,
          source: d1.Drug_ID,
          target: d2.Drug_ID,
          desc: item.Interaction_Description
        });
      }
    });

    let hoveredNode = null;
    let draggedNode = null;
    let isDragging = false;

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    const handleMouseMove = (e) => {
      const pos = getMousePos(e);
      if (isDragging && draggedNode) {
        draggedNode.x = pos.x;
        draggedNode.y = pos.y;
      } else {
        hoveredNode = null;
        for (let node of nodes) {
          const dx = node.x - pos.x;
          const dy = node.y - pos.y;
          if (dx * dx + dy * dy < node.radius * node.radius) {
            hoveredNode = node;
            break;
          }
        }
      }
    };

    const handleMouseDown = (e) => {
      const pos = getMousePos(e);
      for (let node of nodes) {
        const dx = node.x - pos.x;
        const dy = node.y - pos.y;
        if (dx * dx + dy * dy < node.radius * node.radius) {
          draggedNode = node;
          isDragging = true;
          break;
        }
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      draggedNode = null;
    };

    const handleClick = (e) => {
      const pos = getMousePos(e);
      let clicked = null;
      for (let node of nodes) {
        const dx = node.x - pos.x;
        const dy = node.y - pos.y;
        if (dx * dx + dy * dy < node.radius * node.radius) {
          clicked = node;
          break;
        }
      }
      setSelectedNode(clicked);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);

    const repulsion = 1000;
    const gravity = 0.02;
    const friction = 0.88;
    const linkStrength = 0.04;
    const desiredLength = 130;

    const update = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          if (dist < 180) {
            const force = repulsion / distSq;
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
        const diff = dist - desiredLength;
        const force = diff * linkStrength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        n1.vx += fx;
        n1.vy += fy;
        n2.vx -= fx;
        n2.vy -= fy;
      });

      nodes.forEach(node => {
        if (isDragging && draggedNode && draggedNode.id === node.id) return;

        node.vx += (cx - node.x) * gravity;
        node.vy += (cy - node.y) * gravity;

        node.x += node.vx;
        node.y += node.vy;
        node.vx *= friction;
        node.vy *= friction;

        if (node.x < node.radius) node.x = node.radius;
        if (node.x > canvas.width - node.radius) node.x = canvas.width - node.radius;
        if (node.y < node.radius) node.y = node.radius;
        if (node.y > canvas.height - node.radius) node.y = canvas.height - node.radius;
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(228, 231, 239, 0.3)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      const activeNode = hoveredNode || selectedNode;

      links.forEach(link => {
        const n1 = nodes.find(n => n.id === link.source);
        const n2 = nodes.find(n => n.id === link.target);
        if (!n1 || !n2) return;

        let isActiveLink = false;
        let isDimmed = false;

        if (activeNode) {
          if (activeNode.id === n1.id || activeNode.id === n2.id) {
            isActiveLink = true;
          } else {
            isDimmed = true;
          }
        }

        ctx.strokeStyle = isActiveLink ? '#EF4444' : isDimmed ? 'rgba(228, 231, 239, 0.2)' : 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = isActiveLink ? 3.5 : 2;
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      });

      nodes.forEach(node => {
        let isConnected = false;
        let isDimmed = false;

        if (activeNode) {
          if (activeNode.id === node.id) {
            isConnected = true;
          } else {
            const hasLink = links.some(l => 
              (l.source === activeNode.id && l.target === node.id) ||
              (l.target === activeNode.id && l.source === node.id)
            );
            if (hasLink) isConnected = true;
            else isDimmed = true;
          }
        }

        ctx.shadowBlur = isConnected ? 12 : 4;
        ctx.shadowColor = isConnected ? '#EF4444' : 'rgba(0, 0, 0, 0.15)';

        ctx.fillStyle = isConnected ? '#FEF2F2' : isDimmed ? 'rgba(241, 245, 249, 0.4)' : '#FFFFFF';
        ctx.strokeStyle = isConnected ? '#EF4444' : isDimmed ? 'rgba(228, 231, 239, 0.4)' : 'var(--border2)';
        ctx.lineWidth = isConnected ? 3 : 1.5;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.fillStyle = isConnected ? '#991B1B' : isDimmed ? 'rgba(148, 163, 184, 0.4)' : 'var(--text)';
        ctx.font = `bold 9.5px 'DM Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let label = node.label;
        if (label.length > 7) label = label.substring(0, 6) + '..';
        ctx.fillText(label, node.x, node.y);
      });
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
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
    };
  }, [drugs, interactions, selectedNode]);

  const nodeInteractions = selectedNode ? interactions.filter(item => 
    item.Drug_One === selectedNode.label || item.Drug_Two === selectedNode.label
  ) : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
      <div className="card" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
        <div style={{ position: 'absolute', top: 12, left: 16, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', zIndex: 10 }}>
          Interactive Safety Network Graph
        </div>
        <div style={{ position: 'absolute', top: 12, right: 16, fontSize: '0.7rem', color: 'var(--text3)', zIndex: 10 }}>
          💡 Drag nodes to reorganize. Click to inspect safety warnings.
        </div>
        <canvas ref={canvasRef} width={650} height={420} style={{ display: 'block', cursor: 'grab' }} />
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="chart-label"><Icon.Shield />Network Clinical Inspector</div>
        {selectedNode ? (
          <div>
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text)' }}>{selectedNode.label}</h3>
              <span className="badge badge-blue">{selectedNode.className}</span>
            </div>
            
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10 }}>
              Safety Warnings ({nodeInteractions.length})
            </h4>
            
            {nodeInteractions.length === 0 ? (
              <div style={{ padding: 12, borderRadius: 8, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon.Check style={{ width: 16, height: 16 }} />
                No known interactions for this drug in our database.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {nodeInteractions.map((item, idx) => {
                  const partner = item.Drug_One === selectedNode.label ? item.Drug_Two : item.Drug_One;
                  return (
                    <div key={idx} style={{ padding: 12, borderRadius: 8, background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.84rem' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Interacts with {partner}</div>
                      <div style={{ color: '#4A5578', fontSize: '0.8rem' }}>{item.Interaction_Description}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', textAlign: 'center' }}>
            <Icon.Alert style={{ width: 32, height: 32, opacity: 0.3, marginBottom: 8 }} />
            <p style={{ fontSize: '0.88rem' }}>Click a drug node on the network graph to inspect its safety and clinical warning details.</p>
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
  const [activeTab, setActiveTab] = useState('LIST'); // LIST, CHECKER, or GRAPH
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
        <button className={`tab ${activeTab === 'GRAPH' ? 'active' : ''}`} onClick={() => setActiveTab('GRAPH')}>
          <Icon.Molecule style={{ display: 'inline', width: 14, height: 14, marginRight: 6 }} />Safety Network Graph
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
      ) : activeTab === 'CHECKER' ? (
        <SafetyChecker drugs={drugs} interactions={data} />
      ) : (
        <SafetyNetworkGraph drugs={drugs} interactions={data} />
      )}

      {showModal && <Modal onClose={() => setModal(false)} onSuccess={(m) => { flash(m); load(); }} />}
      {toast && <div className="toast"><Icon.Check />{toast}</div>}
    </div>
  );
}
