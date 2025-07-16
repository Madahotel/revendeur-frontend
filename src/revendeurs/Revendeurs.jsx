// src/revendeurs/Revendeurs.jsx
import React, { useEffect, useState, useCallback } from 'react';
import RevendeurForm from './RevendeurForm';
import api from '../utils/Api';

export default function Revendeurs() {
  const [revendeurs, setRevendeurs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⛏️ Déplace cette fonction ici
  const fetchRevendeurs = useCallback(async () => {
    try {
      const res = await api.get('/revendeurs');
      setRevendeurs(res.data);
    } catch (error) {
      console.error('Erreur chargement des revendeurs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 👇 Appel initial
  useEffect(() => {
    fetchRevendeurs();
  }, [fetchRevendeurs]);

  if (loading) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Liste des Revendeurs</h2>

      {/* ✅ Création revendeur */}
      <RevendeurForm onCreated={fetchRevendeurs} />

      {revendeurs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Nom</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Pays</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Code Affiliation</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Clients Affiliés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {revendeurs.map((revendeur) => (
                <tr key={revendeur.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{revendeur.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{revendeur.email}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{revendeur.pays || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap font-mono text-indigo-600">
                    {revendeur.code_affiliation || 'N/A'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-green-700 font-semibold">
                    {revendeur.clients_count ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic">Aucun revendeur trouvé.</p>
      )}
    </div>
  );
}
