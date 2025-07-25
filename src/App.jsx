import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

// Vérifie à la fois le token et le rôle de l'utilisateur
function PrivateRoute({ allowedRoles = [] }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si des rôles sont spécifiés, vérifie que l'utilisateur a le bon rôle
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Routes protégées avec Layout */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'revendeur']} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Routes admin */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="dashboard/transactions" element={<Transactions />} />
              <Route path="dashboard/clients" element={<Clients />} />
              <Route path="dashboard/ajout/client" element={<AjouterClient />} />
              <Route path="revendeurs" element={<Revendeurs />} />
              <Route path="dashboard/notifications" element={<NotificationList />} />
            </Route>

            {/* Routes revendeur */}
            <Route element={<PrivateRoute allowedRoles={['revendeur']} />}>
              <Route path="dash_rev" element={<RevendeurDashboard />} />
              <Route path="dash_rev/transactions" element={<Transactions />} />
              <Route path="dash_rev/clients" element={<ClientsAffilies />} />
              <Route path="dash_rev/notifications" element={<NotificationList />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}