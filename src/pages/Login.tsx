import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../blog/AuthContext';

export default function Login() {
  const { currentUser, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  if (currentUser) return <Navigate to="/" replace />;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (login(form.username, form.password)) navigate('/');
    else setError('Usuario no encontrado');
  };

  return (
    <div className="auth-card">
      <h1>Inicio de sesión</h1>
      <form onSubmit={handleSubmit}>
        <label>Nombre de usuario<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
        <label>Contraseña<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">Entrar</button>
      </form>
      <button type="button" className="btn btn-outline" onClick={() => { loginWithGoogle(); navigate('/'); }}>
        Continuar con Google
      </button>
      <p><Link to="/register">Registrarse</Link></p>
    </div>
  );
}