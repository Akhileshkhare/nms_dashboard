import React, { useState } from 'react';
import { BrowserRouter as Router, HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import Dashboard from './components/Dashboard.tsx';
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
            <div style={{ display: 'flex', height: '100vh' }}>
              {/* Side Menu */}
              <aside style={{ width: 220, background: '#222', color: '#fff', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 32 }}>IoT BI Mapping</div>
                <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginBottom: 8 }}>Home</Link>
                <Link to="/dashboards" style={{ color: '#fff', textDecoration: 'none', marginBottom: 8 }}>Dashboard</Link>
                <Link to="/nms" style={{ color: '#fff', textDecoration: 'none', marginBottom: 8 }}>NMS</Link>
                <Link to="/rules" style={{ color: '#fff', textDecoration: 'none', marginBottom: 8 }}>Rules Engine</Link>
                <Link to="/users" style={{ color: '#fff', textDecoration: 'none', marginBottom: 8 }}>User Management</Link>
                <Link to="/devices" style={{ color: '#fff', textDecoration: 'none', marginBottom: 8 }}>Device Management</Link>
              </aside>
              {/* Main Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Top Header */}
                <header style={{ background: '#f5f5f5', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: '1px solid #ddd' }}>
                  <span style={{ marginRight: 16 }}><b>{user.name}</b></span>
                  <span style={{ marginRight: 16, fontSize: 22 }}>👤</span>
                  <button onClick={() => setShowLogout(true)} style={{ padding: '6px 16px', border: 'none', background: '#1976d2', color: '#fff', borderRadius: 4 }}>Logout</button>
                </header>
                {/* Page Content */}
                <main style={{ flex: 1, overflow: 'auto', background: '#fafbfc' }}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboards" element={<DashboardManager />} />
                    <Route path="/nms" element={<NMS />} />
                    <Route path="/rules" element={<RulesEngine />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/devices" element={<DeviceManagement />} />
                    <Route path="/device/:deviceId" element={<DeviceDetailsWrapper />} />
                  </Routes>
                </main>
              </div>
            </div>
          )
        } />
      </Routes>
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
    </RouterComponent>
  );
}
export default App;
