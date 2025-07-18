import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/Api";
import { Loader, Plus, Search, RefreshCw, Check, X } from "lucide-react";
import AjouterClient from "./AjouterClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newStatuts, setNewStatuts] = useState({});
  const [importEmail, setImportEmail] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/clients");
      setClients(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients :", error);
      setError("Erreur lors de la récupération des clients.");
      toast.error("Erreur lors de la récupération des clients");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter((client) => {
    const searchTerm = search.toLowerCase();
    return (
      (client.nom || client.name || "").toLowerCase().includes(searchTerm) ||
      (client.email || "").toLowerCase().includes(searchTerm) ||
      (client.phone || "").toLowerCase().includes(searchTerm)
    );
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchClients();
  };

  const importerClient = async (email) => {
    if (!email) {
      toast.warning("Veuillez entrer un email");
      return;
    }

    try {
      const res = await api.get(`/import-client/${email}`);
      const nouveauClient = res.data.client;

      if (!nouveauClient) {
        toast.info(res.data.message || "Client introuvable");
        return;
      }

      const dejaExistant = clients.find((c) => c.email === nouveauClient.email);
      if (!dejaExistant) {
        setClients([...clients, nouveauClient]);
        toast.success("Client importé avec succès");
        setImportEmail("");
      } else {
        toast.info("Ce client est déjà dans la liste");
      }
    } catch (error) {
      console.error("Erreur importation client:", error);
      toast.error("Client non trouvé ou erreur API");
    }
  };

  const updateClientStatus = async (clientId) => {
    const selectedStatut = newStatuts[clientId];
    const client = clients.find((c) => c.id === clientId);

    if (!selectedStatut || selectedStatut === client.statut_paiement) {
      toast.info("Aucun changement détecté");
      return;
    }

    try {
      await api.patch(`/clients/${clientId}/paiement`, {
        statut_paiement: selectedStatut,
      });

      // Mise à jour locale
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId ? { ...c, statut_paiement: selectedStatut } : c
        )
      );

      // Validation si Total payé
      if (selectedStatut === "Total payé") {
        await api.post(`/clients/${clientId}/valider-paiement`);
      }

      toast.success("Statut mis à jour avec succès");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader className="animate-spin text-indigo-600 w-8 h-8" />
        <span className="text-gray-600">Chargement des clients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <X className="text-red-500 w-8 h-8" />
        <span className="text-red-600">{error}</span>
        <button
          onClick={fetchClients}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          <RefreshCw size={16} />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Gestion des Clients
          </h1>
          <p className="text-gray-600 mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""} enregistré
            {clients.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg min-w-[120px]"
          >
            {isRefreshing ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualiser
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              placeholder="Importer un client par email"
              value={importEmail}
              onChange={(e) => setImportEmail(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => importerClient(importEmail)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg whitespace-nowrap"
          >
            <Plus size={16} />
            Importer client
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant payé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {search ? "Aucun client correspondant à votre recherche" : "Aucun client enregistré"}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {client.nom || client.name || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.pays || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-indigo-600">
                        {client.montant_paye
                          ? parseFloat(client.montant_paye).toLocaleString() +
                            " Ar"
                          : "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {client.date_paiement || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.revendeur_id ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Affilié
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Libre
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      <select
                        value={
                          newStatuts[client.id] ||
                          client.statut_paiement ||
                          "Non payé"
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewStatuts((prev) => ({
                            ...prev,
                            [client.id]: value,
                          }));
                        }}
                        className="border rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="Non payé">Non payé</option>
                        <option value="Partiel">Partiel</option>
                        <option value="Total payé">Total payé</option>
                      </select>

                      <button
                        onClick={() => updateClientStatus(client.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Valider
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal AjouterClient */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Ajouter un nouveau client
                      </h3>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <AjouterClient
                        onClose={() => {
                          setShowModal(false);
                          fetchClients();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}