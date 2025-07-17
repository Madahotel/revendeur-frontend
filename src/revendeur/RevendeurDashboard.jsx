import React, { useEffect, useState } from 'react';
import api from '../utils/Api';
import { FaDownload } from 'react-icons/fa';

const RevendeurDashboard = () => {
  const [solde, setSolde] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [montant, setMontant] = useState('');
  const [moyenPaiement, setMoyenPaiement] = useState('mvola');

  useEffect(() => {
    fetchSolde();
    fetchTransactions();
  }, []);

  const fetchSolde = async () => {
    try {
      const response = await api.get('/solde');
      setSolde(response.data.solde);
    } catch (error) {
      console.error('Erreur solde', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Erreur transactions', error);
    }
  };

  const handleRetrait = async () => {
    if (!montant) return alert("Veuillez entrer un montant");

    try {
      await api.post('/transactions', {
        montant,
        moyen_paiement: moyenPaiement,
      });

      alert("Demande envoyée");
      fetchTransactions();
      fetchSolde();
      setMontant('');
    } catch (error) {
      alert("Erreur lors de la demande");
    }
  };

  const exportPDF = (id) => {
    window.open(`/export-pdf/transaction/${id}`, '_blank');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Solde actuel : </h2>
        <span className="text-green-600 text-3xl font-bold">{solde} Ar</span>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Demande de retrait</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="number"
            placeholder="Montant"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="p-2 border rounded-md w-full md:w-1/3"
          />
          <select
            value={moyenPaiement}
            onChange={(e) => setMoyenPaiement(e.target.value)}
            className="p-2 border rounded-md w-full md:w-1/3"
          >
            <option value="mvola">MVola</option>
            <option value="orange">Orange Money</option>
            <option value="banque">Banque</option>
            <option value="autre">Autre</option>
          </select>
          <button
            onClick={handleRetrait}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
          >
            Envoyer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Mes transactions</h3>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Date</th>
              <th className="p-2">Montant</th>
              <th className="p-2">Moyen</th>
              <th className="p-2">Statut</th>
              <th className="p-2">PDF</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{new Date(t.created_at).toLocaleDateString()}</td>
                <td className="p-2">{t.montant} Ar</td>
                <td className="p-2 capitalize">{t.moyen_paiement}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatutColor(t.statut)}`}>
                    {t.statut}
                  </span>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => exportPDF(t.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaDownload />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const getStatutColor = (statut) => {
  switch (statut) {
    case 'valide':
      return 'bg-green-100 text-green-700';
    case 'refuse':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
};

export default RevendeurDashboard;
