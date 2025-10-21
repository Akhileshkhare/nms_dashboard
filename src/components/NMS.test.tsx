import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NMS from './NMS';

describe('NMS Component', () => {
  it('renders device stats', () => {
    render(<NMS />);
    expect(screen.getByText(/Total Bytes Transferred/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Devices/i)).toBeInTheDocument();
    expect(screen.getByText(/Number of Users Registered/i)).toBeInTheDocument();
  });

  it('opens and closes add device modal', () => {
    render(<NMS />);
    fireEvent.click(screen.getByText('Add Device'));
    expect(screen.getByRole('heading', { name: /Add Device/i })).toBeInTheDocument();
    fireEvent.click(screen.getByText('×'));
    expect(screen.queryByRole('heading', { name: /Add Device/i })).not.toBeInTheDocument();
  });

  it('adds a device (simulated)', () => {
    render(<NMS />);
    // The first "Add Device" button opens the modal
    const addDeviceButtons = screen.getAllByRole('button', { name: /Add Device/i });
    fireEvent.click(addDeviceButtons[0]);
    // Simulate filling out the form if fields exist
    const nameInput = screen.queryByPlaceholderText(/Name/i);
    if (nameInput) {
      fireEvent.change(nameInput, { target: { value: 'Test Device' } });
    }
    // The second "Add Device" button is the submit button in the modal
    const modalAddButtons = screen.getAllByRole('button', { name: /Add Device/i });
    if (modalAddButtons.length > 1) {
      fireEvent.click(modalAddButtons[1]);
      // Modal should close after add
      expect(screen.queryByRole('heading', { name: /Add Device/i })).not.toBeInTheDocument();
    }
  });

  it('deactivates a device (simulated)', () => {
    render(<NMS />);
    const deactivateButtons = screen.getAllByRole('button', { name: /Deactivate/i });
    if (deactivateButtons.length > 0) {
      fireEvent.click(deactivateButtons[0]);
      // Optionally check for a status/message update
    }
  });

  it('deletes a device (simulated)', () => {
    render(<NMS />);
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      // Optionally check for a status/message update
    }
  });
  it('renders NMS title', () => {
    render(<NMS />);
    expect(screen.getByTestId('nms-title')).toBeInTheDocument();
  });
});
