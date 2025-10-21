import '@testing-library/jest-dom';
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
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  expect(
    screen.getByText(/dashboard|iot bi mapping/i)
  ).toBeInTheDocument();
});
