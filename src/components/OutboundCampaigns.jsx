import React, { useState, useEffect } from 'react';
import { Play, Pause, Trash2, Plus, PhoneCall, RefreshCw, AlertCircle, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { campaignsAPI, googleSheetsAPI } from '../services/api';
import CreateCampaignModal from './CreateCampaignModal';
import './OutboundCampaigns.css';

const OutboundCampaigns = ({ agents, onRefresh, highlightId }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [googleStatus, setGoogleStatus] = useState({ isConnected: false });

    useEffect(() => {
        fetchData();
        checkGoogleAuth();
    }, []);

    const checkGoogleAuth = async () => {
        try {
            const status = await googleSheetsAPI.getStatus();
            setGoogleStatus({ isConnected: status.is_authorized || false });
        } catch (error) {
            console.error('Failed to check Google auth status', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await campaignsAPI.getAll();
            setCampaigns(response.campaigns || []);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (highlightId && !loading && campaigns.length > 0) {
            const element = document.getElementById(`campaign-${highlightId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('highlight-pulse');
                setTimeout(() => {
                    element.classList.remove('highlight-pulse');
                }, 3000);
            }
        }
    }, [highlightId, loading, campaigns]);

    const handleStatusToggle = async (campaign) => {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';
        try {
            await campaignsAPI.updateStatus(campaign._id, newStatus);
            fetchData();
            if (onRefresh) onRefresh();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await campaignsAPI.delete(id);
            fetchData();
            if (onRefresh) onRefresh();
        } catch (error) {
            alert('Failed to delete campaign');
        }
    };

    const handleConnectGoogle = async () => {
        try {
            const response = await googleSheetsAPI.getAuthUrl();
            if (response.authUrl) {
                window.location.href = response.authUrl;
            }
        } catch (err) {
            alert('Failed to get Google Auth URL');
        }
    };

    return (
        <div className="outbound-campaigns-section">
            <div className="section-header">
                <h2 className="section-title">
                    <PhoneCall size={24} />
                    Outbound Campaigns
                </h2>
                <div className="section-actions">
                    <button
                        className="sync-btn"
                        onClick={fetchData}
                        disabled={loading}
                        title="Refresh Campaigns"
                    >
                        <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                    </button>
                    <button
                        className="submit-btn add-btn"
                        onClick={() => setShowCreateModal(true)}
                        disabled={!googleStatus.isConnected}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={20} />
                        Create Campaign
                    </button>
                </div>
            </div>

            {!googleStatus.isConnected && (
                <div className="google-auth-warning">
                    <AlertCircle size={24} />
                    <p>Google Sheets integration is required to launch automated outbound campaigns.</p>
                    <button onClick={handleConnectGoogle} className="connect-btn">
                        Connect Google Sheets
                    </button>
                </div>
            )}

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading campaigns...</p>
                </div>
            ) : campaigns.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon-wrapper">
                        <PhoneCall size={64} strokeWidth={1.5} />
                    </div>
                    <p>No outbound campaigns found</p>
                    {googleStatus.isConnected ? (
                        <span>Ready to start? Create your first campaign to begin automated calling.</span>
                    ) : (
                        <span>Connect your Google account to start creating campaigns.</span>
                    )}
                </div>
            ) : (
                <div className="campaigns-grid">
                    {campaigns.map((campaign) => (
                        <div
                            key={campaign._id}
                            id={`campaign-${campaign._id}`}
                            className={`campaign-card ${campaign.status === 'active' ? 'active' : ''} ${highlightId === campaign._id ? 'initial-highlight' : ''}`}
                        >
                            <div className="campaign-header">
                                <div className="campaign-title-area">
                                    <h3>{campaign.name}</h3>
                                    <div className="agent-badge">
                                        <PhoneCall size={12} />
                                        {campaign.agent_id?.name || 'Unknown Agent'}
                                    </div>
                                </div>
                                <div className={`status-indicator ${campaign.status === 'active' ? 'status-active' : 'status-paused'}`}>
                                    {campaign.status}
                                </div>
                            </div>

                            <div className="campaign-stats">
                                <div className="stat-item">
                                    <span className="label">Total</span>
                                    <span className="value">{campaign.total_records || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Remaining</span>
                                    <span className="value">{campaign.pending_records || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Completed</span>
                                    <span className="value">{campaign.completed_records || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Max Retries</span>
                                    <span className="value">{campaign.max_retries || 0}</span>
                                </div>
                            </div>

                            <div className="campaign-details">
                                <div className="detail-row">
                                    <ExternalLink size={14} />
                                    <a href={campaign.google_sheet_url} target="_blank" rel="noopener noreferrer">
                                        View Data Source
                                    </a>
                                </div>
                                <div className="detail-row">
                                    <Calendar size={14} />
                                    <span>Last Run: {campaign.last_run_at ? new Date(campaign.last_run_at).toLocaleDateString() : 'Pending'}</span>
                                </div>
                                <div className="detail-row">
                                    <CheckCircle2 size={14} />
                                    <span>Target Column: <strong>{campaign.phone_column_name}</strong></span>
                                </div>
                            </div>

                            <div className="campaign-actions">
                                <button
                                    className={`action-btn ${campaign.status === 'active' ? 'pause-btn' : 'play-btn'}`}
                                    onClick={() => handleStatusToggle(campaign)}
                                    title={campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                                >
                                    {campaign.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                                    {campaign.status === 'active' ? 'Pause' : 'Start'}
                                </button>
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDelete(campaign._id)}
                                    title="Delete Campaign"
                                    style={{ flex: '0 0 auto', width: 'auto' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateCampaignModal
                    agents={agents}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchData();
                        if (onRefresh) onRefresh();
                    }}
                />
            )}
        </div>
    );
};

export default OutboundCampaigns;
