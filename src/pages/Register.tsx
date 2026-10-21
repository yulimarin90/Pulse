import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../blog/AuthContext';
import type { RegisterData } from '../blog/types';

export default function Register() {
  const { currentUser, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterData>({ fullName: '', username: '', email: '', password: '' });

  if (currentUser) return <Navigate to="/" replace />;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    register(form);
    navigate('/');
  };

  return (
    <div className="auth-card">
      <h1>Registro</h1>
      <form onSubmit={handleSubmit}>
        <label>Nombre completo<input name="fullName" value={form.fullName} onChange={handleChange} required /></label>
        <label>Nombre de usuario<input name="username" value={form.username} onChange={handleChange} required /></label>
        <label>Correo electrónico<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
        <label>Contraseña<input name="password" type="password" value={form.password} onChange={handleChange} required /></label>
        <button type="submit" className="btn">Registrarse</button>
      </form>
      <p><Link to="/login">Iniciar sesión</Link></p>
    </div>
  );
}