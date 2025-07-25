// src/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/Api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading || !data) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Tableau de bord Admin 👋</h1>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Clients" value={data.total_clients} color="text-blue-600" />
        <StatCard title="Revendeurs" value={data.total_revendeurs} color="text-purple-600" />
        <StatCard title="Transactions" value={data.total_transactions} color="text-green-600" />
        <StatCard title="Transactions validées" value={data.transactions_validées} color="text-indigo-600" />
        <StatCard title="Transactions rejetées" value={data.transactions_rejetées} color="text-red-600" />
        <StatCard title="Transactions en attente" value={data.transactions_en_attente} color="text-yellow-600" />
        <StatCard title="Total Paiement Validé" value={`${data.total_paiement_valide} Ar`} color="text-green-700" />
        <StatCard title="Total Commission (30%)" value={`${data.total_commission} Ar`} color="text-pink-600" />
      </div>

      {/* Graphique: Transactions par Mois */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Transactions par Mois</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.transactions_par_mois}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 3 Revendeurs */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Top 3 Revendeurs par Solde</h2>
        {data.top_revendeurs_solde.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {data.top_revendeurs_solde.map((rev, i) => (
              <li key={rev.id} className="py-3 flex justify-between">
                <span>{i + 1}. {rev.name} ({rev.email})</span>
                <span className="text-indigo-600 font-bold">{rev.solde} Ar</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-gray-500 italic">Aucun revendeur trouvé</p>}
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Top 3 Revendeurs par Transactions</h2>
        {data.top_revendeurs_transaction.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {data.top_revendeurs_transaction.map((rev, i) => (
              <li key={rev.id} className="py-3 flex justify-between">
                <span>{i + 1}. {rev.name} ({rev.email})</span>
                <span className="text-green-600 font-bold">{rev.transactions_count} transactions</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-gray-500 italic">Aucun revendeur trouvé</p>}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-sm font-semibold text-gray-600 mb-1">{title}</h2>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
