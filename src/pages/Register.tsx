import { useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../blog/AuthContext';
import type { RegisterData } from '../blog/types';
import Xlogo from '../ui/components/Xlogo';

export default function Register() {
  const { currentUser, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterData>({ fullName: '', username: '', email: '', password: '' });

  if (currentUser) return <Navigate to="/" replace />;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    register(form);
    navigate('/');
  };

  return (
    <div className="auth-card">
      <div className="auth-logo"><Xlogo size={36} /></div>
      <h1>User registration</h1>
      <form onSubmit={handleSubmit}>
        <label>Fullname<input name="fullName" value={form.fullName} onChange={handleChange} required /></label>
        <label>Username<input name="username" value={form.username} onChange={handleChange} required /></label>
        <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={handleChange} required /></label>
        <button type="submit" className="btn">Register</button>
      </form>
      <p className="muted"><Link to="/login" className="accent">Login</Link></p>
    </div>
  );
}