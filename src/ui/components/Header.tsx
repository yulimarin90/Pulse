import { Link } from 'react-router-dom';
import { useAuth, useCurrentUser } from '../blog/AuthContext';

export default function Header() {
  const currentUser = useCurrentUser();
  const { logout } = useAuth();
  return (
    <header className="header">
      <Link to="/" className="logo">X Clone</Link>
      <div className="header-right">
        <span>{currentUser.username}</span>
        <button type="button" className="link-button" onClick={logout}>Cerrar sesión</button>
      </div>
    </header>
  );
}
