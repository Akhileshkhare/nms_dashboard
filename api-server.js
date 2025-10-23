// Dashboard KPIs from devices
app.get('/api/dashboard/kpi', (req, res) => {
  const devicesFile = path.join(__dirname, 'api_data', 'devices.json');
  fs.readFile(devicesFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read devices data' });
    const devices = JSON.parse(data);
    const totalDevices = devices.length;
    let tempSum = 0, tempCount = 0, humiditySum = 0, humidityCount = 0;
    devices.forEach(device => {
      if (device.details && Array.isArray(device.details)) {
        device.details.forEach(d => {
          if (d.data) {
            if (typeof d.data.temperature === 'number') {
              tempSum += d.data.temperature;
              tempCount++;
            }
            if (typeof d.data.humidity === 'number') {
              humiditySum += d.data.humidity;
              humidityCount++;
            }
          }
        });
      }
    });
    const avgTemp = tempCount ? (tempSum / tempCount) : 0;
    const avgHumidity = humidityCount ? (humiditySum / humidityCount) : 0;
    res.json({
      totalDevices,
      avgTemperature: Number(avgTemp.toFixed(2)),
      avgHumidity: Number(avgHumidity.toFixed(2))
    });
  });
});
// Login API
const loginFile = path.join(__dirname, 'api_data', 'login.json');

// Get all login records (for admin/debug)
app.get('/api/login', (req, res) => {
  fs.readFile(loginFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read login data' });
    res.json(JSON.parse(data));
  });
});

// Login check (POST)
app.post('/api/login', (req, res) => {
  fs.readFile(loginFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read login data' });
    const logins = JSON.parse(data);
    const { username, password } = req.body;
    const user = logins.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful', user });
  });
});
// Dashboard Management CRUD
const dashboardFile = path.join(__dirname, 'api_data', 'dashboard.json');

// Get all dashboard items
app.get('/api/dashboard', (req, res) => {
  fs.readFile(dashboardFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read dashboard data' });
    res.json(JSON.parse(data));
  });
});

// Get dashboard item by ID
app.get('/api/dashboard/:id', (req, res) => {
  fs.readFile(dashboardFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read dashboard data' });
    const dashboard = JSON.parse(data);
    const item = dashboard.find(d => d.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Dashboard item not found' });
    res.json(item);
  });
});

// Add new dashboard item
app.post('/api/dashboard', (req, res) => {
  fs.readFile(dashboardFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read dashboard data' });
    const dashboard = JSON.parse(data);
    const newItem = req.body;
    dashboard.push(newItem);
    fs.writeFile(dashboardFile, JSON.stringify(dashboard, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to save dashboard item' });
      res.status(201).json(newItem);
    });
  });
});

// Update dashboard item by ID
app.put('/api/dashboard/:id', (req, res) => {
  fs.readFile(dashboardFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read dashboard data' });
    let dashboard = JSON.parse(data);
    const index = dashboard.findIndex(d => d.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Dashboard item not found' });
    dashboard[index] = req.body;
    fs.writeFile(dashboardFile, JSON.stringify(dashboard, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to update dashboard item' });
      res.json(dashboard[index]);
    });
  });
});

// Delete dashboard item by ID
app.delete('/api/dashboard/:id', (req, res) => {
  fs.readFile(dashboardFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read dashboard data' });
    let dashboard = JSON.parse(data);
    const index = dashboard.findIndex(d => d.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Dashboard item not found' });
    const deleted = dashboard.splice(index, 1);
    fs.writeFile(dashboardFile, JSON.stringify(dashboard, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to delete dashboard item' });
      res.json(deleted[0]);
    });
  });
});
// User Management CRUD
const usersFile = path.join(__dirname, 'api_data', 'users.json');

// Get all users
app.get('/api/users', (req, res) => {
  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read users data' });
    res.json(JSON.parse(data));
  });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read users data' });
    const users = JSON.parse(data);
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

// Add new user
app.post('/api/users', (req, res) => {
  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read users data' });
    const users = JSON.parse(data);
    const newUser = req.body;
    users.push(newUser);
    fs.writeFile(usersFile, JSON.stringify(users, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to save user' });
      res.status(201).json(newUser);
    });
  });
});

// Update user by ID
app.put('/api/users/:id', (req, res) => {
  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read users data' });
    let users = JSON.parse(data);
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    users[index] = req.body;
    fs.writeFile(usersFile, JSON.stringify(users, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to update user' });
      res.json(users[index]);
    });
  });
});

// Delete user by ID
app.delete('/api/users/:id', (req, res) => {
  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read users data' });
    let users = JSON.parse(data);
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    const deleted = users.splice(index, 1);
    fs.writeFile(usersFile, JSON.stringify(users, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to delete user' });
      res.json(deleted[0]);
    });
  });
});
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

// Placeholder routes for login, user, device, dashboard
app.get('/', (req, res) => {
  res.send('NMS Dashboard API is running');
});


// Device Management CRUD
const devicesFile = path.join(__dirname, 'api_data', 'devices.json');

// Get all devices
app.get('/api/devices', (req, res) => {
  fs.readFile(devicesFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read devices data' });
    res.json(JSON.parse(data));
  });
});

// Get device by ID
app.get('/api/devices/:id', (req, res) => {
  fs.readFile(devicesFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read devices data' });
    const devices = JSON.parse(data);
    const device = devices.find(d => d.device_id === req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json(device);
  });
});

// Add new device
app.post('/api/devices', (req, res) => {
  fs.readFile(devicesFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read devices data' });
    const devices = JSON.parse(data);
    const newDevice = req.body;
    devices.push(newDevice);
    fs.writeFile(devicesFile, JSON.stringify(devices, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to save device' });
      res.status(201).json(newDevice);
    });
  });
});

// Update device by ID
app.put('/api/devices/:id', (req, res) => {
  fs.readFile(devicesFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read devices data' });
    let devices = JSON.parse(data);
    const index = devices.findIndex(d => d.device_id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Device not found' });
    devices[index] = req.body;
    fs.writeFile(devicesFile, JSON.stringify(devices, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to update device' });
      res.json(devices[index]);
    });
  });
});

// Delete device by ID
app.delete('/api/devices/:id', (req, res) => {
  fs.readFile(devicesFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read devices data' });
    let devices = JSON.parse(data);
    const index = devices.findIndex(d => d.device_id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Device not found' });
    const deleted = devices.splice(index, 1);
    fs.writeFile(devicesFile, JSON.stringify(devices, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to delete device' });
      res.json(deleted[0]);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
