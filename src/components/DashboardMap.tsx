import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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


interface MapTooltipProps {
  lat: number;
  lng: number;
  children: React.ReactNode;
}
interface Pos {
  x: number;
  y: number;
}
const MapTooltip: React.FC<MapTooltipProps> = ({ lat, lng, children }) => {
  const map = useMap();
  const [pos, setPos] = useState<Pos | null>(null);
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


interface IoTData {
  device: string;
  location: { lat: number; lng: number };
  device_id: string;
  details: Array<{
    timestamp: string;
    data: { temperature: number; humidity: number };
  }>;
}

const DashboardMap: React.FC = () => {
  const [iotData, setIotData] = useState<IoTData[]>([]);
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

  const bounds = iotData.length > 0 ? iotData.map(d => [d.location.lat, d.location.lng]) : undefined;
  const [hoveredDeviceId, setHoveredDeviceId] = useState<string | null>(null);
  const [hoveredLatLng, setHoveredLatLng] = useState<{lat: number, lng: number} | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  return (
    <div className="h-[400px] w-full mb-8 rounded-lg overflow-hidden shadow relative" style={{marginTop: 32}}>
      {/* @ts-ignore: react-leaflet v5 prop type issue */}
      <MapContainer
        {...(bounds ? { bounds } : { center: [20, 0], zoom: 2 })}
        style={{ height: '100%', width: '100%' }}
      >
        {/* @ts-ignore: react-leaflet v5 prop type issue */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {iotData.map((device) => {
          const hasDetails = Array.isArray(device.details) && device.details.length > 0;
          const lastDetail = hasDetails ? device.details[device.details.length-1] : null;
          return (
            <Marker
              key={device.device_id}
              position={[device.location.lat, device.location.lng]}
              icon={PinIcon}
              eventHandlers={{
                mouseover: () => {
                  setHoveredDeviceId(device.device_id);
                  setHoveredLatLng(device.location);
                },
                mouseout: () => {
                  setHoveredDeviceId(null);
                  setHoveredLatLng(null);
                },
                click: () => {
                  navigate(`/device/${device.device_id}`, { state: { device } });
                }
              }}
            />
          );
        })}
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
  );
};

export default DashboardMap;
