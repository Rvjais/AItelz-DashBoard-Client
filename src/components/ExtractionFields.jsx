import React, { useState, useEffect } from 'react';
import { extractionFieldsAPI, googleSheetsAPI, apiKeyAPI } from '../services/api';
import FieldFormModal from './FieldFormModal';
import './ExtractionFields.css';

const ExtractionFields = ({ onRefresh }) => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingField, setEditingField] = useState(null);

    // Google Sheets state
    const [googleConnected, setGoogleConnected] = useState(false);
    const [sheetId, setSheetId] = useState('');
    const [sheetUrl, setSheetUrl] = useState(null);
    const [connectingGoogle, setConnectingGoogle] = useState(false);

    // API Key state
    const [hasApiKey, setHasApiKey] = useState(false);
    const [maskedKey, setMaskedKey] = useState(null);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [savingApiKey, setSavingApiKey] = useState(false);
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);

    useEffect(() => {
        fetchFields();
        fetchGoogleStatus();
        fetchApiKeyStatus();
    }, []);

    const fetchFields = async () => {
        try {
            setLoading(true);
            const response = await extractionFieldsAPI.getAll();
            setFields(response.fields || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching fields:', err);
            setError('Failed to load extraction fields');
        } finally {
            setLoading(false);
        }
    };

    const handleAddField = () => {
        setEditingField(null);
        setShowModal(true);
    };

    const handleEditField = (field) => {
        setEditingField(field);
        setShowModal(true);
    };

    const handleDeleteField = async (fieldId) => {
        if (!window.confirm('Are you sure you want to delete this field?')) {
            return;
        }

        try {
            await extractionFieldsAPI.delete(fieldId);
            await fetchFields();
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Error deleting field:', err);
            alert('Failed to delete field');
        }
    };

    const handleToggleActive = async (field) => {
        try {
            await extractionFieldsAPI.update(field._id, {
                is_active: !field.is_active
            });
            await fetchFields();
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Error toggling field:', err);
            alert('Failed to update field status');
        }
    };

    const handleSaveField = async (fieldData) => {
        try {
            if (editingField) {
                await extractionFieldsAPI.update(editingField._id, fieldData);
            } else {
                await extractionFieldsAPI.create(fieldData);
            }
            setShowModal(false);
            await fetchFields();
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Error saving field:', err);
            throw err;
        }
    };

    // Google Sheets handlers
    const fetchGoogleStatus = async () => {
        try {
            const status = await googleSheetsAPI.getStatus();
            setGoogleConnected(status.connected || false); // This now means 'is a sheet ID set?'
            setSheetId(status.sheetId || '');
            setSheetUrl(status.sheetUrl);
            // We can also store status.is_authorized if needed for more granular UI
        } catch (err) {
            console.error('Error fetching Google status:', err);
        }
    };

    // API Key handlers
    const fetchApiKeyStatus = async () => {
        try {
            const status = await apiKeyAPI.getStatus();
            setHasApiKey(status.hasApiKey || false);
            setMaskedKey(status.maskedKey || null);
        } catch (err) {
            console.error('Error fetching API key status:', err);
        }
    };

    const handleSaveApiKey = async () => {
        if (!apiKeyInput.trim()) {
            alert('Please enter your OpenAI API key');
            return;
        }

        try {
            setSavingApiKey(true);
            await apiKeyAPI.save(apiKeyInput.trim());
            setApiKeyInput('');
            setShowApiKeyInput(false);
            await fetchApiKeyStatus();
            alert('API key saved successfully!');
        } catch (err) {
            console.error('Error saving API key:', err);
            alert(err.response?.data?.error || 'Failed to save API key');
        } finally {
            setSavingApiKey(false);
        }
    };

    const handleDeleteApiKey = async () => {
        if (!window.confirm('Remove your OpenAI API key? AI data extraction will stop working.')) {
            return;
        }

        try {
            await apiKeyAPI.delete();
            setHasApiKey(false);
            setMaskedKey(null);
            setShowApiKeyInput(false);
        } catch (err) {
            console.error('Error removing API key:', err);
            alert('Failed to remove API key');
        }
    };

    const handleConnectGoogle = async () => {
        if (!sheetId.trim()) {
            alert('Please enter your Google Sheet ID');
            return;
        }

        try {
            setConnectingGoogle(true);

            // First, save the Sheet ID and validate access
            try {
                await googleSheetsAPI.saveSheetId(sheetId);
            } catch (error) {
                if (error.response?.data?.needsAuth) {
                    // Need OAuth - open auth window
                    const { authUrl } = await googleSheetsAPI.getAuthUrl();
                    window.location.href = authUrl;
                    return;
                }
                throw error;
            }

            // If we get here, Sheet ID is saved
            alert('✅ Google Sheets connected successfully!');
            await fetchGoogleStatus();
        } catch (err) {
            console.error('Error connecting Google:', err);
            alert(err.response?.data?.error || 'Failed to connect Google Sheets');
        } finally {
            setConnectingGoogle(false);
        }
    };

    const handleDisconnect = async () => {
        if (!window.confirm('Disconnect Google Sheets? Data will no longer be sent to your sheet.')) {
            return;
        }

        try {
            await googleSheetsAPI.disconnect();
            setGoogleConnected(false);
            setSheetId('');
            setSheetUrl(null);
            alert('Google Sheet disconnected (Google account remains connected)');
        } catch (err) {
            console.error('Error disconnecting:', err);
            alert('Failed to disconnect');
        }
    };

    // Handle OAuth callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const googleAuth = params.get('google_auth');

        if (googleAuth === 'success') {
            alert('✅ Google account connected! Now enter your Sheet ID.');
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchGoogleStatus();
        } else if (googleAuth === 'error') {
            alert('❌ Failed to connect Google account. Please try again.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    if (loading) {
        return (
            <div className="extraction-fields-container">
                <div className="loading-state">
                    <div className="loader"></div>
                    <p>Loading extraction fields...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="extraction-fields-container">
            <div className="fields-header">
                <div className="header-content">
                    <h1>🤖 AI Data Extraction</h1>
                    <p className="subtitle">
                        Define custom fields and let AI extract data from your call transcripts
                    </p>
                </div>
                <button className="btn-add-field" onClick={handleAddField}>
                    <span className="icon">+</span>
                    Add Field
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {/* OpenAI API Key Settings */}
            <div className="api-key-settings">
                <h2>🔑 OpenAI API Key</h2>
                <p className="settings-subtitle">
                    Add your OpenAI API key to enable AI-powered data extraction from call transcripts
                </p>

                {!hasApiKey ? (
                    <div className="connection-form">
                        <div className="form-group">
                            <label htmlFor="apiKey">OpenAI API Key</label>
                            <input
                                id="apiKey"
                                type="password"
                                placeholder="sk-proj-..."
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                className="sheet-id-input"
                            />
                            <span className="help-text">
                                Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a>
                            </span>
                        </div>
                        <button
                            className="btn-connect"
                            onClick={handleSaveApiKey}
                            disabled={savingApiKey || !apiKeyInput.trim()}
                        >
                            {savingApiKey ? 'Saving...' : 'Save API Key'}
                        </button>
                    </div>
                ) : (
                    <div className="connected-status">
                        <div className="status-badge success">
                            Connected
                        </div>
                        <div className="sheet-info">
                            <p><strong>API Key:</strong> {maskedKey}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {showApiKeyInput ? (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="password"
                                        placeholder="sk-proj-..."
                                        value={apiKeyInput}
                                        onChange={(e) => setApiKeyInput(e.target.value)}
                                        className="sheet-id-input"
                                        style={{ width: '300px' }}
                                    />
                                    <button
                                        className="btn-connect"
                                        onClick={handleSaveApiKey}
                                        disabled={savingApiKey || !apiKeyInput.trim()}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {savingApiKey ? 'Saving...' : 'Update'}
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => { setShowApiKeyInput(false); setApiKeyInput(''); }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="btn-secondary"
                                    onClick={() => setShowApiKeyInput(true)}
                                >
                                    Change Key
                                </button>
                            )}
                            <button
                                className="btn-disconnect"
                                onClick={handleDeleteApiKey}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Google Sheets Settings */}
            <div className="google-sheets-settings">
                <h2>📊 Google Sheets Connection</h2>
                <p className="settings-subtitle">
                    Connect your Google Sheet to automatically save extracted data
                </p>

                {!googleConnected ? (
                    <div className="connection-form">
                        <div className="form-group">
                            <label htmlFor="sheetId">Google Sheet ID</label>
                            <input
                                id="sheetId"
                                type="text"
                                placeholder="Enter your Sheet ID (found in the URL)"
                                value={sheetId}
                                onChange={(e) => setSheetId(e.target.value)}
                                className="sheet-id-input"
                            />
                            <span className="help-text">
                                Find it in your Sheet URL: docs.google.com/spreadsheets/d/<strong>SHEET_ID</strong>/edit
                            </span>
                        </div>
                        <button
                            className="btn-connect"
                            onClick={handleConnectGoogle}
                            disabled={connectingGoogle || !sheetId.trim()}
                        >
                            {connectingGoogle ? '🔄 Connecting...' : '🔗 Connect Google Sheets'}
                        </button>
                    </div>
                ) : (
                    <div className="connected-status">
                        <div className="status-badge success">
                            ✅ Connected
                        </div>
                        <div className="sheet-info">
                            <p><strong>Sheet ID:</strong> {sheetId}</p>
                            <a
                                href={sheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="view-sheet-link"
                            >
                                📄 View Sheet
                            </a>
                        </div>
                        <button
                            className="btn-disconnect"
                            onClick={handleDisconnect}
                        >
                            🔌 Disconnect
                        </button>
                    </div>
                )}

                {googleConnected && (
                    <div className="sync-actions" style={{ marginTop: '15px' }}>
                        <button
                            className="btn-secondary"
                            onClick={async () => {
                                if (!window.confirm('This will overwrite the first row of your sheet with headers. Continue?')) return;
                                try {
                                    setLoading(true);
                                    await extractionFieldsAPI.syncHeaders();
                                    alert('✅ Headers synced successfully!');
                                } catch (err) {
                                    console.error('Error syncing headers:', err);
                                    alert('Failed to sync headers');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f0f0f0',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <span>🔄</span> Sync Headers to Sheet
                        </button>
                    </div>
                )}
            </div>

            {fields.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h2>No extraction fields yet</h2>
                    <p>Create your first field to start extracting custom data from call transcripts</p>
                    <button className="btn-primary" onClick={handleAddField}>
                        Create First Field
                    </button>
                </div>
            ) : (
                <div className="fields-grid">
                    {fields.map((field) => (
                        <div
                            key={field._id}
                            className={`field-card ${!field.is_active ? 'inactive' : ''}`}
                        >
                            <div className="field-header">
                                <div className="field-name">
                                    <span className="field-icon">🏷️</span>
                                    {field.field_name}
                                </div>
                                <div className="field-status">
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={field.is_active}
                                            onChange={() => handleToggleActive(field)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                    <span className="status-label">
                                        {field.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <p className="field-description">{field.description}</p>

                            <div className="field-actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => handleEditField(field)}
                                >
                                    <span className="icon">✏️</span>
                                    Edit
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDeleteField(field._id)}
                                >
                                    <span className="icon">🗑️</span>
                                    Delete
                                </button>
                            </div>

                            <div className="field-footer">
                                <span className="order-badge">Order: {field.order + 1}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="info-box">
                <h3>💡 How it works</h3>
                <ol>
                    <li>Create custom fields with clear extraction instructions</li>
                    <li>AI analyzes each call transcript based on your field descriptions</li>
                    <li>Extracted data is automatically saved to your Google Sheet</li>
                    <li>If data isn't found in the transcript, "Not Found" is recorded</li>
                </ol>
            </div>

            {showModal && (
                <FieldFormModal
                    field={editingField}
                    onSave={handleSaveField}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default ExtractionFields;
