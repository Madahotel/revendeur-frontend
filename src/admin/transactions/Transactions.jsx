// src/transactions/Transactions.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../utils/Api";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [validationNote, setValidationNote] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des transactions:", error);
      toast.error("Erreur lors du chargement des transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (status) => {
    if (!selectedTransaction) return;

    try {
      await api.put(`/transactions/${selectedTransaction.id}`, {
        statut: status,
        note: validationNote,
      });

      toast.success(
        `Transaction ${status === "valide" ? "validée" : "rejetée"} avec succès`
      );
      setSelectedTransaction(null);
      setValidationNote("");
      fetchTransactions(); // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      toast.error("Erreur lors de la validation");
    }
  };

  if (loading)
    return (
      <div className="text-center py-10">Chargement des transactions...</div>
    );

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Liste des Transactions
      </h2>

      {/* Modal de validation */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              Valider la transaction #{selectedTransaction.id}
            </h3>
            <p className="mb-2">
              Client:{" "}
              <span className="font-semibold">
                {selectedTransaction.client?.name || "Client libre"}
              </span>
            </p>
            <p className="mb-2">
              Montant:{" "}
              <span className="font-semibold text-indigo-600">
                {selectedTransaction.montant} Ar
              </span>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (optionnelle)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                rows="3"
                value={validationNote}
                onChange={(e) => setValidationNote(e.target.value)}
                placeholder="Ajouter une note pour le revendeur..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedTransaction(null);
                  setValidationNote("");
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleValidate("refuse")}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
              >
                <XCircleIcon className="h-5 w-5 mr-1" />
                Rejeter
              </button>
              <button
                onClick={() => handleValidate("valide")}
                className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center"
              >
                <CheckCircleIcon className="h-5 w-5 mr-1" />
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
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
                    <div className="flex items-center">
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
                      {tx.statut === "en attente" && (
                        <ClockIcon className="h-4 w-4 ml-1 text-yellow-500" />
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  {/* Actions */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    {tx.statut === "en_attente" ? (
                      <button
                        onClick={() => setSelectedTransaction(tx)}
                        className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                      >
                        Valider
                      </button>
                    ) : (
                      <span className="text-gray-400">Valide</span>
                    )}
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
