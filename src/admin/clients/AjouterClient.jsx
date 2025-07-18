import React, { useEffect, useState } from "react";
import api from "../../utils/Api";

export default function AjouterClient() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [pays, setPays] = useState("");
  const [typeClient, setTypeClient] = useState("libre"); // libre ou affilie
  const [revendeurs, setRevendeurs] = useState([]);
  const [codeAffiliation, setCodeAffiliation] = useState("");

  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (typeClient === "affilie") {
      api.get("/revendeurs") 
        .then((res) => setRevendeurs(res.data))
        .catch((err) => console.error("Erreur revendeurs:", err));
    }
  }, [typeClient]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        nom,
        email,
        pays,
        code_affiliation: typeClient === "affilie" ? codeAffiliation : null,
        revendeur_id: user.id,
      };

      const response = await api.post("/register-client", payload);

      setMessage("Client enregistré avec succès !");
      // Reset form
      setNom("");
      setEmail("");
      setPays("");
      setTypeClient("libre");
      setCodeAffiliation("");
    } catch (error) {
  console.error("Erreur ajout client :", error.response?.data);
  if (error.response?.data?.error) {
    setMessage(error.response.data.error);
  } else {
    setMessage("Erreur lors de l'enregistrement du client.");
  }
}

  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Ajouter un client</h2>

      {message && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nom *</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Pays</label>
          <input
            type="text"
            value={pays}
            onChange={(e) => setPays(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Type de client *</label>
          <select
            value={typeClient}
            onChange={(e) => setTypeClient(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="libre">Libre</option>
            <option value="affilie">Affilié</option>
          </select>
        </div>

        {typeClient === "affilie" && (
          <div>
            <label className="block mb-1 font-medium">
              Sélectionner un revendeur
            </label>
            <select
              value={codeAffiliation}
              onChange={(e) => setCodeAffiliation(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded"
            >
              <option value="">-- Choisir un revendeur --</option>
              {revendeurs.map((r) => (
                <option key={r.id} value={r.code_affiliation}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
