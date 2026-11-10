import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../blog/AuthContext';
import { getAuthErrorMessage } from '../blog/firebase';
import ProviderButton from '../ui/components/ProviderButton';
import type { Provider } from '../ui/components/ProviderButton';
import Xlogo from '../ui/components/Xlogo';

const PROVIDERS: Provider[] = ['Google', 'GitHub', 'Facebook', 'Microsoft'];

export default function Login() {
  const { currentUser, login, loginWithProvider } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [providerMessage, setProviderMessage] = useState('');

  if (currentUser) return <Navigate to="/" replace />;

  const handleProvider = async (provider: Provider) => {
    setProviderMessage('');
    try {
      await loginWithProvider(provider);
      navigate('/feed');
    } catch (err) {
      setProviderMessage(getAuthErrorMessage(err));
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      if (await login(form.username, form.password)) navigate('/feed');
      else setError('Invalid username or password');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-logo"><Xlogo size={36} /></div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Username<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
        <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">Enter</button>
      </form>
      <div className="divider"><span>o</span></div>
      <p className="jf-element">Select an option below:</p>
      {PROVIDERS.map((provider) => (
        <ProviderButton key={provider} provider={provider} onClick={() => handleProvider(provider)} />
      ))}
      {providerMessage && <p className="error">{providerMessage}</p>}
      <p className="muted"><Link to="/register" className="accent">Register</Link></p>
    </div>
  );
}