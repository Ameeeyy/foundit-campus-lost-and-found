import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'Browse' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/my-work', label: 'My work' },
    { to: '/notifications', label: 'Notifications' },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">F</div>
          <div>
            <div className="brand-name">FoundIt</div>
            <div className="brand-subtitle">Campus lost & found</div>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="user-pill">{user.name}</span>
              <button className="button button-secondary" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <NavLink className="button button-primary" to="/auth">Log in</NavLink>
          )}
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
