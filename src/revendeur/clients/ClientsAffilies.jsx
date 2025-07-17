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
          // ⚠️ Nouvelle route : /clients/revendeur/{revendeur_id}
          const response = await api.get(`/clients`);
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
      <h2 className="text-xl font-semibold mb-4">Clients affiliés</h2>   {" "}
      {clients.length === 0 ? (
        <p>Aucun client affilié trouvé.</p>
      ) : (
        <ul className="space-y-2">
          {clients.map((client) => (
            <li key={client.id} className="p-3 border rounded-md bg-gray-50">
              <strong>{client.nom}</strong> – {client.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
