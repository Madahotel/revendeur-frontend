// src/layouts/Layout.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import api from '../utils/Api';

export default function Layout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get('/me');
        setUser(res.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement...</div>;
  if (!user) return <div className="p-10 text-center text-red-600">Utilisateur non trouvé</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} />
      <main className="flex-1 p-6 max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
