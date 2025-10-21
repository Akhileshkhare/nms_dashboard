import React, { useState } from 'react';

const devices = [
  { id: 'dev1', name: 'Device 1' },
  { id: 'dev2', name: 'Device 2' },
  { id: 'dev3', name: 'Device 3' },
];

type Rule = {
  id: number;
  device: string;
  minTemp: number;
  maxTemp: number;
  minHum: number;
  maxHum: number;
  checkAvailability: boolean;
  event: string;
};

const RulesEngine: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState(devices[0].id);
  const [minTemp, setMinTemp] = useState(0);
  const [maxTemp, setMaxTemp] = useState(100);
  const [minHum, setMinHum] = useState(0);
  const [maxHum, setMaxHum] = useState(100);
  const [checkAvailability, setCheckAvailability] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);

  const handleAddRule = () => {
    let event = '';
    // Simulate event logic
    if (minTemp > maxTemp) event = 'Invalid temperature range';
    else if (minHum > maxHum) event = 'Invalid humidity range';
    else event = 'Rule set';
    if (checkAvailability) event += ' | Device availability monitored';
    setRules([
      ...rules,
      {
        id: Date.now(),
        device: selectedDevice,
        minTemp,
        maxTemp,
        minHum,
        maxHum,
        checkAvailability,
        event,
      },
    ]);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Rules Engine</h2>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddRule(); }}>
        <div>
          <label className="block font-semibold mb-1">Device</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedDevice}
            onChange={e => setSelectedDevice(e.target.value)}
          >
            {devices.map(dev => (
              <option key={dev.id} value={dev.id}>{dev.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Min Temperature (°C)</label>
            <input type="number" className="w-full border rounded px-2 py-1" value={minTemp} onChange={e => setMinTemp(Number(e.target.value))} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Max Temperature (°C)</label>
            <input type="number" className="w-full border rounded px-2 py-1" value={maxTemp} onChange={e => setMaxTemp(Number(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Min Humidity (%)</label>
            <input type="number" className="w-full border rounded px-2 py-1" value={minHum} onChange={e => setMinHum(Number(e.target.value))} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Max Humidity (%)</label>
            <input type="number" className="w-full border rounded px-2 py-1" value={maxHum} onChange={e => setMaxHum(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex items-center">
          <input type="checkbox" id="avail" checked={checkAvailability} onChange={e => setCheckAvailability(e.target.checked)} />
          <label htmlFor="avail" className="ml-2">Trigger event if device not available</label>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Rule</button>
      </form>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">Rules List</h3>
        <ul>
          {rules.map(rule => (
            <li key={rule.id} className="border-b py-2">
              <span className="font-semibold">Device:</span> {devices.find(d => d.id === rule.device)?.name} | 
              <span className="font-semibold">Temp:</span> {rule.minTemp} - {rule.maxTemp}°C | 
              <span className="font-semibold">Hum:</span> {rule.minHum} - {rule.maxHum}% | 
              <span className="font-semibold">Availability:</span> {rule.checkAvailability ? 'Monitored' : 'Not monitored'} | 
              <span className="text-green-700">{rule.event}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RulesEngine;
