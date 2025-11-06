import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import dummyDevicesData from '../data/dummyDevices.json';
import { BASE_URL } from '../service/Config.tsx';
import Modal from './Modal.tsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Type definitions
interface Device {
  id: number;
  name: string;
  imei: string;
  groupId: string;
  data: Array<{ time: string; temperature: number; humidity: number; battery: number; lat: number; lng: number }>;
}

interface Widget {
  id: number;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'map';
  title: string;
  xField?: string;
  yField?: string;
  dataField?: string;
  groupId?: string;
  deviceIds?: number[];
  lat?: number;
  lng?: number;
}

interface Dashboard {
  id: number;
  title: string;
  description: string;
  created: string;
  userId: number;
  userName: string;
  widgets: Widget[];
}

const DashboardManager: React.FC = () => {
  // Available fields for widgets
  const availableFields = [
    { value: 'time', label: 'Time' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'humidity', label: 'Humidity' },
    { value: 'battery', label: 'Battery' },
    { value: 'lat', label: 'Latitude' },
    { value: 'lng', label: 'Longitude' },
  ];

  // Devices state
  const [allDevices, setAllDevices] = useState<Device[]>(dummyDevicesData as Device[]);

  // Device groups
  const [deviceGroups, setDeviceGroups] = useState([
    { id: 'group1', name: 'Group 1' },
    { id: 'group2', name: 'Group 2' },
    { id: 'group3', name: 'Group 3' },
  ]);
  const [newGroupName, setNewGroupName] = useState('');

  // Widget form state
  const [widgetForm, setWidgetForm] = useState({
    title: '',
    xField: '',
    yField: '',
    dataField: '',
    groupId: '',
    deviceIds: [] as number[],
  });

  // Chart types for widget selection
  const chartTypes = [
    { type: 'line', label: 'Line Chart' },
    { type: 'bar', label: 'Bar Chart' },
    { type: 'pie', label: 'Pie Chart' },
    { type: 'doughnut', label: 'Doughnut Chart' },
    { type: 'map', label: 'Map' },
  ];

  // Dashboard edit modal state
  const [showEdit, setShowEdit] = useState<{ open: boolean; dash?: Dashboard }>({ open: false });
  const [form, setForm] = useState({ title: '', description: '', userIds: [] as number[] });
  const [widgets, setWidgets] = useState<any[]>([]);
  const [editingWidgetIdx, setEditingWidgetIdx] = useState<number | null>(null);

  // Widget add modal state
  const [showWidget, setShowWidget] = useState<{ open: boolean; dashId?: number }>({ open: false });
  const [widgetType, setWidgetType] = useState<'line' | 'bar' | 'pie' | 'doughnut' | 'map'>('line');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // Dashboards state
  const [dashboards, setDashboards] = useState<Dashboard[]>([
    {
      id: 1001,
      title: 'Demo Dashboard',
      description: 'A sample dashboard with map, charts, and device info.',
      created: new Date().toISOString(),
      userId: 1,
      userName: 'Demo User',
      widgets: [
        {
          id: 2001,
          type: 'map',
          title: 'Device Locations',
          groupId: 'group1',
          deviceIds: allDevices.filter((d: Device) => d.groupId === 'group1').map((d: Device) => d.id),
        },
        {
          id: 2002,
          type: 'line',
          title: 'Temperature Trend',
          groupId: 'group1',
          xField: 'time',
          yField: 'temperature',
          dataField: 'temperature',
          deviceIds: [allDevices.find((d: Device) => d.groupId === 'group1')?.id || 1],
        },
        {
          id: 2003,
          type: 'bar',
          title: 'Humidity Comparison',
          groupId: 'group2',
          xField: 'time',
          yField: 'humidity',
          dataField: 'humidity',
          deviceIds: allDevices.filter((d: Device) => d.groupId === 'group2').map((d: Device) => d.id),
        },
        {
          id: 2004,
          type: 'doughnut',
          title: 'Battery Status',
          groupId: 'group3',
          dataField: 'battery',
          deviceIds: allDevices.filter((d: Device) => d.groupId === 'group3').map((d: Device) => d.id),
        },
      ],
    },
  ]);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const fallbackUsers = [
    { id: 1, user_id: 'dkelwa.kelwa@gmail.com', role: 'admin', status: 1, is_deleted: 0, name: 'Super Admin' },
  ];

  // Fetch users (demo)
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const res = await fetch(`${BASE_URL}lot/v1/user/all`, {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setUsers(fallbackUsers);
      }
    };
    fetchUsers();
  }, []);

  // Add dashboard modal state
  const [showAdd, setShowAdd] = useState(false);
  const [showWidgetPopup, setShowWidgetPopup] = useState<{ open: boolean; type?: string }>({ open: false });
  // Dashboard view modal state
  const [showDashboardView, setShowDashboardView] = useState<{ open: boolean; dash?: Dashboard }>({ open: false });

  // Add dashboard (local demo)
  const handleAddDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    // Save dashboard info locally
    const newDashboard: Dashboard = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      created: new Date().toISOString(),
      widgets: widgets.map(w => ({
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: w.type,
        title: w.title,
        lat: w.lat,
        lng: w.lng,
        groupId: w.groupId,
        xField: w.xField,
        yField: w.yField,
        dataField: w.dataField,
        deviceIds: w.deviceIds,
      })),
      userId: form.userIds[0] || 0,
      userName: '',
    };
    setDashboards(prev => [...prev, newDashboard]);
    setForm({ title: '', description: '', userIds: [] });
    setWidgets([]);
    setEditingWidgetIdx(null);
    setShowAdd(false);
    setShowDashboardView({ open: true, dash: newDashboard });
  };

  // Edit dashboard (open modal)
  const handleEditDashboard = (dash: Dashboard) => {
    setShowEdit({ open: true, dash });
    setForm({ title: dash.title, description: dash.description, userIds: [dash.userId] });
    setWidgets(dash.widgets);
  };

  // Update dashboard (demo, local only)
  const handleUpdateDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit.dash) return;
    const now = new Date().toISOString();
    const selectedUsers = users.filter((u) => form.userIds.includes(u.id));
    setDashboards(
      dashboards.map((d: Dashboard) =>
        d.id === showEdit.dash!.id
          ? {
              ...d,
              title: form.title,
              description: form.description,
              userId: form.userIds[0] || 0,
              userName: selectedUsers[0]?.name || '',
              widgets: widgets,
              created: d.created,
            }
          : d
      )
    );
    setShowEdit({ open: false });
    setForm({ title: '', description: '', userIds: [] });
    setWidgets([]);
    setEditingWidgetIdx(null);
  };

  // Delete dashboard (demo, local only)
  const handleDeleteDashboard = (id: number) => {
    if (window.confirm('Delete this dashboard?')) {
      setDashboards(dashboards.filter((d: Dashboard) => d.id !== id));
    }
  };

  const handleAddWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showWidget.dashId) return;
    let widget: Widget = { id: Date.now(), type: widgetType, title: widgetTitle };
    if (widgetType === 'map') {
      widget = { ...widget, lat: Number(lat), lng: Number(lng) };
    }
    setDashboards(
      dashboards.map((d: Dashboard) =>
        d.id === showWidget.dashId ? { ...d, widgets: [...d.widgets, widget] } : d
      )
    );
    setWidgetTitle('');
    setWidgetType('line');
    setLat('');
    setLng('');
    setShowWidget({ open: false });
  };

  // Main render
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Custom Dashboards</h2>
      <button onClick={() => setShowAdd(true)} className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800 mb-4">
        + Add Dashboard
      </button>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white rounded-lg shadow text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Widgets</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dashboards.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4">No dashboards found.</td></tr>
            ) : dashboards.map(dash => (
              <tr key={dash.id}>
                <td className="px-3 py-2">{new Date(dash.created).toLocaleString()}</td>
                <td className="px-3 py-2 font-bold">{dash.title}</td>
                <td className="px-3 py-2">{dash.description}</td>
                <td className="px-3 py-2">{dash.widgets.length}</td>
                <td className="px-3 py-2">
                  <button onClick={() => setShowDashboardView({ open: true, dash })} className="px-2 py-1 bg-blue-600 text-white rounded mr-2">View</button>
                  <button onClick={() => setShowWidget({ open: true, dashId: dash.id })} className="px-2 py-1 bg-green-600 text-white rounded mr-2">+ Add Widget</button>
                  <button onClick={() => handleEditDashboard(dash)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">Edit</button>
                  <button onClick={() => handleDeleteDashboard(dash.id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Dashboard Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center" style={{overflowY:'auto'}}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl mx-auto p-8 relative">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
            <h2 className="text-2xl font-bold mb-6 text-blue-800">Add Dashboard</h2>
            <form id="add-dash-form" onSubmit={handleAddDashboard} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Dashboard Info */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dash_title">Title</label>
                <input name="title" id="dash_title" placeholder="Dashboard Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4" />
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dash_desc">Description</label>
                <input name="description" id="dash_desc" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4" />
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dash_users">Users</label>
                <select
                  name="userIds"
                  id="dash_users"
                  multiple
                  value={form.userIds.map(String)}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                    setForm(f => ({ ...f, userIds: options }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                  required
                  style={{ minHeight: 90 }}
                >
                  {/* You may want to map users here if available */}
                  <option value={1}>Demo User</option>
                </select>
                <span className="text-xs text-gray-500">Hold Ctrl (Windows) or Cmd (Mac) to select multiple users</span>

                {/* Device Group and Device Selection */}
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Select Device Group</label>
                <select
                  value={widgetForm.groupId}
                  onChange={e => setWidgetForm(f => ({ ...f, groupId: e.target.value, deviceIds: [] }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                  required
                >
                  <option value="">Select Group</option>
                  {deviceGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Devices</label>
                <select
                  multiple
                  value={widgetForm.deviceIds.map(String)}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                    setWidgetForm(f => ({ ...f, deviceIds: options }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                  required
                  style={{ minHeight: 90 }}
                >
                  {allDevices.filter(d => d.groupId === widgetForm.groupId).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <span className="text-xs text-gray-500">Hold Ctrl (Windows) or Cmd (Mac) to select multiple devices</span>
                <div className="mt-8 flex gap-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded">Add Dashboard</button>
                </div>
              </div>
              {/* Widget Type Grid */}
              <div className="col-span-2">
                <div className="mb-4 text-lg font-semibold text-blue-700">Add Widgets</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {chartTypes.map(opt => (
                    <div
                      key={opt.type}
                      className="border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all hover:shadow-lg bg-gray-50 hover:bg-blue-50"
                      onClick={() => setWidgetType(opt.type as any)}
                    >
                      {/* Chart icons as before */}
                      {opt.type === 'line' && <svg width="48" height="48" viewBox="0 0 32 32"><polyline points="4,28 12,16 20,20 28,8" fill="none" stroke="#2563eb" strokeWidth="2" /></svg>}
                      {opt.type === 'bar' && <svg width="48" height="48" viewBox="0 0 32 32"><rect x="6" y="16" width="4" height="12" fill="#2563eb" /><rect x="14" y="8" width="4" height="20" fill="#2563eb" /><rect x="22" y="12" width="4" height="16" fill="#2563eb" /></svg>}
                      {opt.type === 'pie' && <svg width="48" height="48" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#e0e7ff" stroke="#2563eb" strokeWidth="2" /><path d="M16 16 L16 2 A14 14 0 0 1 30 16 Z" fill="#2563eb" /></svg>}
                      {opt.type === 'doughnut' && <svg width="48" height="48" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#e0e7ff" stroke="#2563eb" strokeWidth="2" /><circle cx="16" cy="16" r="7" fill="#fff" /></svg>}
                      {opt.type === 'map' && <svg width="48" height="48" viewBox="0 0 32 32"><rect x="4" y="24" width="24" height="4" fill="#2563eb" /><circle cx="16" cy="16" r="7" fill="#e0e7ff" stroke="#2563eb" strokeWidth="2" /><circle cx="16" cy="16" r="2" fill="#2563eb" /></svg>}
                      <span className="mt-2 text-base font-medium text-center">{opt.label}</span>
                    </div>
                  ))}
                </div>
                {/* Preview of selected widgets will go here */}
                <div className="mt-8">
                  <div className="mb-2 text-gray-700 font-semibold">Widgets Preview</div>
                  {widgets.length === 0 ? (
                    <div className="text-gray-400">No widgets added yet.</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {widgets.map((w, i) => (
                        <div key={i} className="bg-white border rounded-lg p-4 flex flex-col items-center shadow-sm">
                          <div className="mb-2 font-bold text-blue-700">{w.title}</div>
                          <div className="mb-1 text-xs text-gray-500">{w.type}</div>
                          {/* Optionally show X/Y/Lat/Lng values here */}
                          {w.type === 'map' && (
                            <div className="text-xs text-blue-700">
                              Group: {deviceGroups.find(g => g.id === w.groupId)?.name || w.groupId || 'N/A'}
                            </div>
                          )}
                          <button type="button" className="mt-2 text-xs text-red-600 underline" onClick={() => setWidgets(widgets.filter((_, idx) => idx !== i))}>Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Page Dashboard View */}
      {showDashboardView.open && showDashboardView.dash && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-95 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center px-8 py-6 border-b">
            <div>
              <div className="text-3xl font-bold text-blue-800">{showDashboardView.dash.title}</div>
              <div className="text-gray-700 mt-2">{showDashboardView.dash.description}</div>
              <div className="text-xs text-gray-500 mt-1">Created: {new Date(showDashboardView.dash.created).toLocaleString()}</div>
              <div className="text-xs text-gray-500">User: {showDashboardView.dash.userName}</div>
            </div>
            <button onClick={() => setShowDashboardView({ open: false })} className="text-2xl text-gray-500 hover:text-gray-800 px-4 py-2">&times;</button>
          </div>
          <div className="px-8 py-6">
            <div className="text-2xl font-semibold text-blue-700 mb-6">Widgets</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {showDashboardView.dash.widgets.map((w, idx) => {
                // Get devices for widget
                const devices = Array.isArray(w.deviceIds) ? allDevices.filter(d => w.deviceIds?.includes(d.id)) : [];
                // Map widget rendering
                if (w.type === 'map') {
                  // Center map on first device or default
                  let center: [number, number] = [20, 77];
                  if (devices.length > 0 && devices[0].data.length > 0) {
                    center = [devices[0].data[0].lat, devices[0].data[0].lng];
                  }
                  return (
                    <div key={w.id} className="bg-white border rounded-lg shadow p-4">
                      <div className="font-bold text-blue-700 mb-2">{w.title}</div>
                      <div className="mb-2 text-xs text-blue-700">Group: {deviceGroups.find(g => g.id === w.groupId)?.name || w.groupId}</div>
                      <MapContainer center={center} zoom={5} style={{ height: 300, width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {devices.map(device => device.data.map((point, i) => (
                          <Marker key={device.id + '-' + i} position={[point.lat, point.lng]} icon={L.icon({ iconUrl: 'marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: 'marker-shadow.png', shadowSize: [41, 41] })}>
                            <Popup>
                              <div><strong>{device.name}</strong></div>
                              <div>IMEI: {device.imei}</div>
                              <div>Location: {point.lat}, {point.lng}</div>
                            </Popup>
                          </Marker>
                        )))}
                      </MapContainer>
                    </div>
                  );
                }
                if (w.type === 'line') {
                  // Use first device's data for line chart
                  const device = devices[0];
                  const chartData = device ? {
                    labels: device.data.map(d => (d as any)[w.xField || 'time']),
                    datasets: [{
                      label: w.title,
                      data: device.data.map(d => (d as any)[w.yField || 'temperature']),
                      borderColor: '#2563eb',
                      backgroundColor: 'rgba(37,99,235,0.1)',
                      fill: true,
                    }],
                  } : { labels: [], datasets: [] };
                  return (
                    <div key={w.id} className="bg-white border rounded-lg shadow p-4">
                      <div className="font-bold text-blue-700 mb-2">{w.title}</div>
                      <Line data={chartData} />
                    </div>
                  );
                }
                if (w.type === 'bar') {
                  // Use all selected devices for bar chart
                  const chartData = {
                    labels: devices.map(d => d.name),
                    datasets: [{
                      label: w.title,
                      data: devices.map(d => (d.data[0] as any)[w.yField || 'humidity']),
                      backgroundColor: '#2563eb',
                    }],
                  };
                  return (
                    <div key={w.id} className="bg-white border rounded-lg shadow p-4">
                      <div className="font-bold text-blue-700 mb-2">{w.title}</div>
                      <Bar data={chartData} />
                    </div>
                  );
                }
                if (w.type === 'doughnut') {
                  // Use all selected devices for doughnut chart
                  const chartData = {
                    labels: devices.map(d => d.name),
                    datasets: [{
                      label: w.title,
                      data: devices.map(d => (d.data[0] as any)[w.dataField || 'battery']),
                      backgroundColor: [
                        '#2563eb', '#60a5fa', '#818cf8', '#f472b6', '#fbbf24', '#34d399', '#f87171', '#a3e635', '#facc15', '#38bdf8', '#c026d3', '#eab308', '#f59e42', '#10b981', '#f43f5e'
                      ],
                    }],
                  };
                  return (
                    <div key={w.id} className="bg-white border rounded-lg shadow p-4">
                      <div className="font-bold text-blue-700 mb-2">{w.title}</div>
                      <Doughnut data={chartData} />
                    </div>
                  );
                }
                // Fallback: show widget info
                return (
                  <div key={w.id} className="bg-white border rounded-lg shadow p-4">
                    <div className="font-bold text-blue-700 mb-2">{w.title}</div>
                    <div className="text-xs text-gray-500 mb-1">Type: {w.type}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardManager;
