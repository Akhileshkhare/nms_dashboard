// import React, { Component } from 'react'

// export default class Dashboard extends Component {
//   render() {
//     return (
//       <div className="p-6 max-w-6xl mx-auto">
//       <h2 className="text-3xl font-bold mb-6 text-blue-800">Dashboard</h2>
//       <div className="flex gap-8 mb-8">
//         <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
//           <div className="text-gray-500 mb-2">KPI: Total Devices</div>
//           <div className="text-2xl font-bold text-blue-700">{'0'}</div>
//         </div>
//         <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
//           <div className="text-gray-500 mb-2">KPI: Avg Temp</div>
//           <div className="text-2xl font-bold text-red-600">{'0'}</div>
//         </div>
//         <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
//           <div className="text-gray-500 mb-2">KPI: Avg Humidity</div>
//           <div className="text-2xl font-bold text-green-600">{'0'}</div>
//         </div>
//       </div>

//     </div>
//     )
//   }
// }

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Popup, useMap } from 'react-leaflet';
import { Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

interface MapTooltipProps {
  lat: number;
  lng: number;
  children: React.ReactNode;
}
const MapTooltip: React.FC<MapTooltipProps> = ({ lat, lng, children }) => {
  const map = useMap();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (map) {
      const point = map.latLngToContainerPoint([lat, lng]);
      setPos({ x: point.x, y: point.y });
    }
  }, [map, lat, lng]);
  if (!pos) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y - 60,
        zIndex: 1000,
        pointerEvents: 'none',
        transform: 'translate(-50%, -100%)',
      }}
    >
      {children}
    </div>
  );
};

// Fix default icon issue with leaflet in React
const DefaultIcon = L.icon({
  iconUrl: process.env.PUBLIC_URL + '/marker-icon.png',
  shadowUrl: process.env.PUBLIC_URL + '/marker-shadow.png',
});
L.Marker.prototype.options.icon = DefaultIcon;

const PinIcon = L.icon({
  iconUrl: process.env.PUBLIC_URL + '/marker-icon.png',
  shadowUrl: process.env.PUBLIC_URL + '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface IoTData {
  id: number;
  device: string;
  location: { lat: number; lng: number };
  temperature: number;
  humidity: number;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [iotData, setIotData] = useState<any[]>([]);
  const navigate = useNavigate();

  const isElectron = !!(window && window.process && (window.process as any).type);

  useEffect(() => {
    if (isElectron) {
      const fs = window.require('fs');
      const path = window.require('path');
      let dataPath;
      if (window.process && (window.process as any).resourcesPath && !window.location.href.startsWith('file:///' + process.cwd().replace(/\\/g, '/'))) {
        dataPath = path.join((window.process as any).resourcesPath, 'app', 'build', 'data', 'iotData.json');
        if (!fs.existsSync(dataPath)) {
          dataPath = path.join((window.process as any).resourcesPath, 'build', 'data', 'iotData.json');
        }
      } else {
        dataPath = path.join(process.cwd(), 'build', 'data', 'iotData.json');
      }
      fs.readFile(
        dataPath,
        'utf8',
        (
          err: NodeJS.ErrnoException | null,
          data: string
        ) => {
          if (!err) setIotData(JSON.parse(data));
          else console.error('Failed to load IoT data:', err, dataPath);
        }
      );
    } else {
      fetch('/data/iotData.json')
        .then((res) => res.json())
        .then((data) => setIotData(data));
    }
  }, []);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(PinIcon);
    }
  }, []);
  // KPIs
  const totalDevices = iotData.length;
  const avgTemp = iotData.length ? (
    iotData.reduce((sum, d) => sum + (d.details?.[0]?.data?.temperature || 0), 0) / iotData.length
  ).toFixed(1) : '-';
  const avgHumidity = iotData.length ? (
    iotData.reduce((sum, d) => sum + (d.details?.[0]?.data?.humidity || 0), 0) / iotData.length
  ).toFixed(1) : '-';

  // Center and zoom map to fit all device locations
  const bounds = iotData.length > 0 ? iotData.map(d => [d.location.lat, d.location.lng]) : undefined;

  // Track hovered marker and its position
  const [hoveredDeviceId, setHoveredDeviceId] = useState<string | null>(null);
  const [hoveredLatLng, setHoveredLatLng] = useState<{lat: number, lng: number} | null>(null);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Dashboard</h2>
      <div className="flex gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
          <div className="text-gray-500 mb-2">KPI: Total Devices</div>
          <div className="text-2xl font-bold text-blue-700">{totalDevices}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
          <div className="text-gray-500 mb-2">KPI: Avg Temp</div>
          <div className="text-2xl font-bold text-red-600">{avgTemp}°C</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
          <div className="text-gray-500 mb-2">KPI: Avg Humidity</div>
          <div className="text-2xl font-bold text-green-600">{avgHumidity}%</div>
        </div>
      </div>
      <div className="h-[400px] w-full mb-8 rounded-lg overflow-hidden shadow relative">
        {/* @ts-ignore: react-leaflet v5 prop type issue */}
        <MapContainer
          {...(bounds ? { bounds } : { center: [20, 0], zoom: 2 })}
          style={{ height: '100%', width: '100%' }}
        >
          {/* @ts-ignore: react-leaflet v5 prop type issue */}
          <TileLayer
            // @ts-ignore
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            // @ts-ignore
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {iotData.map((device, idx) => {
            const hasDetails = Array.isArray(device.details) && device.details.length > 0;
            const lastDetail = hasDetails ? device.details[device.details.length-1] : null;
            return (
              <Marker
                key={device.device_id}
                position={[device.location.lat, device.location.lng]}
                icon={PinIcon}
                eventHandlers={{
                  click: () => navigate(`/device/${device.device_id}`, { state: { device } }),
                  mouseover: () => {
                    setHoveredDeviceId(device.device_id);
                    setHoveredLatLng(device.location);
                  },
                  mouseout: () => {
                    setHoveredDeviceId(null);
                    setHoveredLatLng(null);
                  }
                }}
              />
            );
          })}
          {/* Custom tooltip for hovered marker, positioned above marker */}
          {hoveredDeviceId && hoveredLatLng && (
            <MapTooltip lat={hoveredLatLng.lat} lng={hoveredLatLng.lng}>
              {(() => {
                const device = iotData.find(d => d.device_id === hoveredDeviceId);
                if (!device) return null;
                const hasDetails = Array.isArray(device.details) && device.details.length > 0;
                const lastDetail = hasDetails ? device.details[device.details.length-1] : null;
                return (
                  <div className="bg-white border border-blue-400 rounded shadow-lg p-4 min-w-[220px] pointer-events-none">
                    <strong>{device.device}</strong><br />
                    Temp: {lastDetail ? `${lastDetail.data?.temperature}°C` : 'N/A'}<br />
                    Humidity: {lastDetail ? `${lastDetail.data?.humidity}%` : 'N/A'}<br />
                    Time: {lastDetail ? new Date(lastDetail.timestamp).toLocaleString() : 'N/A'}<br />
                  </div>
                );
              })()}
            </MapTooltip>
          )}
        </MapContainer>
      </div>
      {/* Device details are now shown on a separate page */}
      {/* Placeholder for Rules Engine */}
      {/* <div className="border border-gray-200 bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-2 text-blue-700">Rules Engine</h3>
        <button disabled className="mb-2 px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed">Create Rule (UI Coming Soon)</button>
        <div>Analyze/process data, trigger actions (notifications, emails, etc.)</div>
      </div> */}
      {/* Placeholder for Device Grouping & Logs */}
      {/* <div className="border border-gray-200 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-700">Device Grouping & Action Logs</h3>
        <div>Group devices by user, log dashboard actions (UI Coming Soon)</div>
      </div> */}
    </div>
  );
};

export default Dashboard;
