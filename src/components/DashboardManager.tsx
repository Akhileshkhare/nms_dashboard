import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../service/Config.tsx';
import Modal from './Modal.tsx';

interface Widget {
  id: number;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'map';
  title: string;
  lat?: number;
  lng?: number;
}

interface Dashboard {
  id: number;
  title: string;
  description: string;
  created: string;
  widgets: Widget[];
  userId: number;
  userName: string;
}

const chartTypes = [
  { type: 'line', label: 'Line Chart' },
  { type: 'bar', label: 'Bar Chart' },
  { type: 'pie', label: 'Pie Chart' },
  { type: 'doughnut', label: 'Doughnut Chart' },
  { type: 'map', label: 'Google Map' },
];

const DashboardManager: React.FC = () => {
  // Example fields for dropdowns (replace with real device fields if available)
  const availableFields = [
    { value: 'humidity', label: 'Device Humidity' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'location', label: 'Device Location' },
    { value: 'pressure', label: 'Pressure' },
    { value: 'battery', label: 'Battery Level' },
  ];
    // Device group state (for map widget)
    const [deviceGroups, setDeviceGroups] = useState([
      { id: 'group1', name: 'Group 1' },
      { id: 'group2', name: 'Group 2' },
      { id: 'group3', name: 'Group 3' },
    ]);
    const [newGroupName, setNewGroupName] = useState('');
  // Widget popup state
    const [widgetForm, setWidgetForm] = useState({
      title: '',
      xField: '',
      yField: '',
      dataField: '',
      groupId: '',
    });
  // Fetch users from API
  const [users, setUsers] = useState<any[]>([]);
  // Fetch users from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const res = await fetch(`${BASE_URL}lot/v1/user/all`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchUsers();
  }, []);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  // Fetch dashboards from API on mount
  useEffect(() => {
    const fetchDashboards = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const res = await fetch(`${BASE_URL}lot/v1/dashboards`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboards');
        const data = await res.json();
        // Map API data to local Dashboard interface
        const mapped = Array.isArray(data) ? data.map((d: any) => ({
          id: d.id,
          title: d.name,
          description: d.description,
          created: d.createdDate || '',
          widgets: Array.isArray(d.widgets) ? d.widgets.map((w: any) => ({
            id: w.id,
            type: (w.chartType || '').toLowerCase(),
            title: w.title,
            lat: w.lat,
            lng: w.lng,
          })) : [],
          userId: d.userIds && d.userIds[0] ? d.userIds[0] : 0,
          userName: '', // Optionally map user name if available
        })) : [];
        setDashboards(mapped);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchDashboards();
  }, []);
  const [showAdd, setShowAdd] = useState(false);
  const [showWidgetPopup, setShowWidgetPopup] = useState<{ open: boolean; type?: string }>({ open: false });
  const [showEdit, setShowEdit] = useState<{ open: boolean; dash?: Dashboard }>({ open: false });
  const [showWidget, setShowWidget] = useState<{ open: boolean; dashId?: number }>({ open: false });
  const [form, setForm] = useState({ title: '', description: '', userIds: [] as number[] });
  // For Add Dashboard modal widget management
  const [widgetType, setWidgetType] = useState<'line' | 'bar' | 'pie' | 'doughnut' | 'map'>('line');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [widgets, setWidgets] = useState<any[]>([]);
  const [editingWidgetIdx, setEditingWidgetIdx] = useState<number | null>(null);
  // ...existing code...

  // Add dashboard (API)
  const handleAddDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || '';
    const dashboardPayload = {
      id: 0,
      name: form.title,
      description: form.description,
      userIds: form.userIds,
      widgets: widgets.map(w => ({
        id: 0,
        title: w.title,
        chartType: w.type ? w.type.toUpperCase() : 'LINE',
        chartData: w.chartData || '',
        xaxisData: w.xaxisData || [],
        yaxisData: w.yaxisData || [],
      })),
    };
    try {
      const res = await fetch(`${BASE_URL}lot/v1/dashboards`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dashboardPayload),
      });
      if (!res.ok) throw new Error('Failed to add dashboard');
      // Optionally get the created dashboard from response
      // Refresh dashboards list
      const fetchDashboards = async () => {
        const res = await fetch(`${BASE_URL}lot/v1/dashboards`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboards');
        const data = await res.json();
        const mapped = Array.isArray(data) ? data.map((d: any) => ({
          id: d.id,
          title: d.name,
          description: d.description,
          created: d.createdDate || '',
          widgets: Array.isArray(d.widgets) ? d.widgets.map((w: any) => ({
            id: w.id,
            type: (w.chartType || '').toLowerCase(),
            title: w.title,
            lat: w.lat,
            lng: w.lng,
          })) : [],
          userId: d.userIds && d.userIds[0] ? d.userIds[0] : 0,
          userName: '',
        })) : [];
        setDashboards(mapped);
      };
      await fetchDashboards();
      setForm({ title: '', description: '', userIds: [] });
      setWidgets([]);
      setEditingWidgetIdx(null);
      setShowAdd(false);
    } catch (err) {
      alert('Error adding dashboard');
    }
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
    const selectedUsers = users.filter(u => form.userIds.includes(u.id));
    setDashboards(dashboards.map(d =>
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
    ));
    setShowEdit({ open: false });
    setForm({ title: '', description: '', userIds: [] });
    setWidgets([]);
    setEditingWidgetIdx(null);
  };

  // Delete dashboard (demo, local only)
  const handleDeleteDashboard = (id: number) => {
    if (window.confirm('Delete this dashboard?')) {
      setDashboards(dashboards.filter(d => d.id !== id));
    }
  };

  const handleAddWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showWidget.dashId) return;
    let widget: Widget = { id: Date.now(), type: widgetType, title: widgetTitle };
    if (widgetType === 'map') {
      widget = { ...widget, lat: Number(lat), lng: Number(lng) };
    }
    setDashboards(dashboards.map(d =>
      d.id === showWidget.dashId
        ? { ...d, widgets: [...d.widgets, widget] }
        : d
    ));
    setWidgetTitle('');
    setWidgetType('line');
    setLat('');
    setLng('');
    setShowWidget({ open: false });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Custom Dashboards</h2>
      <button onClick={() => setShowAdd(true)} className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800 mb-4">+ Add Dashboard</button>
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
                  <button onClick={() => setShowWidget({ open: true, dashId: dash.id })} className="px-2 py-1 bg-green-600 text-white rounded mr-2">+ Add Widget</button>
                  <button onClick={() => handleEditDashboard(dash)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">Edit</button>
                  <button onClick={() => handleDeleteDashboard(dash.id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Dashboard Full Page Overlay */}
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
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <span className="text-xs text-gray-500">Hold Ctrl (Windows) or Cmd (Mac) to select multiple users</span>
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
                      onClick={() => setShowWidgetPopup({ open: true, type: opt.type })}
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
          {/* Widget Add Popup (to be implemented next) */}
          {showWidgetPopup.open && (
            <div className="fixed inset-0 z-60 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <button onClick={() => { setShowWidgetPopup({ open: false }); setWidgetForm({ title: '', xField: '', yField: '', dataField: '', groupId: '' }); }} className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                <div className="text-lg font-bold mb-4">Add {chartTypes.find(c => c.type === showWidgetPopup.type)?.label} Widget</div>
                <form onSubmit={e => {
                  e.preventDefault();
                  const newWidget: any = {
                    id: Date.now(),
                    type: showWidgetPopup.type,
                    title: widgetForm.title,
                    xField: widgetForm.xField,
                    yField: widgetForm.yField,
                    dataField: widgetForm.dataField,
                  };
                  if (showWidgetPopup.type === 'map') {
                    newWidget.groupId = widgetForm.groupId;
                  }
                  setWidgets([...widgets, newWidget]);
                  setShowWidgetPopup({ open: false });
                  setWidgetForm({ title: '', xField: '', yField: '', dataField: '', groupId: '' });
                }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Widget Label</label>
                  <input value={widgetForm.title} onChange={e => setWidgetForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="Widget Label" required />
                  {showWidgetPopup.type !== 'pie' && showWidgetPopup.type !== 'doughnut' && showWidgetPopup.type !== 'map' && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1">X Axis Field</label>
                      <select value={widgetForm.xField} onChange={e => setWidgetForm(f => ({ ...f, xField: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3" required>
                        <option value="">Select X Field</option>
                        {availableFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Y Axis Field</label>
                      <select value={widgetForm.yField} onChange={e => setWidgetForm(f => ({ ...f, yField: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3" required>
                        <option value="">Select Y Field</option>
                        {availableFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </>
                  )}
                  {/* Data field for all widgets */}
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Field</label>
                  <select value={widgetForm.dataField} onChange={e => setWidgetForm(f => ({ ...f, dataField: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3" required>
                    <option value="">Select Data Field</option>
                    {availableFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  {showWidgetPopup.type === 'map' && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Device Group</label>
                      <select value={widgetForm.groupId} onChange={e => setWidgetForm(f => ({ ...f, groupId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3" required>
                        <option value="">Select Group</option>
                        {deviceGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <div className="flex items-center gap-2 mb-3">
                        <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2" placeholder="New Group Name" />
                        <button type="button" className="bg-green-600 text-white px-3 py-2 rounded" onClick={() => {
                          if (!newGroupName.trim()) return;
                          const newId = `group${deviceGroups.length + 1}`;
                          setDeviceGroups([...deviceGroups, { id: newId, name: newGroupName }]);
                          setWidgetForm(f => ({ ...f, groupId: newId }));
                          setNewGroupName('');
                        }}>Create Group</button>
                      </div>
                    </>
                  )}
                  <div className="flex justify-end mt-4">
                    <button type="button" onClick={() => { setShowWidgetPopup({ open: false }); setWidgetForm({ title: '', xField: '', yField: '', dataField: '', groupId: '' }); }} className="px-4 py-2 border rounded mr-2">Cancel</button>
                    <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded">Add Widget</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardManager;
