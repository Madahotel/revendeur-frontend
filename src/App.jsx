import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Dashboard from './admin/Dashboard';
import Clients from './admin/clients/Clients';
import Layout from './layouts/Layout';
import Transactions from './admin/transactions/Transactions';
import Revendeurs from './admin/revendeurs/Revendeurs';
import RevendeurDashboard from './revendeur/RevendeurDashboard';
import ClientsAffilies from './revendeur/clients/ClientsAffilies';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/clients" element={<Clients />} />
          <Route path="dashboard/transactions" element={<Transactions />} />
          <Route path="revendeurs" element={<Revendeurs />} />
          <Route path="dash_rev" element={<RevendeurDashboard />} />
          <Route path="dash_rev/clients" element={<ClientsAffilies />} />
          {/* autres routes protégées ici */}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
