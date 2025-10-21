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
  const [dashboards, setDashboards] = useState<Dashboard[]>([
    {
      id: 1,
      title: 'Demo Dashboard',
      description: 'A demo dashboard',
      created: new Date().toISOString(),
      widgets: [],
      userId: 1,
      userName: 'Alice',
    },
  ]);
  const [showAdd, setShowAdd] = useState(false);
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

  // Add dashboard (demo, local only)
  const handleAddDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const selectedUsers = users.filter(u => form.userIds.includes(u.id));
    setDashboards([
      ...dashboards,
      {
        id: Date.now(),
        title: form.title,
        description: form.description,
        created: now,
        widgets: widgets,
        userId: form.userIds[0] || 0,
        userName: selectedUsers[0]?.name || '',
      },
    ]);
    setForm({ title: '', description: '', userIds: [] });
    setWidgets([]);
    setEditingWidgetIdx(null);
    setShowAdd(false);
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
      {/* Edit Dashboard Modal */}
      <Modal
        open={showEdit.open}
        onClose={() => setShowEdit({ open: false })}
        title="Edit Dashboard"
        actions={[
          <button key="cancel" onClick={() => setShowEdit({ open: false })} className="px-4 py-2">Cancel</button>,
          <button key="update" type="submit" form="edit-dash-form" className="bg-yellow-500 text-white px-4 py-2 rounded">Update</button>
        ]}
        className="max-w-auto w-full"
        style={{maxWidth:'65%', background: "#fff", borderRadius: 12 }}
      >
        <form id="edit-dash-form" onSubmit={handleUpdateDashboard} className="w-full min-h-[500px] max-h-[80vh] overflow-y-auto bg-white rounded-lg p-4" >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Dashboard Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit_dash_title">Title</label>
              <input name="title" id="edit_dash_title" placeholder="Dashboard Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4" />
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit_dash_desc">Description</label>
              <input name="description" id="edit_dash_desc" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4" />
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit_dash_users">Users</label>
              <select
                name="userIds"
                id="edit_dash_users"
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
            </div>
            {/* Right: Widget Add/Edit Section */}
            <div className="border-l pl-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-700">Widgets</span>
                {/* <button type="button" className="bg-green-600 text-white px-3 py-1 rounded text-sm" onClick={() => {
                  setEditingWidgetIdx(null);
                  setWidgetType('line');
                  setWidgetTitle('');
                  setLat('');
                  setLng('');
                }}>+ Add Widget</button> */}
              </div>
              {/* Widget Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select value={widgetType} onChange={e => setWidgetType(e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-2 py-1">
                    {chartTypes.map(opt => (
                      <option key={opt.type} value={opt.type}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                  <input value={widgetTitle} onChange={e => setWidgetTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1" placeholder="Widget Title" />
                </div>
                {widgetType === 'map' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
                      <input type="number" value={lat} onChange={e => setLat(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1" placeholder="Latitude" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
                      <input type="number" value={lng} onChange={e => setLng(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1" placeholder="Longitude" />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" className="bg-blue-700 text-white px-3 py-1 rounded text-sm" onClick={() => {
                  if (!widgetTitle) return;
                  const widgetObj: any = { type: widgetType, title: widgetTitle };
                  if (widgetType === 'map') {
                    widgetObj.lat = Number(lat);
                    widgetObj.lng = Number(lng);
                  }
                  if (editingWidgetIdx !== null) {
                    setWidgets(widgets.map((w, i) => i === editingWidgetIdx ? widgetObj : w));
                    setEditingWidgetIdx(null);
                  } else {
                    setWidgets([...widgets, widgetObj]);
                  }
                  setWidgetType('line');
                  setWidgetTitle('');
                  setLat('');
                  setLng('');
                }}>{editingWidgetIdx !== null ? 'Update Widget' : 'Add Widget'}</button>
                {editingWidgetIdx !== null && (
                  <button type="button" className="bg-gray-400 text-white px-3 py-1 rounded text-sm" onClick={() => {
                    setEditingWidgetIdx(null);
                    setWidgetType('line');
                    setWidgetTitle('');
                    setLat('');
                    setLng('');
                  }}>Cancel</button>
                )}
              </div>
              {/* Widget List */}
              <div className="mt-4">
                {widgets.length === 0 ? (
                  <div className="text-gray-500 text-sm">No widgets added.</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {widgets.map((w, i) => (
                      <li key={i} className="py-2 flex items-center justify-between">
                        <div>
                          <span className="font-medium">{w.title}</span> <span className="text-xs text-gray-500">({w.type})</span>
                          {w.type === 'map' && (
                            <span className="ml-2 text-xs text-blue-700">[{w.lat}, {w.lng}]</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="text-blue-700 underline text-xs" onClick={() => {
                            setEditingWidgetIdx(i);
                            setWidgetType(w.type);
                            setWidgetTitle(w.title);
                            setLat(w.lat ? String(w.lat) : '');
                            setLng(w.lng ? String(w.lng) : '');
                          }}>Edit</button>
                          <button type="button" className="text-red-600 underline text-xs" onClick={() => {
                            setWidgets(widgets.filter((_, idx) => idx !== i));
                            if (editingWidgetIdx === i) {
                              setEditingWidgetIdx(null);
                              setWidgetType('line');
                              setWidgetTitle('');
                              setLat('');
                              setLng('');
                            }
                          }}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add Dashboard Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Dashboard"
        actions={[
          <button key="cancel" onClick={() => setShowAdd(false)} className="px-4 py-2">Cancel</button>,
          <button key="add" type="submit" form="add-dash-form" className="bg-blue-700 text-white px-4 py-2 rounded">Add</button>
        ]}
        className="max-w-auto w-full" // Tailwind example
        style={{maxWidth:'65%', background: "#fff", borderRadius: 12 }} // Inline style example
      >
        <form id="add-dash-form" onSubmit={handleAddDashboard} className="w-full min-h-[500px] max-h-[80vh] overflow-y-auto bg-white rounded-lg p-4" >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Dashboard Info */}
            <div>
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
            </div>
            {/* Right: Widget Add/Edit Section */}
            <div className="border-l pl-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-700">Widgets</span>
                {/* <button type="button" className="bg-green-600 text-white px-3 py-1 rounded text-sm" onClick={() => {
                  setEditingWidgetIdx(null);
                  setWidgetType('line');
                  setWidgetTitle('');
                  setLat('');
                  setLng('');
                }}>+ Add Widget</button> */}
              </div>
              {/* Widget Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select value={widgetType} onChange={e => setWidgetType(e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-2 py-1">
                    {chartTypes.map(opt => (
                      <option key={opt.type} value={opt.type}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                  <input value={widgetTitle} onChange={e => setWidgetTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1" placeholder="Widget Title" />
                </div>
                {widgetType === 'map' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
                      <input type="number" value={lat} onChange={e => setLat(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1" placeholder="Latitude" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
                      <input type="number" value={lng} onChange={e => setLng(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1" placeholder="Longitude" />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" className="bg-blue-700 text-white px-3 py-1 rounded text-sm" onClick={() => {
                  if (!widgetTitle) return;
                  const widgetObj: any = { type: widgetType, title: widgetTitle };
                  if (widgetType === 'map') {
                    widgetObj.lat = Number(lat);
                    widgetObj.lng = Number(lng);
                  }
                  if (editingWidgetIdx !== null) {
                    setWidgets(widgets.map((w, i) => i === editingWidgetIdx ? widgetObj : w));
                    setEditingWidgetIdx(null);
                  } else {
                    setWidgets([...widgets, widgetObj]);
                  }
                  setWidgetType('line');
                  setWidgetTitle('');
                  setLat('');
                  setLng('');
                }}>{editingWidgetIdx !== null ? 'Update Widget' : 'Add Widget'}</button>
                {editingWidgetIdx !== null && (
                  <button type="button" className="bg-gray-400 text-white px-3 py-1 rounded text-sm" onClick={() => {
                    setEditingWidgetIdx(null);
                    setWidgetType('line');
                    setWidgetTitle('');
                    setLat('');
                    setLng('');
                  }}>Cancel</button>
                )}
              </div>
              {/* Widget List */}
              <div className="mt-4">
                {widgets.length === 0 ? (
                  <div className="text-gray-500 text-sm">No widgets added.</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {widgets.map((w, i) => (
                      <li key={i} className="py-2 flex items-center justify-between">
                        <div>
                          <span className="font-medium">{w.title}</span> <span className="text-xs text-gray-500">({w.type})</span>
                          {w.type === 'map' && (
                            <span className="ml-2 text-xs text-blue-700">[{w.lat}, {w.lng}]</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="text-blue-700 underline text-xs" onClick={() => {
                            setEditingWidgetIdx(i);
                            setWidgetType(w.type);
                            setWidgetTitle(w.title);
                            setLat(w.lat ? String(w.lat) : '');
                            setLng(w.lng ? String(w.lng) : '');
                          }}>Edit</button>
                          <button type="button" className="text-red-600 underline text-xs" onClick={() => {
                            setWidgets(widgets.filter((_, idx) => idx !== i));
                            if (editingWidgetIdx === i) {
                              setEditingWidgetIdx(null);
                              setWidgetType('line');
                              setWidgetTitle('');
                              setLat('');
                              setLng('');
                            }
                          }}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>
      {/* Add Widget Modal */}
      <Modal open={showWidget.open} onClose={() => setShowWidget({ open: false })} title="Add Widget"
        actions={[
          <button key="cancel" onClick={() => setShowWidget({ open: false })} className="px-4 py-2">Cancel</button>,
          <button key="add" type="submit" form="add-widget-form" className="bg-blue-700 text-white px-4 py-2 rounded">Add</button>
        ]}
      >
        <form id="add-widget-form" onSubmit={handleAddWidget} className="grid grid-cols-1 gap-4 w-full">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Widget Type</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {chartTypes.map(opt => (
                <div
                  key={opt.type}
                  className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${widgetType === opt.type ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}
                  onClick={() => setWidgetType(opt.type as any)}
                  tabIndex={0}
                  style={{ outline: widgetType === opt.type ? '2px solid #2563eb' : undefined }}
                >
                  {/* Simple chart icons for visual grouping */}
                  {opt.type === 'line' && <svg width="32" height="32" viewBox="0 0 32 32"><polyline points="4,28 12,16 20,20 28,8" fill="none" stroke="#2563eb" strokeWidth="2" /></svg>}
                  {opt.type === 'bar' && <svg width="32" height="32" viewBox="0 0 32 32"><rect x="6" y="16" width="4" height="12" fill="#2563eb" /><rect x="14" y="8" width="4" height="20" fill="#2563eb" /><rect x="22" y="12" width="4" height="16" fill="#2563eb" /></svg>}
                  {opt.type === 'pie' && <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#e0e7ff" stroke="#2563eb" strokeWidth="2" /><path d="M16 16 L16 2 A14 14 0 0 1 30 16 Z" fill="#2563eb" /></svg>}
                  {opt.type === 'doughnut' && <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#e0e7ff" stroke="#2563eb" strokeWidth="2" /><circle cx="16" cy="16" r="7" fill="#fff" /></svg>}
                  {opt.type === 'map' && <svg width="32" height="32" viewBox="0 0 32 32"><rect x="4" y="24" width="24" height="4" fill="#2563eb" /><circle cx="16" cy="16" r="7" fill="#e0e7ff" stroke="#2563eb" strokeWidth="2" /><circle cx="16" cy="16" r="2" fill="#2563eb" /></svg>}
                  <span className="mt-2 text-sm font-medium text-center">{opt.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Widget Title</label>
            <input value={widgetTitle} onChange={e => setWidgetTitle(e.target.value)} placeholder="Widget Title" className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
          </div>
          {widgetType === 'map' && (
            <div className="w-full flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input type="number" value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude" className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input type="number" value={lng} onChange={e => setLng(e.target.value)} placeholder="Longitude" className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default DashboardManager;
