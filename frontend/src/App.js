import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
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

export default function App() {
  const [user, setUser] = useState(null);

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
      </div>
    </Router>
  );
}