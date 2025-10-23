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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${LOCAL_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        onLogin({ name: username });
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
        <div className="login-logo">🔒</div>
        <h2 className="login-title">IoT BI Mapping Login</h2>
        <div className="login-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
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
              placeholder="Enter password"
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
        {error && <div className="login-error">{error}</div>}
        <button className="login-btn" type="submit">Login</button>
        {/* <div className="login-hint">Demo: <b>admin</b> / <b>iot123</b></div> */}
      </form>
    </div>
  );
};

export default Login;
