import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Dashboard from './admin/Dashboard';
import Clients from './admin/clients/Clients';
import Layout from './layouts/Layout';
import Transactions from './admin/transactions/Transactions';
import Revendeurs from './admin/revendeurs/Revendeurs';
import RevendeurDashboard from './revendeur/RevendeurDashboard';
import ClientsAffilies from './revendeur/clients/ClientsAffilies';
import AjouterClient from './admin/clients/AjouterClient';
import NotificationList from './admin/notifications/NotificationList';
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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/transactions" element={<Transactions />} />
          <Route path="dash_rev/transactions" element={<Transactions />} />
          <Route path="dashboard/clients" element={<Clients />} />
          <Route path="dashboard/ajout/client" element={<AjouterClient />} />
          <Route path="revendeurs" element={<Revendeurs />} />
          <Route path="dash_rev" element={<RevendeurDashboard />} />
          <Route path="dash_rev/clients" element={<ClientsAffilies />} />
          <Route path="dashboard/notifications" element={<NotificationList />} />
          <Route path="dash_rev/notifications" element={<NotificationList />} />
          {/* autres routes protégées ici */}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
