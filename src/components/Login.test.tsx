import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

describe('Login Component', () => {
  it('renders login form', () => {
    render(<Login onLogin={jest.fn()} />);
    expect(screen.getByText(/IoT BI Mapping Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('shows error on invalid login', () => {
    render(<Login onLogin={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument();
  });

  it('calls onLogin on valid login', () => {
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'iot123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    expect(onLogin).toHaveBeenCalledWith({ name: 'Admin User' });
  });
});
