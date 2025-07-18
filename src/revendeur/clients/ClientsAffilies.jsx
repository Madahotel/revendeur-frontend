import React, { useEffect, useState } from "react";
import api from "../../utils/Api";

export default function ClientsAffilies() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.role === "revendeur") {
      const fetchClients = async () => {
        try {
          const response = await api.get(`/mes-clients`);
          setClients(response.data);
        } catch (err) {
          setErreur("Erreur lors du chargement des clients affiliés.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchClients();
    } else {
      setErreur("Aucun revendeur connecté ou accès non autorisé.");
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (erreur) return <div className="text-red-500">{erreur}</div>;

  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Clients affiliés</h2>
      {clients.length === 0 ? (
        <p>Aucun client affilié trouvé.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Nom</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="text-center">
                  <td className="border px-4 py-2">{client.name}</td>
                  <td className="border px-4 py-2">{client.email}</td>
                  <td
                    className={`border px-4 py-2 ${
                      client.statut === "Payé"
                        ? "text-green-600 font-semibold"
                        : "text-red-600"
                    }`}
                  >
                    {client.statut || "Inconnu"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
