import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../blog/AuthContext';

const PROVIDERS = ['Google', 'GitHub', 'Facebook', 'Microsoft'];

export default function Login() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [providerMessage, setProviderMessage] = useState('');

  if (currentUser) return <Navigate to="/" replace />;

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (login(form.username, form.password)) navigate('/');
    else setError('User not found');
  };

  return (
    <div className="auth-card">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Username<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
        <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">Enter</button>
      </form>
      {PROVIDERS.map((provider) => (
        <button
          key={provider}
          type="button"
          className="btn btn-outline"
          onClick={() => setProviderMessage('button disabled')}
          // onClick={() => { loginWithProvider(provider); navigate('/'); }}
        >
          Continue with {provider}
        </button>
      ))}
      {providerMessage && <p className="error">{providerMessage}</p>}
      <p><Link to="/register">Register</Link></p>
    </div>
  );
}