import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../service/Config.tsx';

const chartTypes = [
  { type: 'line', label: 'Line Chart' },
  { type: 'bar', label: 'Bar Chart' },
  { type: 'pie', label: 'Pie Chart' },
  { type: 'doughnut', label: 'Doughnut Chart' },
  { type: 'map', label: 'Google Map' },
];

const availableFields = [
  { value: 'humidity', label: 'Device Humidity' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'location', label: 'Device Location' },
  { value: 'pressure', label: 'Pressure' },
  { value: 'battery', label: 'Battery Level' },
];

const AddDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', userIds: [] as number[] });
  const [widgets, setWidgets] = useState<any[]>([]);
  const [showWidgetPopup, setShowWidgetPopup] = useState<{ open: boolean; type?: string }>({ open: false });
  const [widgetForm, setWidgetForm] = useState({
    title: '',
    xField: '',
    yField: '',
    dataField: '',
    groupId: '',
  });
  const [deviceGroups, setDeviceGroups] = useState([
    { id: 'group1', name: 'Group 1' },
    { id: 'group2', name: 'Group 2' },
    { id: 'group3', name: 'Group 3' },
  ]);
  const [newGroupName, setNewGroupName] = useState('');
  const [message, setMessage] = useState('');

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
        groupId: w.groupId,
        xField: w.xField,
        yField: w.yField,
        dataField: w.dataField,
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
      setMessage('Dashboard created!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setMessage('Error creating dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-blue-800">Add Dashboard</h2>
        <form onSubmit={handleAddDashboard} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3" required />
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3" required />
            <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded">Create Dashboard</button>
            {message && <div className="mt-2 text-green-600">{message}</div>}
          </div>
          <div>
            <div className="mb-4 text-lg font-semibold text-blue-700">Add Widgets</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {chartTypes.map(opt => (
                <div
                  key={opt.type}
                  className="border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all hover:shadow-lg bg-gray-50 hover:bg-blue-50"
                  onClick={() => setShowWidgetPopup({ open: true, type: opt.type })}
                >
                  <span className="mt-2 text-base font-medium text-center">{opt.label}</span>
                </div>
              ))}
            </div>
            <div className="mb-2 text-gray-700 font-semibold">Widgets Preview</div>
            {widgets.length === 0 ? (
              <div className="text-gray-400">No widgets added yet.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {widgets.map((w, i) => (
                  <div key={i} className="bg-white border rounded-lg p-4 flex flex-col items-center shadow-sm">
                    <div className="mb-2 font-bold text-blue-700">{w.title}</div>
                    <div className="mb-1 text-xs text-gray-500">{w.type}</div>
                    {w.type === 'map' && (
                      <div className="text-xs text-blue-700">Group: {deviceGroups.find(g => g.id === w.groupId)?.name || w.groupId || 'N/A'}</div>
                    )}
                    <button type="button" className="mt-2 text-xs text-red-600 underline" onClick={() => setWidgets(widgets.filter((_, idx) => idx !== i))}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
        {/* Widget Add Popup */}
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
    </div>
  );
};

export default AddDashboard;
