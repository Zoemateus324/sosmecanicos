import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Enable React Router v7 future flags
UNSAFE_DataRouterContext.displayName = 'DataRouter';
UNSAFE_DataRouterStateContext.displayName = 'DataRouterState';

// Configure future flags
declare global {
  interface Window {
    __reactRouterFutureFlags: {
      v7_startTransition: boolean;
      v7_relativeSplatPath: boolean;
    };
  }
}

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
import ScheduleService from './pages/client/ScheduleService';
import Profile from './pages/Profile';
import Subscriptions from './pages/Subscriptions';
import EmployeesPage from './pages/mechanic/Employees';
import ServicesPage from './pages/mechanic/Services';
import ComoFunciona from './pages/info/ComoFunciona';
import ParaClientes from './pages/info/ParaClientes';
import ParaMecanicos from './pages/info/ParaMecanicos';

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={
          isAuthenticated && userType ? <Navigate to={`/${userType}/dashboard`} replace /> : <Home />
        } />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" /> : <Register />
        } />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/para-clientes" element={<ParaClientes />} />
        <Route path="/para-mecanicos" element={<ParaMecanicos />} />

        {/* Rota de perfil - protegida mas acessível para todos os tipos de usuário */}
        <Route path="/profile" element={
          isAuthenticated ? <Profile /> : <Navigate to="/login" replace />
        } />

        {/* Rota de assinaturas - protegida mas acessível para todos os tipos de usuário */}
        <Route path="/subscriptions" element={
          isAuthenticated ? <Subscriptions /> : <Navigate to="/login" replace />
        } />

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
                <Route path="vehicles/:id/schedule-service" element={<ScheduleService />} />
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
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="services" element={<ServicesPage />} />
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

        {/* Redirecionamento padrão */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              userType === 'mechanic' ? (
                <Navigate to="/mechanic/dashboard" />
              ) : (
                <Navigate to="/client/request-service" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;