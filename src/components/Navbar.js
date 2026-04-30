import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="logo-icon">☁️</span>
        <span>AWS<strong>Learn</strong></span>
      </Link>

      <div className="navbar-links">
        <Link to="/" className={isActive('/')}>Home</Link>
        {isAuthenticated && (
          <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
        )}
        {isAuthenticated ? (
          <>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {user?.avatar} {user?.name}
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
