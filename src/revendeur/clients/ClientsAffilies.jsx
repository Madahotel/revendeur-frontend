import React, { useEffect, useState } from "react";
import api from "../../utils/Api";
import { Loader, AlertCircle, Check, Clock, X } from "lucide-react";

export default function ClientsAffilies() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 secondes

  const fetchClients = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (!user || !user.role || user.role !== "revendeur") {
        setError("Accès réservé aux revendeurs. Veuillez vous connecter en tant que revendeur.");
        setLoading(false);
        return;
      }

      const response = await api.get("/mes-clients");
      
      if (response.data && response.data.length > 0) {
        setClients(response.data);
        setSuccess(`${response.data.length} client(s) affilié(s) trouvé(s).`);
      } else {
        setClients([]);
        setSuccess("Aucun client affilié pour le moment.");
      }
    } catch (err) {
      let errorMessage = "Erreur lors du chargement des clients.";
      if (err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || `Erreur serveur: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "Pas de réponse du serveur. Vérifiez votre connexion ou l'état du serveur.";
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Erreur détaillée lors du fetchClients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    const intervalId = setInterval(fetchClients, refreshInterval);
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  const getStatusBadge = (status) => {
    const baseClass = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case "Total payé":
        return (
          <span className={`${baseClass} bg-green-100 text-green-800`}>
            <Check className="h-3 w-3 mr-1" />
            {status}
          </span>
        );
      case "Partiel":
        return (
          <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className={`${baseClass} bg-red-100 text-red-800`}>
            <X className="h-3 w-3 mr-1" />
            {status || "Non payé"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-gray-700">Chargement des clients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 mx-auto max-w-2xl mt-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <p className="mt-1 text-xs text-red-700">Veuillez vérifier votre connexion ou vos permissions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium leading-6 text-gray-900">
            Mes clients affiliés
          </h2>
          {success && (
            <p className="mt-1 text-sm text-green-600">{success}</p>
          )}
        </div>

        {clients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun client affilié pour le moment.
          </div>
        ) : (
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
                    Statut Paiement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Validation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {client.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(client.statut_paiement)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {/* Utilisation de client.montant_paye ou client.montant selon ce qui est retourné */}
                        {client.montant_paye?.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR', // Ou 'MGA' si c'est la devise de Madagascar
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }) || client.montant?.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }) || "0,00 €"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {/* Utilisation de client.date_validation qui vient de latestTransaction */}
                        {client.date_paiement ? (
                          new Date(client.date_paiement).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        ) : (
                          "-"
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
