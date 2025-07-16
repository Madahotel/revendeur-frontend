import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout?.(); // Raha misy fonction logout avy any amin'ny parent
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-600">FormaFusion</h1>

      <ul className="flex space-x-6 text-gray-700 font-medium">
        <li><Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link></li>
        <li><Link to="/transactions" className="hover:text-indigo-600">Transactions</Link></li>
        {user?.role === 'admin' && (
          <>
            <li><Link to="/clients" className="hover:text-indigo-600">Clients</Link></li>
            <li><Link to="/revendeurs" className="hover:text-indigo-600">Revendeurs</Link></li>
            <li><Link to="/export" className="hover:text-indigo-600">Export</Link></li>
          </>
        )}
        {user?.role === 'revendeur' && (
          <>
            <li><Link to="/solde" className="hover:text-indigo-600">Mon solde</Link></li>
          </>
        )}
        <li><Link to="/notifications" className="hover:text-indigo-600">🔔</Link></li>
        <li>
          <button onClick={handleLogout} className="text-red-500 hover:underline">
            Déconnexion
          </button>
        </li>
      </ul>
    </nav>
  );
}
