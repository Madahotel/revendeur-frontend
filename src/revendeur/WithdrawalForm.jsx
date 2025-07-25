import React, { useState } from 'react';
import api from '../utils/Api';
import { toast } from 'react-toastify';
import { Loader } from 'lucide-react';

export default function WithdrawalForm({ solde, onWithdrawalSuccess }) {
  const [montant, setMontant] = useState("");
  const [moyenPaiement, setMoyenPaiement] = useState("mvola");
  const [loading, setLoading] = useState(false);

  const handleRetrait = async () => {
    if (!montant) {
      toast.warning("Veuillez entrer un montant.");
      return;
    }

    const montantNum = parseFloat(montant);
    if (montantNum <= 0 || isNaN(montantNum)) {
      toast.error("Le montant doit être supérieur à zéro.");
      return;
    }

    if (montantNum > solde) {
      toast.error("Le montant demandé dépasse votre solde disponible.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/transactions", {
        montant: montantNum,
        moyen_paiement: moyenPaiement,
        type: 'retrait', // Assurez-vous que votre backend gère ce type
        statut: 'en_attente' // Statut initial pour un retrait
      });

      toast.success("Demande de retrait envoyée avec succès !");
      setMontant("");
      if (onWithdrawalSuccess) {
        onWithdrawalSuccess(); // Appelle la fonction de rafraîchissement du parent
      }
    } catch (error) {
      console.error("Erreur lors du retrait :", error);
      toast.error(error.response?.data?.message || "Une erreur s'est produite lors du retrait. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Demande de retrait</h3>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="number"
          placeholder="Montant du retrait (Ar)"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg w-full md:flex-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          min="1"
          step="1000"
        />
        <select
          value={moyenPaiement}
          onChange={(e) => setMoyenPaiement(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg w-full md:flex-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
        >
          <option value="mvola">MVola</option>
          <option value="orange">Orange Money</option>
          <option value="banque">Virement Bancaire</option>
          <option value="autre">Autre</option>
        </select>
        <button
          onClick={handleRetrait}
          disabled={loading || parseFloat(montant) <= 0 || parseFloat(montant) > solde || isNaN(parseFloat(montant))}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors w-full md:w-auto ${
            loading || parseFloat(montant) <= 0 || parseFloat(montant) > solde || isNaN(parseFloat(montant))
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? (
            <>
              <Loader className="animate-spin h-5 w-5" />
              Envoi...
            </>
          ) : (
            "Envoyer la demande"
          )}
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Votre solde disponible pour le retrait est de {solde.toLocaleString('fr-FR')} Ar.
      </p>
    </div>
  );
}
