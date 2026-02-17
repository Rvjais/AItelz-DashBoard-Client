import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Phone, DollarSign, Users, RefreshCw, FileText, Mic, Plus, Download, Trash2, CreditCard, ChevronLeft, ChevronRight, Bot, Cloud, Check } from 'lucide-react';
import { agentsAPI, executionsAPI } from '../services/api';
import AddAgentModal from './AddAgentModal';
import ExtractionFields from './ExtractionFields';
import './SimpleDashboard.css';
import './TranscriptsExpenses.css';

const SimpleDashboard = ({ agents, executions, stats, loading, onRefresh, onPaymentClick }) => {
    const { logout, user } = useAuth();
    const [selectedExecution, setSelectedExecution] = useState(null);
    const [activePage, setActivePage] = useState('overview'); // Changed from activeSection
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // New state for desktop collapse
    const [showAddAgentModal, setShowAddAgentModal] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState('all'); // Filter by agent
    const [currency, setCurrency] = useState('USD'); // USD or INR

    // Currency conversion rate (1 USD = 83 INR approximately)
    const USD_TO_INR = 83;

    // Currency formatter function
    const formatCurrency = (amount) => {
        if (currency === 'USD') {
            return `$${amount.toFixed(2)}`;
        } else {
            return `₹${(amount * USD_TO_INR).toFixed(2)}`;
        }
    };

    // Get currency symbol
    const getCurrencySymbol = () => {
        return currency === 'USD' ? '$' : '₹';
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    const handleAgentAdded = () => {
        // Refresh data after adding agent
        onRefresh();
    };

    const handleSyncNow = async () => {
        try {
            setSyncing(true);
            const result = await executionsAPI.syncNow();
            console.log('Sync result:', result);
            alert(`✅ Sync complete! Synced ${result.synced} executions from AItelz.`);
            // Refresh data after sync
            await onRefresh();
        } catch (error) {
            console.error('Sync error:', error);
            alert('❌ Sync failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setSyncing(false);
        }
    };

    const handleSyncHistory = async () => {
        try {
            setSyncing(true);
            const result = await executionsAPI.syncHistory();
            console.log('Sync history result:', result);
            alert(`✅ History Sync complete! Synced ${result.count} past executions to Google Sheet.`);
            // Refresh data after sync
            await onRefresh();
        } catch (error) {
            console.error('History sync error:', error);
            alert('❌ History sync failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setSyncing(false);
        }
    };

    // Filter executions and stats by selected agent
    const filteredExecutions = selectedAgent === 'all'
        ? executions
        : executions.filter(exec => exec.agent_id?._id === selectedAgent);

    // Calculate talk time statistics
    const totalTalkTime = filteredExecutions.reduce((sum, exec) => sum + (exec.conversation_time || 0), 0);

    const filteredStats = {
        total_executions: filteredExecutions.length,
        total_cost: filteredExecutions.reduce((sum, exec) => sum + (exec.total_cost || 0), 0),
        total_talk_time: totalTalkTime,
        avg_talk_time: filteredExecutions.length > 0 ? totalTalkTime / filteredExecutions.length : 0,
    };

    const totalCalls = filteredStats.total_executions;
    const totalCost = filteredStats.total_cost;
    const agentCount = agents?.length || 0;
    const totalTalkTimeMinutes = Math.floor(filteredStats.total_talk_time / 60);
    const avgTalkTimeSeconds = Math.round(filteredStats.avg_talk_time);

    const changePage = (page) => {
        setActivePage(page);
        setSidebarOpen(false);
    };

    const handleDeleteAgent = async (agentId, agentName) => {
        if (!window.confirm(`Are you sure you want to remove "${agentName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await agentsAPI.delete(agentId);
            alert(`✅ Agent "${agentName}" removed successfully!`);
            // Refresh data after deletion
            await onRefresh();
        } catch (error) {
            console.error('Delete error:', error);
            alert('❌ Failed to delete agent: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="simple-dashboard">
            {/* Mobile Menu Toggle */}
            <button
                className="mobile-menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle Menu"
            >
                <div className="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>

            {/* Sidebar */}
            <div className={`sidebar-simple ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
                {/* Desktop Collapse Toggle */}
                <button
                    className="sidebar-collapse-toggle"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div className="sidebar-header">
                    <h2>AItelz</h2>
                    <p className="user-name">👤 {user?.name}</p>
                </div>

                <nav className="sidebar-nav">
                    <div
                        className={`nav-item ${activePage === 'overview' ? 'active' : ''}`}
                        onClick={() => changePage('overview')}
                    >
                        <Phone size={20} />
                        <span>Overview</span>
                    </div>

                    <div
                        className={`nav-item ${activePage === 'agents' ? 'active' : ''}`}
                        onClick={() => changePage('agents')}
                    >
                        <Users size={20} />
                        <span>Voice Agents</span>
                    </div>

                    <div
                        className={`nav-item ${activePage === 'calls' ? 'active' : ''}`}
                        onClick={() => changePage('calls')}
                    >
                        <Mic size={20} />
                        <span>Call History</span>
                    </div>

                    <div
                        className={`nav-item ${activePage === 'transcripts' ? 'active' : ''}`}
                        onClick={() => changePage('transcripts')}
                    >
                        <FileText size={20} />
                        <span>Transcripts</span>
                    </div>

                    <div
                        className={`nav-item ${activePage === 'expenses' ? 'active' : ''}`}
                        onClick={() => changePage('expenses')}
                    >
                        <DollarSign size={20} />
                        <span>Expenses</span>
                    </div>

                    <div
                        className={`nav-item ${activePage === 'extraction' ? 'active' : ''}`}
                        onClick={() => changePage('extraction')}
                    >
                        <Bot size={20} />
                        <span>AI Data Extraction</span>
                    </div>

                    {onPaymentClick && (
                        <div
                            className="nav-item payment-nav-item"
                            onClick={onPaymentClick}
                        >
                            <CreditCard size={20} />
                            <span>Payment</span>
                        </div>
                    )}
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="main-content-simple">
                <div className="header-simple">
                    <div>
                        <h1>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h1>
                        <p className="header-subtitle">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="currency-toggle-btn"
                            onClick={() => setCurrency(currency === 'USD' ? 'INR' : 'USD')}
                            title={`Switch to ${currency === 'USD' ? 'INR (₹)' : 'USD ($)'}`}
                        >
                            <span className="currency-symbol">{getCurrencySymbol()}</span>
                            <span className="currency-label">{currency}</span>
                        </button>
                        <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
                            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                            <span className="refresh-text">Refresh</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading data...</p>
                    </div>
                ) : (
                    <>
                        {/* Overview Page */}
                        {activePage === 'overview' && (
                            <div className="section">
                                <h2 className="section-title">Overview</h2>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon phone">
                                            <Phone size={24} />
                                        </div>
                                        <div className="stat-content">
                                            <h3>Total Calls</h3>
                                            <p className="stat-value">{totalCalls}</p>
                                            <span className="stat-label">People contacted</span>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon cost">
                                            <DollarSign size={24} />
                                        </div>
                                        <div className="stat-content">
                                            <h3>Total Expense</h3>
                                            <p className="stat-value">{formatCurrency(totalCost)}</p>
                                            <span className="stat-label">Add-on costs</span>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon agents">
                                            <Users size={24} />
                                        </div>
                                        <div className="stat-content">
                                            <h3>Voice Agents</h3>
                                            <p className="stat-value">{agentCount}</p>
                                            <span className="stat-label">Active agents</span>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon phone">
                                            <Mic size={24} />
                                        </div>
                                        <div className="stat-content">
                                            <h3>Total Talk Time</h3>
                                            <p className="stat-value">{totalTalkTimeMinutes}m</p>
                                            <span className="stat-label">Time on calls</span>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon cost">
                                            <RefreshCw size={24} />
                                        </div>
                                        <div className="stat-content">
                                            <h3>Avg Talk Time</h3>
                                            <p className="stat-value">{Math.floor(avgTalkTimeSeconds / 60)}m {avgTalkTimeSeconds % 60}s</p>
                                            <span className="stat-label">Per call average</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Voice Agents Page */}
                        {activePage === 'agents' && (
                            <div className="section">
                                <div className="section-header">
                                    <h2 className="section-title">
                                        <Users size={24} />
                                        Your Voice Agents
                                    </h2>
                                    <div className="section-actions">
                                        <button
                                            className="sync-btn"
                                            onClick={handleSyncNow}
                                            disabled={syncing || loading}
                                        >
                                            <Download size={20} className={syncing ? 'spinning' : ''} />
                                            {syncing ? 'Syncing...' : 'Sync'}
                                        </button>
                                        <button
                                            className="add-agent-btn"
                                            onClick={() => setShowAddAgentModal(true)}
                                        >
                                            <Plus size={20} />
                                            Add Agent
                                        </button>
                                    </div>
                                </div>

                                <div className="agents-list">
                                    {agents.length === 0 ? (
                                        <div className="empty-state">
                                            <Users size={48} />
                                            <p>No voice agents found</p>
                                            <span>Click "Add Agent" to get started</span>
                                        </div>
                                    ) : (
                                        agents.map((agent) => (
                                            <div key={agent._id} className="agent-card">
                                                <div className="agent-icon">
                                                    <Users size={24} />
                                                </div>
                                                <div className="agent-info">
                                                    <h3>{agent.name}</h3>
                                                    <p className="agent-id">ID: {agent.bolna_agent_id}</p>
                                                    {agent.description && <p className="agent-desc">{agent.description}</p>}
                                                </div>
                                                <div className="agent-actions">
                                                    <span className="badge">Active</span>
                                                    <button
                                                        className="delete-agent-btn"
                                                        onClick={() => handleDeleteAgent(agent._id, agent.name)}
                                                        title="Remove Agent"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Call History Page */}
                        {activePage === 'calls' && (
                            <div className="section">
                                <div className="section-header">
                                    <h2 className="section-title">
                                        <Mic size={24} />
                                        Call History & Transcripts
                                    </h2>
                                    <div className="filter-group">
                                        <button
                                            className="sync-history-btn"
                                            onClick={handleSyncHistory}
                                            disabled={syncing}
                                            title="Sync all past calls to Google Sheet"
                                            style={{
                                                marginRight: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 1rem',
                                                background: 'var(--primary-color)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            <Cloud size={16} className={syncing ? 'spinning' : ''} />
                                            {syncing ? 'Syncing...' : 'Sync History'}
                                        </button>
                                        <label htmlFor="agent-filter">Filter by Agent:</label>
                                        <select
                                            id="agent-filter"
                                            className="agent-filter"
                                            value={selectedAgent}
                                            onChange={(e) => setSelectedAgent(e.target.value)}
                                        >
                                            <option value="all">All Agents</option>
                                            {agents.map(agent => (
                                                <option key={agent._id} value={agent._id}>
                                                    {agent.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="executions-list">
                                    {filteredExecutions.length === 0 ? (
                                        <div className="empty-state">
                                            <Mic size={48} />
                                            <p>No calls found</p>
                                            <span>{selectedAgent === 'all'
                                                ? 'Calls will appear here once your agents start receiving calls'
                                                : 'No calls found for this agent'}</span>
                                        </div>
                                    ) : (
                                        filteredExecutions.map((execution) => (
                                            <div
                                                key={execution._id}
                                                className="execution-card"
                                                onClick={() => setSelectedExecution(selectedExecution?._id === execution._id ? null : execution)}
                                            >
                                                <div className="execution-header">
                                                    <div className="execution-info">
                                                        <h3>📞 Call with {execution.to_number || 'Unknown'}</h3>
                                                        <p className="execution-meta">
                                                            <span>👤 {execution.agent_id?.name || 'Unknown'}</span>
                                                            <span>⏱️ {Math.floor(execution.conversation_time / 60)}m {execution.conversation_time % 60}s</span>
                                                            <span>💰 {formatCurrency(execution.total_cost || 0)}</span>
                                                            {execution.extracted_data?.google_sheet_synced && (
                                                                <span title="Synced to Google Sheet" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: '500' }}>
                                                                    <Check size={14} /> Synced
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="execution-date">
                                                            📅 {new Date(execution.started_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className={`status-badge ${execution.status}`}>
                                                        {execution.status}
                                                    </div>
                                                </div>

                                                {selectedExecution?._id === execution._id && (
                                                    <div className="execution-details">
                                                        <div className="detail-section">
                                                            <h4>📋 Call Details</h4>
                                                            <div className="detail-grid">
                                                                <div className="detail-item">
                                                                    <span className="label">From:</span>
                                                                    <span className="value">{execution.from_number || 'N/A'}</span>
                                                                </div>
                                                                <div className="detail-item">
                                                                    <span className="label">To:</span>
                                                                    <span className="value">{execution.to_number || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {execution.transcript && (
                                                            <div className="detail-section">
                                                                <h4>📝 Transcript</h4>
                                                                <div className="transcript">
                                                                    {execution.transcript}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {execution.extracted_data && Object.keys(execution.extracted_data).length > 0 && (
                                                            <div className="detail-section">
                                                                <h4>📊 Extracted Data</h4>
                                                                <pre className="extracted-data">
                                                                    {JSON.stringify(execution.extracted_data, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}

                                                        {execution.metadata?.recording_url && (
                                                            <div className="detail-section">
                                                                <h4>🎵 Recording</h4>
                                                                <audio controls className="audio-player">
                                                                    <source src={execution.metadata.recording_url} type="audio/mpeg" />
                                                                    Your browser does not support the audio element.
                                                                </audio>
                                                                <a
                                                                    href={execution.metadata.recording_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="download-link"
                                                                >
                                                                    ⬇️ Download Recording
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Transcripts Page */}
                        {activePage === 'transcripts' && (
                            <div className="section">
                                <div className="section-header">
                                    <h2 className="section-title">
                                        <FileText size={24} />
                                        Transcripts
                                    </h2>
                                    <div className="filter-group">
                                        <label htmlFor="transcript-filter">Filter by Agent:</label>
                                        <select
                                            id="transcript-filter"
                                            className="agent-filter"
                                            value={selectedAgent}
                                            onChange={(e) => setSelectedAgent(e.target.value)}
                                        >
                                            <option value="all">All Agents</option>
                                            {agents.map(agent => (
                                                <option key={agent._id} value={agent._id}>
                                                    {agent.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="transcripts-list">
                                    {filteredExecutions.filter(exec => exec.transcript).length === 0 ? (
                                        <div className="empty-state">
                                            <FileText size={48} />
                                            <p>No transcripts available</p>
                                            <span>Transcripts will appear here after calls are completed</span>
                                        </div>
                                    ) : (
                                        filteredExecutions.filter(exec => exec.transcript).map((execution) => (
                                            <div key={execution._id} className="transcript-card">
                                                <div className="transcript-header">
                                                    <div>
                                                        <h4>Call with {execution.to_number}</h4>
                                                        <p className="transcript-meta">
                                                            <span>👤 {execution.agent_id?.name}</span>
                                                            <span>📅 {new Date(execution.started_at).toLocaleString()}</span>
                                                            <span>⏱️ {Math.floor(execution.conversation_time / 60)}m {execution.conversation_time % 60}s</span>
                                                        </p>
                                                    </div>
                                                    <span className={`status-badge ${execution.status}`}>
                                                        {execution.status}
                                                    </span>
                                                </div>
                                                <div className="transcript-content">
                                                    {execution.transcript}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Expenses Page */}
                        {activePage === 'expenses' && (
                            <div className="section">
                                <div className="section-header">
                                    <h2 className="section-title">
                                        <DollarSign size={24} />
                                        Expenses Breakdown
                                    </h2>
                                    <div className="filter-group">
                                        <label htmlFor="expense-filter">Filter by Agent:</label>
                                        <select
                                            id="expense-filter"
                                            className="agent-filter"
                                            value={selectedAgent}
                                            onChange={(e) => setSelectedAgent(e.target.value)}
                                        >
                                            <option value="all">All Agents</option>
                                            {agents.map(agent => (
                                                <option key={agent._id} value={agent._id}>
                                                    {agent.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="expenses-summary">
                                    <div className="expense-card total">
                                        <h3>Total Expenses</h3>
                                        <p className="expense-value">{formatCurrency(totalCost)}</p>
                                        <span>{totalCalls} call{totalCalls !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="expense-card average">
                                        <h3>Average Cost per Call</h3>
                                        <p className="expense-value">{totalCalls > 0 ? formatCurrency(totalCost / totalCalls) : formatCurrency(0)}</p>
                                        <span>Per call</span>
                                    </div>
                                </div>

                                <div className="expenses-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Agent</th>
                                                <th>To Number</th>
                                                <th>Duration</th>
                                                <th>Status</th>
                                                <th>Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredExecutions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="empty-row">
                                                        No expense data available
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredExecutions.map((execution) => (
                                                    <tr key={execution._id}>
                                                        <td>{new Date(execution.started_at).toLocaleDateString()}</td>
                                                        <td>{execution.agent_id?.name}</td>
                                                        <td>{execution.to_number}</td>
                                                        <td>{Math.floor(execution.conversation_time / 60)}m {execution.conversation_time % 60}s</td>
                                                        <td>
                                                            <span className={`status-badge ${execution.status}`}>
                                                                {execution.status}
                                                            </span>
                                                        </td>
                                                        <td className="cost-cell">{formatCurrency(execution.total_cost || 0)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* AI Data Extraction Page */}
                        {activePage === 'extraction' && (
                            <ExtractionFields />
                        )}
                    </>
                )}
            </div>

            {/* Add Agent Modal */}
            {
                showAddAgentModal && (
                    <AddAgentModal
                        onClose={() => setShowAddAgentModal(false)}
                        onAgentAdded={handleAgentAdded}
                    />
                )
            }
        </div >
    );
};

export default SimpleDashboard;
