import React, { useEffect, useState } from 'react';
import Modal from './Modal.tsx';
import { LOCAL_URL } from '../service/Config.tsx';

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
  
}

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [form, setForm] = useState<Partial<Device>>({
    name: '',
    imei: '',
    imsi: '',
    opc: '',
    milenage: '',
    rand: '',
    cell_localization: '',
    san_id: ''   
  });
  const [showDelete, setShowDelete] = useState<{ open: boolean; id?: number }>({ open: false });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token') || '';

  const fetchDevices = async () => {
    setLoading(true);
    try {
  const res = await fetch(`${LOCAL_URL}api/devices`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch devices');
      const data = await res.json();
      console.log('devices fetched:', data);
      setDevices(data);
    } catch (err: any) {
      setMessage(err.message || 'Error fetching devices');
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
    try {
      const method = editDevice ? 'PATCH' : 'POST';
  const url = editDevice ? `${LOCAL_URL}api/devices/${editDevice.id}` : `${LOCAL_URL}api/devices`;
      const now = new Date().toISOString();
      const payload: Device = {
        id: editDevice ? editDevice.id : 0,
        name: form.name || '',
        imei: form.imei || '',
        imsi: form.imsi || '',
        opc: form.opc || '',
        milenage: form.milenage || '',
        rand: form.rand || '',
        cell_localization: form.cell_localization || '',
        san_id: form.san_id || ''
       
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
      setForm({
        name: '', imei: '', imsi: '', opc: '', milenage: '', rand: '', cell_localization: '', san_id: ''
      });
      fetchDevices();
    } catch (err: any) {
      setMessage(err.message || 'Error saving device');
    }
  };

  const handleDelete = async () => {
    if (!showDelete.id) return;
    setMessage('');
    try {
  const res = await fetch(`${LOCAL_URL}api/devices/${showDelete.id}`, {
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Device Management</h2>
      <div className="flex justify-between mb-4">
        <button onClick={() => { setShowModal(true); setEditDevice(null); setForm({
          name: '', imei: '', imsi: '', opc: '', milenage: '', rand: '', cell_localization: '', san_id: ''
        }); }} className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800">+ Add Device</button>
        {message && <div className="text-red-600 font-medium">{message}</div>}
      </div>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white rounded-lg shadow text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">IMEI</th>
              <th className="px-3 py-2">IMSI</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
            ) : devices.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4">No devices found.</td></tr>
            ) : devices.map(device => (
              <tr key={device.id}>
                <td className="px-3 py-2">{device.id}</td>
                <td className="px-3 py-2">{device.name}</td>
                <td className="px-3 py-2">{device.imei}</td>
                <td className="px-3 py-2">{device.imsi}</td>
                <td className="px-3 py-2">
                  <button onClick={() => openEdit(device)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">Edit</button>
                  <button onClick={() => setShowDelete({ open: true, id: device.id })} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add/Edit Device Modal */}
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
