import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { agentsAPI, executionsAPI, campaignsAPI, extractionFieldsAPI } from './services/api';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import SimpleDashboard from './components/SimpleDashboard';
import Payment from './components/Payment';
import './App.css';

function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('login');
  const [showPayment, setShowPayment] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [agents, setAgents] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [extractionFields, setExtractionFields] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for reset token in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      setCurrentPage('reset-password');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch agents
      const agentsData = await agentsAPI.getAll();
      setAgents(agentsData.agents || []);

      // Fetch executions
      const executionsData = await executionsAPI.getAll();
      setExecutions(executionsData.executions || []);

      // Fetch campaigns
      try {
        const campaignsData = await campaignsAPI.getAll();
        setCampaigns(campaignsData.campaigns || []);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }

      // Fetch extraction fields
      try {
        const extractionData = await extractionFieldsAPI.getAll();
        setExtractionFields(extractionData.fields || []);
      } catch (err) {
        console.error('Error fetching extraction fields:', err);
      }

      // Fetch stats
      const statsData = await executionsAPI.getStats();
      setStats(statsData.stats || {});

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Handle authentication loading
  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show payment page if requested
  if (showPayment) {
    return (
      <Payment onBack={() => setShowPayment(false)} />
    );
  }

  // Show login/register pages
  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return (
        <Register
          onPaymentClick={() => setShowPayment(true)}
          onSwitchToLogin={() => setCurrentPage('login')}
        />
      );
    }
    if (currentPage === 'forgot-password') {
      return (
        <ForgotPassword
          onBackToLogin={() => setCurrentPage('login')}
        />
      );
    }
    if (currentPage === 'reset-password' && resetToken) {
      return (
        <ResetPassword
          token={resetToken}
          onBackToLogin={() => {
            setCurrentPage('login');
            setResetToken(null);
          }}
        />
      );
    }
    return (
      <Login
        onSwitchToRegister={() => setCurrentPage('register')}
        onSwitchToForgotPassword={() => setCurrentPage('forgot-password')}
      />
    );
  }

  return (
    <SimpleDashboard
      agents={agents}
      executions={executions}
      campaigns={campaigns}
      extractionFields={extractionFields}
      stats={stats}
      loading={loading}
      onRefresh={fetchData}
      onPaymentClick={() => setShowPayment(true)}
    />
  );
}

export default App;
