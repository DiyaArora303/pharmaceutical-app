import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';

export default function Ingredients() {
  const [data, setData]   = useState({ active: [], inactive: [] });
  const [tab, setTab]     = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/ingredients').then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading ingredients...</p></div>;

  const rows = tab === 'active' ? data.active : data.inactive;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Icon.Ingredient />Ingredients</div>
          <div className="page-sub">Active and inactive excipients across all drug formulations</div>
        </div>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
          Active Ingredients ({data.active.length})
        </button>
        <button className={`tab ${tab === 'inactive' ? 'active' : ''}`} onClick={() => setTab('inactive')}>
          Inactive Excipients ({data.inactive.length})
        </button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{tab === 'active' ? 'Ingredient Name' : 'Excipient Name'}</th>
                <th>Drug</th>
                {tab === 'active' && <th>Strength</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td><strong>{tab === 'active' ? r.Ingredient_Name : r.Excipient_Name}</strong></td>
                  <td>{r.Brand_Name}</td>
                  {tab === 'active' && <td><span className="badge badge-blue">{r.Strength}</span></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}