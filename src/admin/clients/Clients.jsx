import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/Api"; // Assurez-vous que ce chemin est correct
import { Loader, Plus, Search, RefreshCw, Check, X } from "lucide-react";
import AjouterClient from "./AjouterClient"; // Assurez-vous que ce chemin est correct
import { toast, ToastContainer } from "react-toastify"; // Importez ToastContainer
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
  const [confirmingClientId, setConfirmingClientId] = useState(null);

  // Fonction pour récupérer les clients, mise en cache avec useCallback
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/clients");
      setClients(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients :", error);
      setError("Erreur lors de la récupération des clients.");
      toast.error("Erreur lors de la récupération des clients.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Effet pour charger les clients au montage du composant
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Filtrer les clients en fonction de la recherche
  const filteredClients = clients.filter((client) => {
    const searchTerm = search.toLowerCase();
    return (
      (client.nom || client.name || "").toLowerCase().includes(searchTerm) ||
      (client.email || "").toLowerCase().includes(searchTerm) ||
      (client.phone || "").toLowerCase().includes(searchTerm)
    );
  });

  // Gérer l'actualisation de la liste des clients
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchClients();
  };

  // Importer un client par email
  const importerClient = async (email) => {
    if (!email) {
      toast.warning("Veuillez entrer un email.");
      return;
    }

    try {
      const res = await api.get(`/import-client/${email}`);
      const nouveauClient = res.data.client;

      if (!nouveauClient) {
        toast.info(res.data.message || "Client introuvable.");
        return;
      }

      const dejaExistant = clients.find((c) => c.email === nouveauClient.email);
      if (!dejaExistant) {
        setClients([...clients, nouveauClient]);
        toast.success("Client importé avec succès !");
        setImportEmail("");
      } else {
        toast.info("Ce client est déjà dans la liste.");
      }
    } catch (error) {
      console.error("Erreur importation client:", error);
      toast.error("Client non trouvé ou erreur API.");
    }
  };

  // Confirmer la mise à jour du statut de paiement
  const confirmStatusUpdate = (clientId) => {
    const selectedStatut = newStatuts[clientId];
    const client = clients.find((c) => c.id === clientId);

    if (!selectedStatut || selectedStatut === client.statut_paiement) {
      toast.info("Aucun changement de statut détecté.");
      return;
    }

    setConfirmingClientId(clientId);
  };

const updateClientStatus = async (confirmed = false) => {
    if (!confirmed) {
        setConfirmingClientId(null);
        return;
    }

    const clientId = confirmingClientId;
    const selectedStatut = newStatuts[clientId];
    const client = clients.find((c) => c.id === clientId);

    if (!client || !selectedStatut) {
        toast.error("Client ou statut invalide");
        setConfirmingClientId(null);
        return;
    }

    try {
        const payload = {
            statut_paiement: selectedStatut.toLowerCase(), // Conversion en minuscules
            montant_paye: client.montant_paye || 0
        };

        const response = await api.patch(`/clients/${clientId}/update-statut`, payload);
        
        if (!response.data.success) {
            throw new Error(response.data.message || "Échec de la mise à jour");
        }

        // 2. Met à jour localement l'état
        setClients(prev => 
            prev.map(c => 
                c.id === clientId ? { 
                    ...c, 
                    statut_paiement: selectedStatut,
                    date_paiement: new Date().toISOString(),
                    ...(payload.montant_paye && { 
                        montant_paye: payload.montant_paye 
                    })
                } : c
            )
        );

        // 3. Si Total payé et revendeur existe, valider paiement
        if (selectedStatut === "Total payé" && client.revendeur_id) {
            try {
                await api.post(`/clients/${clientId}/valider-paiement`);
            } catch (err) {
                console.error("Erreur validation paiement:", err);
                toast.warning("Statut mis à jour mais erreur lors de la validation du paiement");
            }
        }

        toast.success("Statut mis à jour avec succès");
        
        // 4. Nettoyage
        setNewStatuts(prev => {
            const newState = {...prev};
            delete newState[clientId];
            return newState;
        });
    } catch (err) {
        console.error("Erreur mise à jour statut:", {
            error: err,
            response: err.response?.data
        });
        
        const errorMessage = err.response?.data?.error 
            || err.response?.data?.message
            || err.message
            || "Erreur lors de la mise à jour";
            
        toast.error(errorMessage);
    } finally {
        setConfirmingClientId(null);
    }
};

  // Affichage du loader pendant le chargement initial
  if (loading && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader className="animate-spin text-indigo-600 w-8 h-8" />
        <span className="text-gray-600">Chargement des clients...</span>
      </div>
    );
  }

  // Affichage de l'erreur si la récupération échoue
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <X className="text-red-500 w-8 h-8" />
        <span className="text-red-600">{error}</span>
        <button
          onClick={fetchClients}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ToastContainer pour afficher les notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Modal de confirmation pour la mise à jour du statut */}
      {confirmingClientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer la modification
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir modifier le statut de paiement de ce
              client ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => updateClientStatus(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => updateClientStatus(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête de la page Clients */}
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

        {/* Barre de recherche et boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg min-w-[120px] transition-colors"
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
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Section d'importation de client et tableau */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-center bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              placeholder="Importer un client par email"
              value={importEmail}
              onChange={(e) => setImportEmail(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <button
            onClick={() => importerClient(importEmail)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
          >
            <Plus size={16} />
            Importer client
          </button>
        </div>

        {/* Tableau des clients */}
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
                  Statut Client
                </th> {/* Renommé pour clarté */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut Paiement
                </th> {/* Ajouté pour le statut de paiement */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {search
                      ? "Aucun client correspondant à votre recherche"
                      : "Aucun client enregistré"}
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
                    {/* Colonne Statut Client (Affilié/Libre) */}
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
                    {/* Colonne Statut Paiement */}
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      {client.statut_paiement === "Total payé" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paiement finalisé
                        </span>
                      ) : (
                        <>
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
                            className="border rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          >
                            <option value="Non payé">Non payé</option>
                            <option value="Partiel">Partiel</option>
                            <option value="Total payé">Total payé</option>
                          </select>

                          <button
                            onClick={() => confirmStatusUpdate(client.id)}
                            disabled={
                              !newStatuts[client.id] ||
                              newStatuts[client.id] === client.statut_paiement
                            }
                            className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                              !newStatuts[client.id] ||
                              newStatuts[client.id] === client.statut_paiement
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Valider
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal AjouterClient - rendu conditionnel */}
{showModal && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    {/* Overlay semi-transparent */}
    <div
      className="fixed inset-0 bg-black opacity-50"
      onClick={() => setShowModal(false)}
    ></div>

    {/* Centrage du contenu */}
    <div className="flex items-center justify-center min-h-screen px-4 py-6">
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()} // Empêche l'overlay de fermer en cliquant sur le contenu
      >
        <AjouterClient
          onClose={() => {
            setShowModal(false);
            fetchClients(); // Recharge les clients
          }}
        />
        {/* Bouton de fermeture optionnel */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
