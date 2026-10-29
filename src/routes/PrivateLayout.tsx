import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../blog/AuthContext';
import Header from '../ui/components/Header';

export default function PrivateLayout() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <>
      <Header /> 
      <main className="container">
        <Outlet />
      </main>

      {/* bottom bar visible in Home, Feed, Post.) */}
      <nav className="bottom-icon-bar">
        <Link to="/" className="nav-icon-btn" title="Home">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>
        </Link>
        <Link to="/search" className="nav-icon-btn" title="Search">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.384-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"/></svg>
        </Link>
        <Link to="/notifications" className="nav-icon-btn" title="Notifications">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M19.29 17.29L18 16.03V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5.03l-1.29 1.26c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L7 17.88V11c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6.88l1.88 1.82c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41zM12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/></svg>
        </Link>
        <Link to="/messages" className="nav-icon-btn" title="Messages">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M19.25 3.25H4.75C3.5 3.25 2.5 4.25 2.5 5.5v13c0 1.25 1 2.25 2.25 2.25h14.5c1.25 0 2.25-1 2.25-2.25v-13c0-1.25-1-2.25-2.25-2.25zm-14.5 1.5h14.5c.41 0 .75.34.75.75v1.2l-7.98 5.32c-.17.11-.39.11-.54 0L4 6.7V5.5c0-.41.34-.75.75-.75zm14.5 14.5H4.75c-.41 0-.75-.34-.75-.75V8.5l7.48 4.99c.75.5 1.75.5 2.5 0L21.5 8.5v10.5c0 .41-.34.75-.75.75z"/></svg>
        </Link>
      </nav>
    </>
  );
}