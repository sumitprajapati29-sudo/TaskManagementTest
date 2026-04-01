import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        ✅ <span>TaskFlow</span>
      </Link>
      <div className="navbar-right">
        <span className="navbar-user">
          Hello, <strong>{user?.name}</strong>
        </span>
        <button className="btn-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
