import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/Dashboard';
import MechanicDashboard from './pages/mechanic/Dashboard';
import VehicleDetails from './pages/client/VehicleDetails';
import ScheduleService from './pages/client/ScheduleService';

type PrivateRouteProps = {
  children: React.ReactNode;
  userType?: 'client' | 'mechanic';
};

function PrivateRoute({ children, userType }: PrivateRouteProps) {
  const { user, userType: currentUserType, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (userType && userType !== currentUserType) {
    return <Navigate to={`/${currentUserType}/dashboard`} />;
  }

  return <>{children}</>;
}

function App() {
  const { userType } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={
          userType ? <Navigate to={`/${userType}/dashboard`} /> : <Home />
        } />
        <Route path="/login" element={
          userType ? <Navigate to={`/${userType}/dashboard`} /> : <Login />
        } />
        <Route path="/register" element={
          userType ? <Navigate to={`/${userType}/dashboard`} /> : <Register />
        } />

        {/* Rotas do cliente */}
        <Route path="/client/dashboard" element={
          <PrivateRoute userType="client">
            <ClientDashboard />
          </PrivateRoute>
        } />
        <Route path="/client/vehicles/:id" element={
          <PrivateRoute userType="client">
            <VehicleDetails />
          </PrivateRoute>
        } />
        <Route path="/client/vehicles/:id/schedule-service" element={
          <PrivateRoute userType="client">
            <ScheduleService />
          </PrivateRoute>
        } />

        {/* Rotas do mecânico */}
        <Route path="/mechanic/dashboard" element={
          <PrivateRoute userType="mechanic">
            <MechanicDashboard />
          </PrivateRoute>
        } />

        {/* Rota de fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;