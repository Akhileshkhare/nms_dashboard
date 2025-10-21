import '@testing-library/jest-dom';
  it('renders device stats', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Total Devices/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Temp/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Humidity/i)).toBeInTheDocument();
  });

it('renders Export CSV button when a device is selected', () => {
  render(<Dashboard />);
  // Simulate selecting a device
  fireEvent.click(screen.getByText(/View Details/i));
  expect(screen.getByText(/Export CSV/i)).toBeInTheDocument();
});

  // Add more tests for device selection, date range, etc. as needed
// Mocks to bypass ESM issues with react-leaflet and leaflet in Jest
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div>TileLayer</div>,
  Marker: () => <div>Marker</div>,
  Popup: () => <div>Popup</div>,
}));
jest.mock('leaflet', () => {
  const Marker = function () {};
  Marker.prototype = { options: {} };
  return {
    icon: () => ({}),
    Marker,
  };
});
jest.mock('leaflet/dist/leaflet.css', () => {});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';

beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      url: '',
      clone: () => ({} as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      formData: () => Promise.resolve(new FormData()),
    } as Response)
  );
});

afterAll(() => {
  (global.fetch as jest.Mock).mockClear();
  // @ts-ignore
  global.fetch = undefined;
});

describe('Dashboard Component', () => {
  it('renders Dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});
