import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiLogOut, FiBell, FiTrendingUp, FiUserCheck } from 'react-icons/fi';

export default function Sidebar({ user }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition duration-150 ${
      isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <aside className="h-screen w-64 bg-gray-800 flex flex-col shadow-lg fixed">
      {/* Logo */}
      <div className="p-6 text-white text-2xl font-bold border-b border-gray-700">
        Forma Fusion
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 text-sm font-medium">
        <NavLink to="/dashboard" className={linkClass}>
          <FiHome /> Accueil
        </NavLink>

        <NavLink to="/clients" className={linkClass}>
          <FiUsers /> Clients
        </NavLink>

        <NavLink to="/transactions" className={linkClass}>
          <FiTrendingUp /> Transactions
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink to="/revendeurs" className={linkClass}>
            <FiUserCheck /> Revendeurs
          </NavLink>
        )}

        <NavLink to="/notifications" className={linkClass}>
          <FiBell /> Notifications
        </NavLink>
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
          <FiLogOut /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
