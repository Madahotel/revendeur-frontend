import React, { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { toast } from 'react-toastify'; 


export default function App({ transactions = [], apiBaseUrl = 'http://localhost:8000/api', onRefreshTransactions }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Filter transactions when 'transactions' or 'dateRange' props change
  useEffect(() => {
    // Ensure transactions is an array before filtering
    if (!Array.isArray(transactions)) {
      console.warn("Transactions prop is not an array:", transactions);
      setFilteredTransactions([]);
      return;
    }

    const start = dateRange[0].startDate.setHours(0, 0, 0, 0);
    const end = dateRange[0].endDate.setHours(23, 59, 59, 999);

    const filtered = transactions.filter(t => {
      // Use 'date_demande' if available, otherwise 'created_at'
      const transactionDate = new Date(t.date_demande || t.created_at).getTime();
      return transactionDate >= start && transactionDate <= end;
    });
    setFilteredTransactions(filtered);
  }, [transactions, dateRange]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const exportTransactions = async (format) => {
    try {
      // This function assumes a different backend endpoint for bulk export,
      // as only the single PDF export route was provided.
      const params = {
        format,
        start: dateRange[0].startDate.toISOString().split('T')[0],
        end: dateRange[0].endDate.toISOString().split('T')[0]
      };

      const queryString = new URLSearchParams(params).toString();
      // Use apiBaseUrl to construct the complete URL for general export
      // This URL needs to be adjusted if your backend has a different route for bulk exports.
      window.open(`${apiBaseUrl}/export-transactions?${queryString}`, '_blank');
      
      toast.success(`Exportation ${format.toUpperCase()} lancée !`);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Une erreur s'est produite lors de l'export.");
    }
  };

  const exportSingleTransaction = (id) => {
    // Construct the URL using the provided Laravel route: /export-pdf/transaction/{id}
    const exportUrl = `${apiBaseUrl}/export-pdf/transaction/${id}`;
    window.open(exportUrl, '_blank');
    toast.info("Téléchargement du PDF de la transaction...");
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case "valide":
        return "bg-green-100 text-green-700";
      case "refuse":
        return "bg-red-100 text-red-700";
      case "en_attente":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-xl font-semibold text-gray-800">Mes transactions</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Sélectionner une période
            </button>
            {showDatePicker && (
              <div className="absolute right-0 z-10 mt-2 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <DateRangePicker
                  ranges={dateRange}
                  onChange={handleSelect}
                  maxDate={new Date()}
                  direction="vertical" // For a more compact vertical display
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  months={1}
                  editableDateInputs={true}
                />
                <button 
                  onClick={() => setShowDatePicker(false)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-b-xl hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Valider
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => exportTransactions('pdf')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaDownload className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={() => exportTransactions('excel')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <FaDownload className="h-4 w-4" />
            Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th> {/* Added to distinguish withdrawal/payment */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moyen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(t.date_demande || t.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {parseFloat(t.montant).toLocaleString('fr-FR')} Ar
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {t.type || '-'} {/* Displays transaction type */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {t.moyen_paiement || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(t.statut)}`}>
                      {t.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {t.type === 'paiement' && t.statut === 'valide' && ( // Only for validated payments
                      <button
                        onClick={() => exportSingleTransaction(t.id)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Télécharger PDF de la facture"
                      >
                        <FaDownload className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Aucune transaction trouvée pour la période sélectionnée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
