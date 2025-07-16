// src/transactions/Transactions.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/Api";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/transactions");
        setTransactions(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading)
    return (
      <div className="text-center py-10">Chargement des transactions...</div>
    );

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Liste des Transactions
      </h2>
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  Client
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  Revendeur
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  Montant
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  Statut
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  {/* Client */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    {tx.client?.name || (
                      <span className="italic text-gray-500">Client libre</span>
                    )}
                  </td>

                  {/* Revendeur */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    {tx.revendeur?.name || (
                      <span className="italic text-gray-500">N/A</span>
                    )}
                  </td>

                  {/* Montant */}
                  <td className="px-4 py-2 whitespace-nowrap text-indigo-600 font-semibold">
                    {tx.montant} Ar
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tx.statut === "valide"
                          ? "bg-green-100 text-green-800"
                          : tx.statut === "rejetée"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tx.statut}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic">Aucune transaction enregistrée.</p>
      )}
    </div>
  );
}
