import React, { useState } from 'react';
import Modal from './Modal.tsx';
import { TrashIcon, DeactivateIcon, EditIcon } from './Icons.tsx';
import { LOCAL_URL } from '../service/Config.tsx';

interface User {
  id: number;
  user_id: string; // email id
  password: string;
  role: string;
  name: string;
}

const initialUsers: User[] = [
  {
    id: 1,
    user_id: 'alice@iot.com',
    password: 'iot123',
    role: 'admin',
    name: 'Alice Admin',
  },
  {
    id: 2,
    user_id: 'bob@iot.com',
    password: 'iot123',
    role: 'user',
    name: 'Bob User',
  },
];

const UserManagement: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState<{ open: boolean; id?: number }>({ open: false });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<{ user_id: string; password: string; role: string; name: string }>({ user_id: '', password: '', role: 'user', name: '' });

  const [users, setUsers] = useState<User[]>(initialUsers);

  React.useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const res = await fetch(`${LOCAL_URL}api/users`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : initialUsers);
      } catch (err) {
        // fallback to initialUsers
        setUsers(initialUsers);
      }
    };
    fetchUsers();
  }, []);

  // KPIs
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';
      const payload = {
        id: Date.now(),
        user_id: form.user_id,
        password: form.password,
        role: form.role,
        name: form.name,
      };
      const res = await fetch(`${LOCAL_URL}api/users`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to add user');
      setUsers([...users, payload]);
      setForm({ user_id: '', password: '', role: 'user', name: '' });
      setShowCreate(false);
    } catch (err) {
      alert('Error adding user');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${LOCAL_URL}api/users/${editUser.id}`, {
        method: 'PATCH',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update user');
      setUsers(users.map(u => u.id === editUser.id ? { ...editUser, ...form } : u));
      setEditUser(null);
      setShowCreate(false);
    } catch (err) {
      alert('Error updating user');
    }
  };

  const handleRemove = (id: number) => {
    const token = localStorage.getItem('token') || '';
    fetch(`${LOCAL_URL}api/users/${id}`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_deleted: 1 }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to remove user');
        setUsers(users.filter(u => u.id !== id));
        setShowDelete({ open: false });
      })
      .catch(() => {
        alert('Error removing user');
      });
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({
      user_id: user.user_id,
      password: user.password,
      role: user.role,
      name: user.name,
    });
    setShowCreate(true);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-blue-900 tracking-tight">User Management</h2>
      <div className="flex gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
          <div className="text-gray-500 mb-2">KPI: Total Users</div>
          <div className="text-2xl font-bold text-blue-700">{totalUsers}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
          <div className="text-gray-500 mb-2">KPI: Admins</div>
          <div className="text-2xl font-bold text-purple-600">{adminUsers}</div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-blue-800">User List</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowCreate(true);
              setEditUser(null);
              setForm({ user_id: '', password: '', role: 'user', name: '' });
            }}
            className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800"
          >
            + Add User
          </button>
        </div>
      </div>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white rounded-lg shadow text-sm border border-gray-100">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-3 py-2">{user.name}</td>
                <td className="px-3 py-2">{user.user_id}</td>
                <td className="px-3 py-2">{user.role}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <button onClick={() => openEdit(user)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDelete({ open: true, id: user.id })}
                      className="px-2 py-1 bg-red-600 text-white rounded flex items-center justify-center"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Create/Edit User Modal */}
      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          setEditUser(null);
        }}
        title={editUser ? 'Edit User' : 'Add User'}
        actions={[
          <button key="cancel" onClick={() => { setShowCreate(false); setEditUser(null); }} className="px-4 py-2">Cancel</button>,
          <button key="save" type="submit" form="user-form" className="bg-blue-700 text-white px-4 py-2 rounded">{editUser ? 'Save' : 'Add'}</button>
        ]}
      >
        <form id="user-form" onSubmit={editUser ? handleEditUser : handleAddUser} className="grid grid-cols-1 gap-4 w-full">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Name</label>
            <input name="name" id="name" placeholder="Name" value={form.name} onChange={handleInput} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="user_id">Email</label>
            <input name="user_id" id="user_id" placeholder="Email" value={form.user_id} onChange={handleInput} required type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
            <input
              name="password"
              id="password"
              placeholder="Password"
              value={form.password}
              onChange={handleInput}
              required
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly={!!editUser}
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">Role</label>
            <select name="role" id="role" value={form.role} onChange={handleInput} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </form>
      </Modal>
      {/* Confirm Remove Modal */}
      <Modal
        open={showDelete.open}
        onClose={() => setShowDelete({ open: false })}
        title="Confirm Remove"
        actions={[
          <button key="cancel" onClick={() => setShowDelete({ open: false })} className="px-4 py-2">Cancel</button>,
          <button key="remove" onClick={() => handleRemove(showDelete.id!)} className="bg-red-600 text-white px-4 py-2 rounded">Remove</button>
        ]}
      >
        Are you sure you want to remove this user?
      </Modal>
    </div>
  );
};

export default UserManagement;
