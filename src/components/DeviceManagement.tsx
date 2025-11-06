import React, { useEffect, useState } from 'react';
import dummyDevicesData from '../data/dummyDevices.json';
import Modal from './Modal.tsx';
import { BASE_URL } from '../service/Config.tsx';

interface Device {
  id: number;
  name: string;
  imei: string;
  imsi: string;
  opc: string;
  milenage: string;
  rand: string;
  cell_localization: string;
  san_id: string;
  groupId?: string;
}

const DeviceManagement: React.FC = () => {
  // Device group state (for device assignment)
  const [deviceGroups, setDeviceGroups] = useState([
    { id: 'group1', name: 'Group 1' },
    { id: 'group2', name: 'Group 2' },
    { id: 'group3', name: 'Group 3' },
  ]);
  const [newGroupName, setNewGroupName] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mapGroupId, setMapGroupId] = useState('');
  // CSV import handler
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      // Simple CSV parse: assumes header row and comma separation
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim());
      const newDevices = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = values[i] || ''; });
        return obj;
      });
      // Optionally, send to API or just add to local list
      setDevices(prev => [...prev, ...newDevices]);
      setMessage('Imported ' + newDevices.length + ' devices (local only, connect to API for real import).');
    };
    reader.readAsText(file);
  };

  // Multi-select device handler
  const handleSelectDevice = (id: number, checked: boolean) => {
    setSelectedDevices(prev => checked ? [...prev, id] : prev.filter(did => did !== id));
  };

  // Map selected devices to group
  const handleMapToGroup = async () => {
    if (!mapGroupId || selectedDevices.length === 0) return;
    // Optionally, call API to update devices' groupId
    setDevices(devices.map(d => selectedDevices.includes(d.id) ? { ...d, groupId: mapGroupId } : d));
    setSelectedDevices([]);
    setMapGroupId('');
    setMessage('Mapped selected devices to group (local only, connect to API for real update).');
  };
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [form, setForm] = useState<Partial<Device> & { groupId?: string }>({
    name: '',
    imei: '',
    imsi: '',
    opc: '',
    milenage: '',
    rand: '',
    cell_localization: '',
    san_id: '',
    groupId: '',
  });
  const [showDelete, setShowDelete] = useState<{ open: boolean; id?: number }>({ open: false });
  const [message, setMessage] = useState('');
  const [viewDevice, setViewDevice] = useState<Device | null>(null);

  const token = localStorage.getItem('token') || '';

  const dummyDevices: Device[] = dummyDevicesData as Device[];

  const [useDummy, setUseDummy] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}lot/v1/device/all`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch devices');
      const data = await res.json();
      setDevices(data);
      setUseDummy(false);
    } catch (err: any) {
      setDevices(dummyDevices);
      setUseDummy(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (useDummy) {
      // Local add/edit for dummy devices
      if (editDevice) {
        setDevices(devices.map(d => d.id === editDevice.id ? { ...d, ...form } as Device : d));
        setMessage('Device updated (dummy mode).');
      } else {
        const newId = devices.length > 0 ? Math.max(...devices.map(d => d.id)) + 1 : 1;
        setDevices([...devices, { ...form, id: newId } as Device]);
        setMessage('Device added (dummy mode).');
      }
      setShowModal(false);
      setEditDevice(null);
      setForm({ name: '', imei: '', imsi: '', opc: '', milenage: '', rand: '', cell_localization: '', san_id: '', groupId: '' });
      return;
    }
    try {
      const method = editDevice ? 'PATCH' : 'POST';
      const url = editDevice ? `${BASE_URL}lot/v1/device/${editDevice.id}` : `${BASE_URL}lot/v1/device`;
      const payload: any = {
        id: editDevice ? editDevice.id : 0,
        name: form.name || '',
        imei: form.imei || '',
        imsi: form.imsi || '',
        opc: form.opc || '',
        milenage: form.milenage || '',
        rand: form.rand || '',
        cell_localization: form.cell_localization || '',
        san_id: form.san_id || '',
        groupId: form.groupId || '',
      };
      const res = await fetch(url, {
        method,
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save device');
      setShowModal(false);
      setEditDevice(null);
      setForm({ name: '', imei: '', imsi: '', opc: '', milenage: '', rand: '', cell_localization: '', san_id: '', groupId: '' });
      fetchDevices();
    } catch (err: any) {
      setMessage(err.message || 'Error saving device');
    }
  };

  const handleDelete = async () => {
    if (!showDelete.id) return;
    setMessage('');
    if (useDummy) {
      setDevices(devices.filter(d => d.id !== showDelete.id));
      setShowDelete({ open: false });
      setMessage('Device deleted (dummy mode).');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}lot/v1/device/${showDelete.id}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete device');
      setShowDelete({ open: false });
      fetchDevices();
    } catch (err: any) {
      setMessage(err.message || 'Error deleting device');
    }
  };

  const openEdit = (device: Device) => {
    console.log(device)
    setEditDevice(device);
    setForm({ ...device });
    setShowModal(true);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const devicesPerPage = 10;
  const paginatedDevices = devices.slice((currentPage - 1) * devicesPerPage, currentPage * devicesPerPage);
  const totalPages = Math.ceil(devices.length / devicesPerPage);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Device Management</h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <button onClick={() => { setShowModal(true); setEditDevice(null); setForm({
            name: '', imei: '', imsi: '', opc: '', milenage: '', rand: '', cell_localization: '', san_id: '', groupId: ''
          }); }} className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800">+ Add Device</button>
          <button onClick={() => fileInputRef.current?.click()} className="bg-green-700 text-white px-5 py-2 rounded hover:bg-green-800">Import from CSV</button>
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} style={{ display: 'none' }} />
        </div>
        {message && <div className="text-red-600 font-medium">{message}</div>}
      </div>
      {/* Map to Group UI */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <div className="flex gap-2 items-center">
          <span className="font-medium">Selected: {selectedDevices.length}</span>
          <select value={mapGroupId} onChange={e => setMapGroupId(e.target.value)} className="border border-gray-300 rounded px-2 py-1">
            <option value="">Select Group</option>
            {deviceGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <button onClick={handleMapToGroup} className="bg-blue-600 text-white px-3 py-1 rounded" disabled={!mapGroupId || selectedDevices.length === 0}>Map to Group</button>
        </div>
      </div>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white rounded-lg shadow text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-3 py-2"><input type="checkbox" checked={selectedDevices.length === devices.length && devices.length > 0} onChange={e => setSelectedDevices(e.target.checked ? devices.map(d => d.id) : [])} /></th>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">IMEI</th>
              <th className="px-3 py-2">IMSI</th>
              <th className="px-3 py-2">Group</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
            ) : devices.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4">No devices found.</td></tr>
            ) : paginatedDevices.map(device => (
              <tr key={device.id}>
                <td className="px-3 py-2">
                  <input type="checkbox" checked={selectedDevices.includes(device.id)} onChange={e => handleSelectDevice(device.id, e.target.checked)} />
                </td>
                <td className="px-3 py-2">{device.id}</td>
                <td className="px-3 py-2">{device.name}</td>
                <td className="px-3 py-2">{device.imei}</td>
                <td className="px-3 py-2">{device.imsi}</td>
                <td className="px-3 py-2">{deviceGroups.find(g => g.id === device.groupId)?.name || '-'}</td>
                <td className="px-3 py-2">
                  <button onClick={() => openEdit(device)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">Edit</button>
                  <button onClick={() => setShowDelete({ open: true, id: device.id })} className="px-2 py-1 bg-red-600 text-white rounded mr-2">Delete</button>
                  <button onClick={() => setViewDevice(device)} className="px-2 py-1 bg-blue-600 text-white rounded">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
      </div>
      {/* View Device Modal */}
      <Modal
        open={!!viewDevice}
        onClose={() => setViewDevice(null)}
        title={viewDevice ? `Device Details: ${viewDevice.name}` : 'Device Details'}
        actions={[<button key="close" onClick={() => setViewDevice(null)} className="px-4 py-2">Close</button>]}
      >
        {viewDevice && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>ID:</strong> {viewDevice.id}</div>
            <div><strong>Name:</strong> {viewDevice.name}</div>
            <div><strong>IMEI:</strong> {viewDevice.imei}</div>
            <div><strong>IMSI:</strong> {viewDevice.imsi}</div>
            <div><strong>OPC:</strong> {viewDevice.opc}</div>
            <div><strong>Milenage:</strong> {viewDevice.milenage}</div>
            <div><strong>Rand:</strong> {viewDevice.rand}</div>
            <div><strong>Cell Localization:</strong> {viewDevice.cell_localization}</div>
            <div><strong>SAN ID:</strong> {viewDevice.san_id}</div>
            <div><strong>Group:</strong> {deviceGroups.find(g => g.id === viewDevice.groupId)?.name || '-'}</div>
          </div>
        )}
      </Modal>
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setEditDevice(null); }}
        title={editDevice ? 'Edit Device' : 'Add Device'}
        actions={[
          <button key="cancel" onClick={() => { setShowModal(false); setEditDevice(null); }} className="px-4 py-2">Cancel</button>,
          <button key="save" type="submit" form="device-form" className="bg-blue-700 text-white px-4 py-2 rounded">{editDevice ? 'Save' : 'Add'}</button>
        ]}
      >
        <form id="device-form" onSubmit={handleAddOrEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Device Group select/create */}
          <div className="w-full md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Device Group</label>
            <select name="groupId" value={form.groupId || ''} onChange={handleInput} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3" required>
              <option value="">Select Group</option>
              {deviceGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <div className="flex items-center gap-2 mb-3">
              <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2" placeholder="New Group Name" />
              <button type="button" className="bg-green-600 text-white px-3 py-2 rounded" onClick={() => {
                if (!newGroupName.trim()) return;
                const newId = `group${deviceGroups.length + 1}`;
                setDeviceGroups([...deviceGroups, { id: newId, name: newGroupName }]);
                setForm(f => ({ ...f, groupId: newId }));
                setNewGroupName('');
              }}>Create Group</button>
            </div>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Name</label>
            <input name="name" id="name" placeholder="Device Name" value={form.name || ''} onChange={handleInput} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="imei">IMEI</label>
            <input name="imei" id="imei" placeholder="IMEI" value={form.imei || ''} onChange={handleInput} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="imsi">IMSI</label>
            <input name="imsi" id="imsi" placeholder="IMSI" value={form.imsi || ''} onChange={handleInput} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="opc">OPC</label>
            <input name="opc" id="opc" placeholder="OPC" value={form.opc || ''} onChange={handleInput} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="milenage">Milenage</label>
            <input name="milenage" id="milenage" placeholder="Milenage" value={form.milenage || ''} onChange={handleInput} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rand">Rand</label>
            <input name="rand" id="rand" placeholder="Rand" value={form.rand || ''} onChange={handleInput} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cell_localization">Cell Localization</label>
            <input name="cell_localization" id="cell_localization" placeholder="Cell Localization" value={form.cell_localization || ''} onChange={handleInput} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="san_id">SAN ID</label>
            <input name="san_id" id="san_id" placeholder="SAN ID" value={form.san_id || ''} onChange={handleInput} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </form>
      </Modal>
      {/* Confirm Delete Modal */}
      <Modal
        open={showDelete.open}
        onClose={() => setShowDelete({ open: false })}
        title="Confirm Delete"
        actions={[
          <button key="cancel" onClick={() => setShowDelete({ open: false })} className="px-4 py-2">Cancel</button>,
          <button key="remove" onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
        ]}
      >
        Are you sure you want to delete this device?
      </Modal>
    </div>
  );
};

export default DeviceManagement;
