import React, { useState } from 'react';
import './Login.css';
import { LOCAL_URL } from '../service/Config.tsx';
const Login: React.FC<{ onLogin: (user: { name: string }) => void }> = ({ onLogin }) => {
  // On mount, check for token and auto-login if present
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      onLogin({ name: username });
    }
  }, [onLogin]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${LOCAL_URL}api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', email);
        if (keepLoggedIn) {
          localStorage.setItem('keepLoggedIn', 'true');
        } else {
          localStorage.removeItem('keepLoggedIn');
        }
        onLogin({ name: email });
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
      
        <h2 className="login-title" style={{ marginBottom: 18 }}>Login</h2>
        <div className="login-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div className="login-field">
          <label htmlFor="password">Password</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button type="button" className="show-pass-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <input
            type="checkbox"
            id="keepLoggedIn"
            checked={keepLoggedIn}
            onChange={e => setKeepLoggedIn(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          <label htmlFor="keepLoggedIn" style={{ fontSize: 15, color: '#333', cursor: 'pointer' }}>Keep me logged in</label>
        </div>
        {error && <div className="login-error">{error}</div>}
        <button className="login-btn" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
