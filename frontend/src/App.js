import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Icon } from './components/Icons';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Drugs from './pages/Drugs';
import Interactions from './pages/Interactions';
import Ingredients from './pages/Ingredients';
import SideEffects from './pages/SideEffects';
import Compounds from './pages/Compounds';
import Contraindications from './pages/Contraindications';
import AuditLog from './pages/AuditLog';
import Planner from './pages/Planner';
import './App.css';

const NAV = [
  { to: '/',                end: true,  label: 'Dashboard',        Icon: Icon.Dashboard,    roles: ['admin','doctor','researcher'] },
  { to: '/drugs',           end: false, label: 'Drugs',            Icon: Icon.Pill,         roles: ['admin','doctor','researcher'], canAdd: ['admin','researcher'] },
  { to: '/interactions',    end: false, label: 'Interactions',     Icon: Icon.Alert,        roles: ['admin','doctor','researcher'], canAdd: ['admin'] },
  { to: '/planner',         end: false, label: 'Treatment Planner',Icon: Icon.Flask,        roles: ['admin','doctor','researcher'] },
  { to: '/ingredients',     end: false, label: 'Ingredients',      Icon: Icon.Ingredient,   roles: ['admin','doctor','researcher'] },
  { to: '/sideeffects',     end: false, label: 'Side Effects',     Icon: Icon.Stethoscope,  roles: ['admin','doctor','researcher'], canAdd: ['admin'] },
  { to: '/compounds',       end: false, label: 'Compounds',        Icon: Icon.Molecule,     roles: ['admin','doctor','researcher'], canAdd: ['admin','researcher'] },
  { to: '/contraindications',end:false, label: 'Contraindications',Icon: Icon.Shield,       roles: ['admin','doctor','researcher'], canAdd: ['admin'] },
  { to: '/auditlog',        end: false, label: 'Audit Log',        Icon: Icon.Log,          roles: ['admin'] },
];

function Sidebar({ user, onLogout }) {
  const initials = user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const avClass = `user-avatar av-${user.role}`;
  const allowedNav = NAV.filter(n => n.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="brand-icon"><Icon.Database /></div>
          <div>
            <div className="brand-name">PharmaDB</div>
            <div className="brand-sub">Drug Management System</div>
          </div>
        </div>
        <div className="user-card">
          <div className={avClass}>{initials}</div>
          <div>
            <div className="user-name">{user.full_name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Menu</div>
        {allowedNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <item.Icon />
            {item.label}
            {item.canAdd?.includes(user.role) && <span className="nav-pill">+</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={onLogout}>
          <Icon.LogOut /> Sign Out
        </button>
      </div>
    </aside>
  );
}

function PharmaBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I am PharmaBot, your virtual safety assistant. Ask me about drug side effects, contraindications, or drug-drug interactions!" }
  ]);
  const [input, setInput] = useState('');
  const [drugs, setDrugs] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [contraindications, setContraindications] = useState([]);
  const [sideEffects, setSideEffects] = useState([]);

  useEffect(() => {
    if (open && drugs.length === 0) {
      axios.get('http://localhost:5000/api/drugs').then(r => setDrugs(r.data));
      axios.get('http://localhost:5000/api/interactions').then(r => setInteractions(r.data));
      axios.get('http://localhost:5000/api/contraindications').then(r => setContraindications(r.data));
      axios.get('http://localhost:5000/api/sideeffects').then(r => setSideEffects(r.data));
    }
  }, [open, drugs]);

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    setTimeout(() => {
      const response = generateBotResponse(text);
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
    }, 600);
  };

  const generateBotResponse = (query) => {
    const q = query.toLowerCase().trim();

    const matchAnd = q.includes(' and ') || q.includes('+') || q.includes('&') || q.includes('with');
    if (matchAnd) {
      const words = q.split(/\s+and\s+|\s*\+\s*|\s*&\s*|\s+with\s+/);
      if (words.length >= 2) {
        const name1 = words[0].replace('check', '').trim();
        const name2 = words[1].trim();
        const d1 = drugs.find(d => d.Brand_Name.toLowerCase() === name1 || d.Generic_Name.toLowerCase() === name1);
        const d2 = drugs.find(d => d.Brand_Name.toLowerCase() === name2 || d.Generic_Name.toLowerCase() === name2);
        
        if (d1 && d2) {
          const match = interactions.find(item => 
            (item.Drug_One === d1.Brand_Name && item.Drug_Two === d2.Brand_Name) ||
            (item.Drug_One === d2.Brand_Name && item.Drug_Two === d1.Brand_Name)
          );
          if (match) {
            return `⚠️ Clinical alert: An interaction exists between ${d1.Brand_Name} and ${d2.Brand_Name}: "${match.Interaction_Description}"`;
          } else {
            return `No known interactions in our database between ${d1.Brand_Name} and ${d2.Brand_Name}.`;
          }
        }
      }
    }

    const matchedCi = contraindications.find(c => q.includes(c.Condition_Name.toLowerCase()));
    if (matchedCi) {
      const mentionedDrug = drugs.find(d => q.includes(d.Brand_Name.toLowerCase()));
      if (mentionedDrug) {
        const isContra = matchedCi.Drugs && matchedCi.Drugs.split(', ').includes(mentionedDrug.Brand_Name);
        if (isContra) {
          return `❌ CRITICAL WARNING: ${mentionedDrug.Brand_Name} is contraindicated for patients with ${matchedCi.Condition_Name}.`;
        } else {
          return `${mentionedDrug.Brand_Name} has no registered contraindication for ${matchedCi.Condition_Name}.`;
        }
      }
      return `For ${matchedCi.Condition_Name}, the contraindicated drugs are: ${matchedCi.Drugs || 'None linked'}.`;
    }

    if (q.includes('side effect') || q.includes('symptom') || q.includes('adverse')) {
      const mentionedDrug = drugs.find(d => q.includes(d.Brand_Name.toLowerCase()));
      if (mentionedDrug) {
        const linkedSe = sideEffects.filter(se => se.Drug_ID === mentionedDrug.Drug_ID);
        if (linkedSe.length > 0) {
          return `The reported side effects for ${mentionedDrug.Brand_Name} are: ` + 
            linkedSe.map(se => `${se.Description} (${se.Severity} severity)`).join(', ');
        }
        return `No side effects currently listed for ${mentionedDrug.Brand_Name}.`;
      }
    }

    const drugLookup = drugs.find(d => q.includes(d.Brand_Name.toLowerCase()));
    if (drugLookup) {
      return `Drug profile for ${drugLookup.Brand_Name}:
Class: ${drugLookup.Class_Name}
Generic Name: ${drugLookup.Generic_Name}
Status: ${drugLookup.Status_Name}
Form: ${drugLookup.Form_Name}`;
    }

    return "I couldn't parse that query. Try typing things like:\n- 'Check Tylenol + Advil'\n- 'Side effects of Prinivil'\n- 'Is Tylenol safe in Liver Disease?'";
  };

  return (
    <div className="pharmabot-container no-print">
      {!open ? (
        <button className="pharmabot-bubble" onClick={() => setOpen(true)}>
          💬
        </button>
      ) : (
        <div className="pharmabot-card">
          <div className="pharmabot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="pulsing-dot" />
              <strong>PharmaBot Clinical AI</strong>
            </div>
            <button className="pharmabot-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="pharmabot-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`pharmabot-msg-wrapper ${m.sender}`}>
                <div className={`pharmabot-msg ${m.sender}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="pharmabot-chips">
            <button onClick={() => handleSend("Tylenol + Advil")}>Advil + Tylenol?</button>
            <button onClick={() => handleSend("Prinivil side effects")}>Prinivil side effects?</button>
            <button onClick={() => handleSend("Advil in Kidney Disease")}>Advil in Kidney Disease?</button>
          </div>
          <form className="pharmabot-input-wrap" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input placeholder="Ask PharmaBot..." value={input} onChange={e => setInput(e.target.value)} />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [drugs, setDrugs] = useState([]);

  useEffect(() => {
    // Empty useEffect trigger for React Hooks compatibility
  }, []);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <Router>
      <div className="app-layout">
        <Sidebar user={user} onLogout={() => setUser(null)} />
        <main className="main-content">
          <Routes>
            <Route path="/"                  element={<Dashboard />} />
            <Route path="/drugs"             element={<Drugs user={user} />} />
            <Route path="/interactions"      element={<Interactions user={user} />} />
            <Route path="/planner"           element={<Planner />} />
            <Route path="/ingredients"       element={<Ingredients />} />
            <Route path="/sideeffects"       element={<SideEffects user={user} />} />
            <Route path="/compounds"         element={<Compounds user={user} />} />
            <Route path="/contraindications" element={<Contraindications user={user} />} />
            <Route path="/auditlog"          element={user.role === 'admin' ? <AuditLog /> : <Navigate to="/" />} />
            <Route path="*"                  element={<Navigate to="/" />} />
          </Routes>
        </main>
        <PharmaBot />
      </div>
    </Router>
  );
}