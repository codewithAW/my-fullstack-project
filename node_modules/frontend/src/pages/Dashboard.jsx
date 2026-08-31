import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CitizenDashboard from '../components/CitizenDashboard';
import OfficerDashboard from '../components/OfficerDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'officer' && user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return (
    <>
      {user.role === 'officer' ? <OfficerDashboard /> : <CitizenDashboard />}
    </>
  );
};

export default Dashboard;
