import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../blog/AuthContext';
// import Header from '../ui/Header';

// Layout for pages that require a logged-in user: common header + page content.
export default function PrivateLayout() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <>
      {/* <Header /> */}
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}