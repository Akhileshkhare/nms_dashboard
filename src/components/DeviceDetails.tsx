import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DeviceDetailsProps {
  device: {
    device: string;
    location: { lat: number; lng: number };
    device_id: string;
    details: Array<{ timestamp: string; data: { temperature: number; humidity: number } }>;
  };
}




const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device }) => {
  const navigate = useNavigate();
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  if (!device) {
    return <div className="p-6">Device not found.</div>;
  }
  const hasDetails = Array.isArray(device.details) && device.details.length > 0;
  const chartData = hasDetails
    ? device.details.map(d => ({
        date: new Date(d.timestamp).toLocaleString(),
        temperature: d.data.temperature,
        humidity: d.data.humidity
      }))
    : [];
  return (
    <div className="p-6">
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => navigate(-1)}
      >
        &larr; Back to Dashboard
      </button>
      <div className="mb-6 bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold mb-2">{device.device}</h2>
        <div className="text-gray-700">
          <div><strong>Device ID:</strong> {device.device_id}</div>
          <div><strong>Location:</strong> Lat {device.location.lat}, Lng {device.location.lng}</div>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Device Readings</h3>
        {hasDetails ? (
          <>
            <div className="mb-4 flex items-center gap-4">
              <label className="font-medium">Chart Type:</label>
              <select
                value={chartType}
                onChange={e => setChartType(e.target.value as 'line' | 'bar' | 'pie')}
                className="border rounded px-2 py-1"
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="pie">Pie</option>
              </select>
            </div>
            <div className="mb-6">
              {chartType === 'line' && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#ef4444" name="Temperature" />
                    <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#22c55e" name="Humidity" />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="temperature" fill="#ef4444" name="Temperature" />
                    <Bar dataKey="humidity" fill="#22c55e" name="Humidity" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie
                      data={chartData}
                      dataKey="temperature"
                      nameKey="date"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#ef4444"
                      label
                    >
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-temp-${idx}`} fill="#ef4444" />
                      ))}
                    </Pie>
                    <Pie
                      data={chartData}
                      dataKey="humidity"
                      nameKey="date"
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={120}
                      fill="#22c55e"
                      label
                    >
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-hum-${idx}`} fill="#22c55e" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Temperature (°C)</th>
                  <th className="border px-2 py-1">Humidity (%)</th>
                </tr>
              </thead>
              <tbody>
                {device.details.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="border px-2 py-1">{entry.data.temperature}</td>
                    <td className="border px-2 py-1">{entry.data.humidity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="text-gray-500">No readings available.</div>
        )}
      </div>
    </div>
  );
};

export default DeviceDetails;
