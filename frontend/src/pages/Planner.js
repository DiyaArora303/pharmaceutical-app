import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';

export default function Planner() {
  const [drugs, setDrugs]                     = useState([]);
  const [contraindications, setContraindications] = useState([]);
  const [interactions, setInteractions]       = useState([]);
  const [sideEffects, setSideEffects]         = useState([]);
  const [loading, setLoading]                 = useState(true);

  // Planner state
  const [patientName, setPatientName]         = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [prescribedDrugs, setPrescribedDrugs] = useState([]);
  const [drugSelect, setDrugSelect]           = useState('');

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/drugs'),
      axios.get('http://localhost:5000/api/contraindications'),
      axios.get('http://localhost:5000/api/interactions'),
      axios.get('http://localhost:5000/api/sideeffects')
    ]).then(([d, c, inter, se]) => {
      setDrugs(d.data);
      setContraindications(c.data);
      setInteractions(inter.data);
      setSideEffects(se.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addDrug = () => {
    if (!drugSelect) return;
    const drug = drugs.find(d => d.Drug_ID === parseInt(drugSelect));
    if (drug && !prescribedDrugs.some(pd => pd.Drug_ID === drug.Drug_ID)) {
      setPrescribedDrugs([...prescribedDrugs, drug]);
    }
    setDrugSelect('');
  };

  const removeDrug = (id) => {
    setPrescribedDrugs(prescribedDrugs.filter(d => d.Drug_ID !== id));
  };

  const toggleCondition = (condName) => {
    if (selectedConditions.includes(condName)) {
      setSelectedConditions(selectedConditions.filter(c => c !== condName));
    } else {
      setSelectedConditions([...selectedConditions, condName]);
    }
  };

  // Run dynamic safety analysis
  const analyzePlan = () => {
    if (prescribedDrugs.length === 0) return null;

    const criticalWarnings = [];
    const interactionWarnings = [];
    const sideEffectsList = [];

    // 1. Check Contraindications
    prescribedDrugs.forEach(drug => {
      selectedConditions.forEach(condName => {
        const match = contraindications.find(c => c.Condition_Name === condName);
        if (match && match.Drugs && match.Drugs.split(', ').includes(drug.Brand_Name)) {
          criticalWarnings.push({
            drug: drug.Brand_Name,
            condition: condName,
            message: `${drug.Brand_Name} is contraindicated for patients with ${condName}.`
          });
        }
      });
    });

    // 2. Check Drug-Drug Interactions
    for (let i = 0; i < prescribedDrugs.length; i++) {
      const d1 = prescribedDrugs[i];
      for (let j = i + 1; j < prescribedDrugs.length; j++) {
        const d2 = prescribedDrugs[j];
        const match = interactions.find(item => 
          (item.Drug_One === d1.Brand_Name && item.Drug_Two === d2.Brand_Name) ||
          (item.Drug_One === d2.Brand_Name && item.Drug_Two === d1.Brand_Name)
        );
        if (match) {
          interactionWarnings.push({
            drug1: d1.Brand_Name,
            drug2: d2.Brand_Name,
            description: match.Interaction_Description
          });
        }
      }
    }

    // 3. Gather Side Effects
    let mildCount = 0;
    let moderateCount = 0;
    let severeCount = 0;

    prescribedDrugs.forEach(drug => {
      const linkedSe = sideEffects.filter(se => se.Drug_ID === drug.Drug_ID);
      linkedSe.forEach(se => {
        if (se.Severity === 'Mild') mildCount++;
        else if (se.Severity === 'Moderate') moderateCount++;
        else if (se.Severity === 'Severe') severeCount++;

        sideEffectsList.push({
          drug: drug.Brand_Name,
          description: se.Description,
          severity: se.Severity
        });
      });
    });

    // Compute Risk Score
    let score = 0;
    score += criticalWarnings.length * 100;
    score += interactionWarnings.length * 45;
    score += severeCount * 15;
    score += moderateCount * 5;
    score += mildCount * 1;

    let level = 'LOW RISK';
    let color = 'var(--green)';
    let bg = 'var(--green-bg)';
    let border = '#A7F3D0';
    if (score >= 100) {
      level = 'CRITICAL RISK';
      color = 'var(--red)';
      bg = 'var(--red-bg)';
      border = '#FECACA';
    } else if (score >= 45) {
      level = 'HIGH RISK';
      color = '#EA580C';
      bg = '#FFF3EB';
      border = '#FED7AA';
    } else if (score >= 10) {
      level = 'MODERATE RISK';
      color = 'var(--amber)';
      bg = 'var(--amber-bg)';
      border = '#FDE68A';
    }

    return {
      score,
      level,
      color,
      bg,
      border,
      criticalWarnings,
      interactionWarnings,
      sideEffectsCount: { mild: mildCount, moderate: moderateCount, severe: severeCount },
      sideEffectsList
    };
  };

  const report = analyzePlan();

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading Planner...</p></div>;

  return (
    <div className="planner-page">
      <div className="page-header no-print">
        <div>
          <div className="page-title"><Icon.Flask />Treatment Safety Simulator</div>
          <div className="page-sub">Create a treatment profile to simulate safety metrics and clinical risk</div>
        </div>
        {report && (
          <button className="btn-secondary" onClick={handlePrint}>
            🖨️ Print Clinical Report
          </button>
        )}
      </div>

      <div className="planner-grid">
        {/* Left Input Configuration Card */}
        <div className="card no-print" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="chart-label"><Icon.User />1. Patient Information</div>
          <div className="field">
            <label>Patient Full Name</label>
            <input placeholder="e.g. John Doe" value={patientName} onChange={e => setPatientName(e.target.value)} />
          </div>

          <div className="chart-label" style={{ marginTop: 8 }}><Icon.Shield />2. Patient Medical Conditions</div>
          <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 6 }}>
            {contraindications.map(c => (
              <label key={c.Contraindication_ID} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.86rem', cursor: 'pointer', color: 'var(--text2)' }}>
                <input
                  type="checkbox"
                  style={{ width: 15, height: 15 }}
                  checked={selectedConditions.includes(c.Condition_Name)}
                  onChange={() => toggleCondition(c.Condition_Name)}
                />
                {c.Condition_Name}
              </label>
            ))}
          </div>

          <div className="chart-label" style={{ marginTop: 8 }}><Icon.Pill />3. Prescribe Medications</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select style={{ flex: 1 }} value={drugSelect} onChange={e => setDrugSelect(e.target.value)}>
              <option value="">Select drug...</option>
              {drugs.map(d => (
                <option key={d.Drug_ID} value={d.Drug_ID} disabled={prescribedDrugs.some(pd => pd.Drug_ID === d.Drug_ID)}>
                  {d.Brand_Name} ({d.Generic_Name})
                </option>
              ))}
            </select>
            <button className="btn-primary" onClick={addDrug}>Prescribe</button>
          </div>

          {prescribedDrugs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text3)' }}>Medication Plan List</label>
              {prescribedDrugs.map(d => (
                <div key={d.Drug_ID} className="ingredient-row" style={{ padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{d.Brand_Name}</div>
                  <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.74rem', border: '1px solid #FECACA', color: 'var(--red)', background: 'var(--red-bg)' }} onClick={() => removeDrug(d.Drug_ID)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Safety Report HUD */}
        <div className="card print-full-width" style={{ position: 'relative' }}>
          <div className="chart-label"><Icon.Log />Simulation Safety Report</div>
          
          {/* Print Only Header */}
          <div className="print-only-header" style={{ display: 'none', marginBottom: 20 }}>
            <h2 style={{ color: 'var(--accent)' }}>PharmaDB Clinical Safety Report</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text2)', borderBottom: '1px dashed var(--border)', paddingBottom: 10 }}>
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </div>
          </div>

          {report ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Patient details banner */}
              <div style={{ padding: 14, borderRadius: 10, background: 'var(--surface2)', border: '1.5px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Patient Name</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{patientName || 'Anonymous Patient'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Pre-existing Conditions</span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text2)' }}>
                    {selectedConditions.length === 0 ? 'None reported' : selectedConditions.join(', ')}
                  </div>
                </div>
              </div>

              {/* Risk Level Badge and Meter */}
              <div style={{
                padding: '16px 20px',
                borderRadius: 12,
                border: '1.5px solid',
                borderColor: report.border,
                background: report.bg,
                color: report.color
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', tracking: '0.5px' }}>CLINICAL SAFETY INDEX</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{report.level}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>RISK SCORE</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{report.score}</h3>
                  </div>
                </div>
              </div>

              {/* Critical Warnings */}
              <div>
                <h4 style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', borderBottom: '1.5px solid var(--border)', paddingBottom: 6, marginBottom: 10 }}>
                  🚨 Critical Conflicts ({report.criticalWarnings.length})
                </h4>
                {report.criticalWarnings.length === 0 ? (
                  <div className="none-text" style={{ fontSize: '0.86rem' }}>No critical contraindications detected.</div>
                ) : (
                  report.criticalWarnings.map((w, idx) => (
                    <div key={idx} style={{ padding: 12, borderRadius: 8, background: 'var(--red-bg)', border: '1px solid #FECACA', color: 'var(--red)', fontSize: '0.86rem', marginBottom: 6, fontWeight: 600 }}>
                      • {w.message}
                    </div>
                  ))
                )}
              </div>

              {/* Interactions */}
              <div>
                <h4 style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', borderBottom: '1.5px solid var(--border)', paddingBottom: 6, marginBottom: 10 }}>
                  ⚠️ Drug-Drug Interactions ({report.interactionWarnings.length})
                </h4>
                {report.interactionWarnings.length === 0 ? (
                  <div className="none-text" style={{ fontSize: '0.86rem' }}>No drug-drug interaction risks flagged.</div>
                ) : (
                  report.interactionWarnings.map((w, idx) => (
                    <div key={idx} style={{ padding: 12, borderRadius: 8, background: 'var(--amber-bg)', border: '1px solid #FDE68A', color: 'var(--amber)', fontSize: '0.85rem', marginBottom: 6 }}>
                      <strong>{w.drug1} + {w.drug2}</strong>: {w.description}
                    </div>
                  ))
                )}
              </div>

              {/* Side Effects */}
              <div>
                <h4 style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', borderBottom: '1.5px solid var(--border)', paddingBottom: 6, marginBottom: 10 }}>
                  🩺 Collective Side Effect Risk Profile
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div style={{ padding: 10, background: 'var(--surface2)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{report.sideEffectsCount.mild}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 600 }}>Mild Effects</div>
                  </div>
                  <div style={{ padding: 10, background: 'var(--surface2)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{report.sideEffectsCount.moderate}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 600 }}>Moderate Effects</div>
                  </div>
                  <div style={{ padding: 10, background: 'var(--surface2)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{report.sideEffectsCount.severe}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 600 }}>Severe Effects</div>
                  </div>
                </div>

                {report.sideEffectsList.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', paddingRight: 6 }}>
                    {report.sideEffectsList.map((se, idx) => {
                      const seCls = se.severity === 'Severe' ? 'badge-red' : se.severity === 'Moderate' ? 'badge-amber' : 'badge-gray';
                      return (
                        <div key={idx} className="ingredient-row" style={{ padding: '6px 10px', background: 'var(--bg)', borderRadius: 6, fontSize: '0.8rem' }}>
                          <span>{se.drug} • {se.description}</span>
                          <span className={`badge ${seCls}`} style={{ fontSize: '0.64rem', padding: '1px 6px' }}>{se.severity}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'var(--text3)', textAlign: 'center', padding: '60px 0' }}>
              <Icon.Flask style={{ width: 44, height: 44, opacity: 0.25, marginBottom: 12 }} />
              <h4 style={{ fontSize: '1rem', color: 'var(--text2)', fontWeight: 700, marginBottom: 4 }}>Simulator Awaiting Treatment Profile</h4>
              <p style={{ fontSize: '0.86rem', maxWidth: 320 }}>Select patient conditions and prescribe drugs in the config panel to simulate clinical risk metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
