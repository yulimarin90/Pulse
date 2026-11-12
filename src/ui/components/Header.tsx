import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useCurrentUser } from '../../blog/AuthContext';
import Xlogo from './Xlogo';

export default function Header() {
  const currentUser = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname, key } = useLocation();

  const goBack = () => {
    if (key !== 'default') navigate(-1);
    else navigate('/feed');
  };

  return (
    <header className="header">
      <div className="header-left">
        {pathname !== '/' && (
          <button type="button" className="back-btn" onClick={goBack} aria-label="Volver">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* <Link to="/" className="logo" aria-label="Home"><Xlogo /></Link> */}
        <span className="logo"><Xlogo /></span>
        
      </div>
      <div className="header-right">
        <Link to="/tweet/new" className="post-add-btn" title="Post nuevo" style={{ textDecoration: 'none', color: '#1d9bf0', fontWeight: 'bold', fontSize: '20px' }}>
          +
        </Link>


        <Link to="/bookmarks" className="header-bookmarks" title="Bookmarks" aria-label="Bookmarks">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.500L5 21V4a1 1 0 0 1 1-1z" /></svg>
        </Link>

        <Link to={`/users/${currentUser.username}`} className="header-link" style={{ textDecoration: 'none', color: '#1d9bf0', fontWeight: '600' }}>
          Profile
        </Link>
        <span>@{currentUser.username}</span>
        <button type="button" className="link-button" onClick={logout}>logout</button>
      </div>
    </header>
  );
}