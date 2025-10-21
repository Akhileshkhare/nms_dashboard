import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import UserManagement from './UserManagement';

describe('UserManagement Component', () => {
  it('renders User Management title', () => {
    render(<UserManagement />);
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  });

  it('renders initial users', () => {
    render(<UserManagement />);
    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    expect(screen.getByText('Bob User')).toBeInTheDocument();
  });

  it('can open and close add user modal', async () => {
    render(<UserManagement />);
    const addButton = screen.getByRole('button', { name: '+ Add User' });
    await userEvent.click(addButton);
    expect(await screen.findByRole('heading', { name: /Add User/i, level: 3 })).toBeInTheDocument();
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);
    expect(screen.queryByRole('heading', { name: /Add User/i, level: 3 })).not.toBeInTheDocument();
  });

  it('can add a new user', async () => {
    render(<UserManagement />);
    await act(async () => { screen.getByText('+ Add User').click(); });
    const nameInput = await screen.findByPlaceholderText('Name');
    const emailInput = await screen.findByPlaceholderText('Email');
    const roleSelect = screen.getByDisplayValue('User');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@iot.com' } });
      fireEvent.change(roleSelect, { target: { value: 'user' } });
    });
    await act(async () => { screen.getByText('Add').click(); });
    expect(await screen.findByText('Test User')).toBeInTheDocument();
  });

  it('can deactivate a user', async () => {
    render(<UserManagement />);
    const deactivateButtons = await screen.findAllByTitle('Deactivate');
    await act(async () => { deactivateButtons[0].click(); });
    expect(screen.getAllByText((content) => content.includes('Deactivated')).length).toBeGreaterThan(0);
  });

  it('can remove a user', async () => {
    render(<UserManagement />);
    const deleteButtons = await screen.findAllByTitle('Delete');
    await act(async () => { deleteButtons[0].click(); });
    await act(async () => { screen.getByText('Remove').click(); });
    expect(screen.queryByText('Alice Admin')).not.toBeInTheDocument();
  });
});
