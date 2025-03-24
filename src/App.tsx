import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/Dashboard';
import MechanicDashboard from './pages/mechanic/Dashboard';
import InsuranceDashboard from './pages/insurance/Dashboard';
import TowDashboard from './pages/tow/Dashboard';
import AddVehicle from './pages/client/AddVehicle';
import RequestService from './pages/client/RequestService';
import VehicleDetails from './pages/client/VehicleDetails';
import EditVehicle from './pages/client/EditVehicle';

type UserType = 'client' | 'mechanic' | 'insurance' | 'tow' | null;

interface PrivateRouteProps {
  userType: UserType;
  allowedType: UserType;
  children: React.ReactNode;
}

function PrivateRoute({ userType, allowedType, children }: PrivateRouteProps) {
  const location = useLocation();
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userType !== allowedType) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { userType, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={
        isAuthenticated && userType ? <Navigate to={`/${userType}/dashboard`} /> : <Home />
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rotas do cliente */}
      <Route
        path="/client/*"
        element={
          <PrivateRoute userType={userType} allowedType="client">
            <Routes>
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="vehicles/add" element={<AddVehicle />} />
              <Route path="vehicles/:id" element={<VehicleDetails />} />
              <Route path="vehicles/:id/edit" element={<EditVehicle />} />
              <Route path="request-service" element={<RequestService />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* Rotas do mecânico */}
      <Route
        path="/mechanic/*"
        element={
          <PrivateRoute userType={userType} allowedType="mechanic">
            <Routes>
              <Route path="dashboard" element={<MechanicDashboard />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* Rotas da seguradora */}
      <Route
        path="/insurance/*"
        element={
          <PrivateRoute userType={userType} allowedType="insurance">
            <Routes>
              <Route path="dashboard" element={<InsuranceDashboard />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* Rotas do guincho */}
      <Route
        path="/tow/*"
        element={
          <PrivateRoute userType={userType} allowedType="tow">
            <Routes>
              <Route path="dashboard" element={<TowDashboard />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;