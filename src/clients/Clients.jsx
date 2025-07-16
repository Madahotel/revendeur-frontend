import React, { useEffect, useState } from 'react';
import api from '../utils/Api';
import { Loader } from 'lucide-react'; // facultatif si tu veux une icône spinner

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [search, setSearch] = useState(""); // facultatif

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients');
        setClients(res.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des clients :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin text-indigo-500 w-6 h-6" />
        <span className="ml-2 text-gray-600">Chargement des clients...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Liste des Clients</h1>
        {/* <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2"
        /> */}
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Nom</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Téléphone</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Pays</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Montant payé</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Date paiement</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{client.nom || client.name}</td>
                <td className="px-6 py-4">{client.email || '-'}</td>
                <td className="px-6 py-4">{client.phone || '-'}</td>
                <td className="px-6 py-4">{client.pays || '-'}</td>
                <td className="px-6 py-4 text-indigo-600 font-semibold">
                  {client.montant_paye ? parseFloat(client.montant_paye).toLocaleString() + ' Ar' : '-'}
                </td>
                <td className="px-6 py-4">{client.date_paiement || '-'}</td>
                <td className="px-6 py-4">
                  {client.revendeur_id ? (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                      Affilié
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-full">
                      Libre
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
