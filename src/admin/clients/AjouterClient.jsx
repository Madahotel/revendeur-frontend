import React, { useEffect, useState } from "react";
import api from "../../utils/Api"; // Assurez-vous que ce chemin est correct
import { Loader, Check, X } from "lucide-react";
import { toast } from "react-toastify";

export default function AjouterClient({ onClose }) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [pays, setPays] = useState("");
  const [montant, setMontant] = useState("");
  const [datePaiement, setDatePaiement] = useState("");
  const [typeClient, setTypeClient] = useState("libre");
  const [revendeurs, setRevendeurs] = useState([]);
  const [revendeurId, setRevendeurId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeClient === "affilie") {
      api
        .get("/revendeurs")
        .then((res) => {
          // ✅ CORRECTION ICI : Accédez à res.data.revendeurs
          const fetchedRevendeurs = res.data.revendeurs; 
          setRevendeurs(fetchedRevendeurs);
          
          // Pré-sélectionner le premier revendeur si la liste n'est pas vide et aucun n'est déjà choisi
          if (fetchedRevendeurs.length > 0 && !revendeurId) {
            setRevendeurId(fetchedRevendeurs[0].id);
          }
        })
        .catch((err) => {
          console.error("Erreur lors du chargement des revendeurs :", err);
          toast.error("Erreur lors du chargement des revendeurs.");
        });
    }
  }, [typeClient, revendeurId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nom,
        email,
        telephone,
        pays,
        montant_paye: montant || 0,
        date_paiement: datePaiement || null,
        statut_paiement: "Non payé",
        ...(typeClient === "affilie" && { revendeur_id: revendeurId }),
      };

      await api.post("/clients", payload);

      toast.success("Client enregistré avec succès !");
      // Réinitialiser les champs du formulaire
      setNom("");
      setEmail("");
      setTelephone("");
      setPays("");
      setMontant("");
      setDatePaiement("");
      setTypeClient("libre");
      setRevendeurId("");

      // Fermer le modal après un court délai
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'ajout du client :", error.response?.data);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erreur lors de l'enregistrement du client.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Ajouter un client</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nom" className="block mb-1 font-medium text-gray-700">Nom complet *</label>
          <input
            type="text"
            id="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label htmlFor="telephone" className="block mb-1 font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            id="telephone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label htmlFor="pays" className="block mb-1 font-medium text-gray-700">Pays</label>
          <input
            type="text"
            id="pays"
            value={pays}
            onChange={(e) => setPays(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label htmlFor="montant" className="block mb-1 font-medium text-gray-700">Montant payé</label>
          <input
            type="number"
            id="montant"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label htmlFor="datePaiement" className="block mb-1 font-medium text-gray-700">Date de paiement</label>
          <input
            type="date"
            id="date_paiement"
            value={datePaiement}
            onChange={(e) => setDatePaiement(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label htmlFor="typeClient" className="block mb-1 font-medium text-gray-700">Type de client *</label>
          <select
            id="typeClient"
            value={typeClient}
            onChange={(e) => {
              setTypeClient(e.target.value);
              setRevendeurId("");
            }}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="libre">Libre</option>
            <option value="affilie">Affilié à un revendeur</option>
          </select>
        </div>

        {typeClient === "affilie" && (
          <div>
            <label htmlFor="revendeur" className="block mb-1 font-medium text-gray-700">Revendeur *</label>
            <select
              id="revendeur"
              value={revendeurId}
              onChange={(e) => setRevendeurId(e.target.value)}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="">-- Sélectionner un revendeur --</option>
              {/* Le .map() fonctionne maintenant car revendeurs est un tableau */}
              {revendeurs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code_affiliation}) {/* Utilisez r.name car c'est ce qui est retourné par le backend */}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-5 w-5" />
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Enregistrer le client
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
