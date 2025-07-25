import React, { useEffect, useState, useCallback } from "react";
import api from '../utils/Api';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import WithdrawalForm from './WithdrawalForm';
import TransactionHistory from './TransactionHistory';
import { ClipboardDocumentIcon, ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function RevendeurDashboard() {
  const [revendeur, setRevendeur] = useState(null);
  const [solde, setSolde] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const affiliationLink = revendeur ? `${window.location.origin}/register?ref=${revendeur.code_affiliation}` : '';

  const fetchRevendeurInfo = useCallback(async () => {
    try {
      const response = await api.get("/me");
      setRevendeur(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des infos revendeur:", err);
      setError("Impossible de charger les informations du revendeur.");
      toast.error("Erreur lors du chargement de votre profil.");
    }
  }, []);

  const fetchSolde = useCallback(async () => {
    try {
      const response = await api.get("/solde");
      setSolde(response.data.solde);
    } catch (err) {
      console.error("Erreur lors de la récupération du solde:", err);
      setError("Impossible de charger votre solde.");
      toast.error("Erreur lors du chargement de votre solde.");
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await api.get("/transactions");
      setTransactions(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des transactions:", err);
      setError("Impossible de charger l'historique des transactions.");
      toast.error("Erreur lors du chargement des transactions.");
    }
  }, []);

  const refreshDashboardData = useCallback(() => {
    fetchSolde();
    fetchTransactions();
  }, [fetchSolde, fetchTransactions]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchRevendeurInfo(), fetchSolde(), fetchTransactions()]);
      setLoading(false);
    };
    loadAllData();
  }, [fetchRevendeurInfo, fetchSolde, fetchTransactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 text-lg font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md border border-red-200 max-w-md">
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={refreshDashboardData}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto font-sans bg-gray-50 min-h-screen">
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
        toastClassName="shadow-lg"
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tableau de bord Revendeur</h1>
        <p className="text-gray-600 mt-1">Gérez votre activité et vos commissions</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Solde Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium">Solde disponible</h2>
                <p className="text-sm opacity-90 mt-1">Montant total pouvant être retiré</p>
              </div>
              <button 
                onClick={refreshDashboardData}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Rafraîchir"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl md:text-4xl font-bold">
                {solde.toLocaleString('fr-FR')} Ar
              </span>
              <button className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Exporter
              </button>
            </div>
          </div>

          {/* Withdrawal Form */}
          <WithdrawalForm solde={solde} onWithdrawalSuccess={refreshDashboardData} />

          {/* Transaction History */}
          <TransactionHistory 
            transactions={transactions} 
            apiBaseUrl={api.defaults.baseURL} 
            onRefreshTransactions={fetchTransactions}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Affiliation Link Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ClipboardDocumentIcon className="h-5 w-5 text-indigo-600" />
              Lien d'affiliation
            </h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                readOnly
                value={affiliationLink}
                className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(affiliationLink);
                  toast.success("Lien copié dans le presse-papier !");
                }}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                Copier le lien
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Partagez ce lien pour inviter de nouveaux clients et gagner des commissions.
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Clients affiliés</p>
                <p className="text-xl font-bold text-indigo-600">24</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Commissions ce mois</p>
                <p className="text-xl font-bold text-indigo-600">1,240,500 Ar</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Retraits effectués</p>
                <p className="text-xl font-bold text-indigo-600">3</p>
              </div>
            </div>
            <button className="mt-4 flex items-center justify-center gap-2 w-full border border-indigo-600 text-indigo-600 px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Télécharger le rapport
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}