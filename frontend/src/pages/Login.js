import React, { useState } from 'react';
import axios from 'axios';
import { Icon } from '../components/Icons';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      onLogin(res.data);
    } catch {
      setError('Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand">
            <div className="login-brand-icon"><Icon.Database /></div>
            <h1>PharmaDB</h1>
          </div>
          <div className="login-headline">Pharmaceutical Drug Management System</div>
          <div className="login-sub">
            A centralized platform for managing drug compositions, interactions, and safety data across clinical teams.
          </div>
          <div className="login-features">
            {['Complete drug registry with 17 linked tables','Role-based access for Admins, Doctors & Researchers','Real-time interaction and safety monitoring','Full audit trail for all data changes'].map(f => (
              <div className="login-feature" key={f}>
                <div className="login-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="login-box-header">
            <h2>Sign in</h2>
            <p>Enter your credentials to access the system</p>
          </div>
          <form className="login-form" onSubmit={handle}>
            <div className="field">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            {error && <div className="login-error">{error}</div>}
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div className="login-creds">
            <div className="login-creds-title">Demo Credentials</div>
            {[
              { role: 'Admin',      icon: '◆', user: 'admin',       pass: 'Admin@123' },
              { role: 'Doctor',     icon: '◇', user: 'drsmith',     pass: 'Doctor@123' },
              { role: 'Researcher', icon: '○', user: 'researcher1', pass: 'Research@123' },
            ].map(c => (
              <div className="cred-row" key={c.role}>
                <span className="cred-role"><span>{c.icon}</span>{c.role} — {c.user}</span>
                <span className="cred-pass">{c.pass}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}