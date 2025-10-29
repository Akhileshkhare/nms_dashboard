import React, { useState } from 'react';
import { BrowserRouter as Router, HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import Dashboard from './components/Dashboard.tsx';
import DashboardMap from './components/DashboardMap.tsx';
import NMS from './components/NMS.tsx';
import UserManagement from './components/UserManagement.tsx';
import RulesEngine from './components/RulesEngine.tsx';
import Login from './components/Login.tsx';
import Modal from './components/Modal.tsx';
import ResetPassword from './components/ResetPassword.tsx';
import DeviceManagement from './components/DeviceManagement.tsx';
import DashboardManager from './components/DashboardManager.tsx';
import DeviceDetails from './components/DeviceDetails.tsx';
import './App.css';
// Wrapper to extract device from route state
function DeviceDetailsWrapper() {
  const location = useLocation();
  const device = location.state?.device;
  if (!device) return <div className="p-6">Device not found.</div>;
  return <DeviceDetails device={device} />;
}

function App() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [showLogout, setShowLogout] = useState(false);

  const isElectron = !!(window && window.process && (window.process as any).type);

  const RouterComponent = isElectron ? HashRouter : Router;

  return (
    <RouterComponent>
      <Routes>
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="*" element={
          !user ? <Login onLogin={setUser} /> : (
            <div style={{ minHeight: '100vh', background: '#f6f8fa' }}>
              {/* Top Header Navigation */}
              <header style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', height: 64 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                  <span style={{ fontWeight: 'bold', fontSize: 22, color: '#2563eb', letterSpacing: 1 }}>IoT BI Mapping</span>
                  <Link to="/" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, padding: '8px 18px', borderRadius: 6, transition: 'background 0.2s', marginRight: 4 }}>Home</Link>
                  <Link to="/dashboards" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, padding: '8px 18px', borderRadius: 6, transition: 'background 0.2s', marginRight: 4 }}>Dashboard</Link>
                  <Link to="/nms" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, padding: '8px 18px', borderRadius: 6, transition: 'background 0.2s', marginRight: 4 }}>NMS</Link>
                  <Link to="/rules" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, padding: '8px 18px', borderRadius: 6, transition: 'background 0.2s', marginRight: 4 }}>Rules Engine</Link>
                  <Link to="/users" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, padding: '8px 18px', borderRadius: 6, transition: 'background 0.2s', marginRight: 4 }}>User Management</Link>
                  <Link to="/devices" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, padding: '8px 18px', borderRadius: 6, transition: 'background 0.2s', marginRight: 4 }}>Device Management</Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontWeight: 500, color: '#2563eb', marginRight: 8 }}>{user.name}</span>
                  <span style={{ fontSize: 22, marginRight: 8 }}>👤</span>
                  <button onClick={() => setShowLogout(true)} style={{ padding: '8px 18px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: 6, fontWeight: 500 }}>Logout</button>
                </div>
              </header>
              {/* Main Content */}
              <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 64px)' }}>
                <Routes>
                  <Route path="/" element={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, marginBottom: 16 }}>
                        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#2563eb', marginBottom: 12 }}>Welcome, {user.name}!</h1>
                        <p style={{ fontSize: 18, color: '#444', marginBottom: 18 }}>Your IoT BI dashboard is ready. Use the navigation above to manage users, devices, dashboards, and more.</p>
                        <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
                          <Link to="/dashboards" style={{ background: '#2563eb', color: '#fff', fontWeight: 500, padding: '18px 32px', borderRadius: 12, fontSize: 18, textDecoration: 'none', boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>Go to Dashboards</Link>
                          <Link to="/devices" style={{ background: '#22c55e', color: '#fff', fontWeight: 500, padding: '18px 32px', borderRadius: 12, fontSize: 18, textDecoration: 'none', boxShadow: '0 2px 8px rgba(34,197,94,0.08)' }}>Go to Devices</Link>
                          <Link to="/users" style={{ background: '#a855f7', color: '#fff', fontWeight: 500, padding: '18px 32px', borderRadius: 12, fontSize: 18, textDecoration: 'none', boxShadow: '0 2px 8px rgba(168,85,247,0.08)' }}>Go to Users</Link>
                        </div>
                      </div>
                      {/* Map Section */}
                      <DashboardMap />
                      {/* Quick KPIs */}
                      <div style={{ display: 'flex', gap: 32 }}>
                        <div style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, textAlign: 'center' }}>
                          <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Total Users</div>
                          <div style={{ fontSize: 32, fontWeight: 700, color: '#2563eb' }}>--</div>
                        </div>
                        <div style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, textAlign: 'center' }}>
                          <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Total Devices</div>
                          <div style={{ fontSize: 32, fontWeight: 700, color: '#22c55e' }}>--</div>
                        </div>
                        <div style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, textAlign: 'center' }}>
                          <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Dashboards</div>
                          <div style={{ fontSize: 32, fontWeight: 700, color: '#a855f7' }}>--</div>
                        </div>
                      </div>
                    </div>
                  } />
                  <Route path="/dashboards" element={<DashboardManager />} />
                  <Route path="/nms" element={<NMS />} />
                  <Route path="/rules" element={<RulesEngine />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/devices" element={<DeviceManagement />} />
                  <Route path="/device/:deviceId" element={<DeviceDetailsWrapper />} />
                </Routes>
              </main>
              {/* Confirm Logout Modal */}
              <Modal open={showLogout} onClose={() => setShowLogout(false)} title="Confirm Logout"
                actions={[
                  <button key="cancel" onClick={() => setShowLogout(false)} style={{ padding: '8px 18px' }}>Cancel</button>,
                  <button key="logout" onClick={() => {
                    setShowLogout(false);
                    localStorage.clear();
                    setUser(null);
                    window.location.href = '/';
                  }} style={{ background: '#d32f2f', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 4 }}>Logout</button>
                ]}
              >
                Are you sure you want to logout?
              </Modal>
            </div>
          )
        } />
      </Routes>
    </RouterComponent>
  );
}
export default App;
