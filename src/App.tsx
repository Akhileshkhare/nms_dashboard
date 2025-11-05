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
import AddDashboard from './components/AddDashboard.tsx';
import { HomeIcon, DashboardIcon, AddIcon, NMSIcon, RulesIcon, UsersIcon, DevicesIcon } from './components/SidebarIcons.tsx';
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
            <div className="flex h-screen bg-graybg">
              {/* Side Menu */}
              <aside className="w-56 bg-sidebar text-white flex flex-col gap-2 py-8 px-4 shadow-lg">
                <div className="font-bold text-xl mb-8 tracking-wide">IoT BI Mapping</div>
                <Link to="/" className="mb-2 px-3 py-2 rounded flex items-center gap-3 hover:bg-primary/80 transition-colors group whitespace-nowrap">
                  <HomeIcon className="text-primary-light group-hover:text-white" />
                  Home
                </Link>
                <Link to="/dashboards" className="mb-2 px-3 py-2 rounded flex items-center gap-3 hover:bg-primary/80 transition-colors group whitespace-nowrap">
                  <DashboardIcon className="text-primary-light group-hover:text-white" />
                  Dashboard
                </Link>
                <Link to="/dashboard/add" className="mb-2 px-3 py-2 rounded flex items-center gap-3 hover:bg-primary/80 transition-colors group whitespace-nowrap">
                  <AddIcon className="text-primary-light group-hover:text-white" />
                  Add Dashboard
                </Link>
                {/* <Link to="/nms" className="mb-2 px-3 py-2 rounded flex items-center gap-3 hover:bg-primary/80 transition-colors group whitespace-nowrap">
                  <NMSIcon className="text-primary-light group-hover:text-white" />
                  NMS
                </Link> */}
                <Link to="/rules" className="mb-2 px-3 py-2 rounded flex items-center gap-3 hover:bg-primary/80 transition-colors group whitespace-nowrap">
                  <RulesIcon className="text-primary-light group-hover:text-white" />
                  Rules Engine
                </Link>
                <Link to="/users" className="mb-2 px-3 py-2 rounded flex items-center gap-3 hover:bg-primary/80 transition-colors group whitespace-nowrap">
                  <UsersIcon className="text-primary-light group-hover:text-white" />
                  User Management
                </Link>
                <Link to="/devices" className="mb-2 px-3 py-2 rounded flex items-center gap-3 hover:bg-primary/80 transition-colors group whitespace-nowrap">
                  <DevicesIcon className="text-primary-light group-hover:text-white" />
                  Device Management
                </Link>
              </aside>
              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="bg-white border-b border-border px-8 py-3 flex items-center justify-end shadow-sm">
                  <span className="mr-4 font-semibold text-gray-700">{user.name}</span>
                  <span className="mr-4 text-2xl">👤</span>
                  <button onClick={() => setShowLogout(true)} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Logout</button>
                </header>
                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-graybg p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboards" element={<DashboardManager />} />
                    <Route path="/dashboard/add" element={<AddDashboard />} />
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
