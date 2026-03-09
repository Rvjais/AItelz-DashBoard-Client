import React, { useState } from 'react';
import { X, Briefcase, Database, Phone, MessageSquare, Clock, RotateCcw } from 'lucide-react';
import { campaignsAPI } from '../services/api';

const CreateCampaignModal = ({ agents, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        agent_id: agents.length > 0 ? agents[0]._id : '',
        name: '',
        google_sheet_url: '',
        phone_column_name: '',
        execution_column_name: 'executions',
        retry_interval_minutes: 30,
        max_retries: 3,
        scheduled_at: new Date().toISOString().slice(0, 16), // datetime-local format
        active_hours_start: '09:00',
        active_hours_end: '18:00',
        dial_delay: 5
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('retries') || name.includes('interval') ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Transform flat formData back to nested for API
        const apiData = {
            ...formData,
            active_hours: {
                start: formData.active_hours_start,
                end: formData.active_hours_end
            }
        };

        try {
            await campaignsAPI.create(apiData);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="campaign-modal">
                <div className="modal-header">
                    <h2>Create Outbound Campaign</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="campaign-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>
                            <Briefcase size={16} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--accent-dark)' }} />
                            Campaign Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Sales Followup 2024"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <Phone size={16} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--accent-dark)' }} />
                            Voice Agent *
                        </label>
                        <select
                            name="agent_id"
                            required
                            value={formData.agent_id}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        >
                            {agents.length > 0 ? (
                                agents.map(a => (
                                    <option key={a._id} value={a._id}>{a.name}</option>
                                ))
                            ) : (
                                <option value="" disabled>No agents found. Create one first.</option>
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>
                            <Database size={16} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--accent-dark)' }} />
                            Google Sheet URL *
                        </label>
                        <input
                            type="url"
                            name="google_sheet_url"
                            required
                            value={formData.google_sheet_url}
                            onChange={handleChange}
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                        />
                        <small>Provide a shared editor link so the bot can read/write data.</small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <Phone size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                Phone Column *
                            </label>
                            <input
                                type="text"
                                name="phone_column_name"
                                required
                                value={formData.phone_column_name}
                                onChange={handleChange}
                                placeholder="e.g. Phone"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <MessageSquare size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                Results Column
                            </label>
                            <input
                                type="text"
                                name="execution_column_name"
                                value={formData.execution_column_name}
                                onChange={handleChange}
                                placeholder="Status"
                            />
                        </div>
                    </div>

                    <div className="form-info-box">
                        <Phone size={14} />
                        <div>
                            <strong>Supported Number Formats:</strong>
                            <p>+919988776655, 919988776655, or 9988776655 (India)</p>
                        </div>
                    </div>

                    <div className="form-section-title">Schedule & Timing</div>

                    <div className="form-group">
                        <label>
                            <Clock size={16} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--accent-dark)' }} />
                            Campaign Start Time
                        </label>
                        <input
                            type="datetime-local"
                            name="scheduled_at"
                            value={formData.scheduled_at}
                            onChange={handleChange}
                        />
                        <small>Set a future time or leave as current for immediate start.</small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Bot Active Hours (Start)</label>
                            <input
                                type="time"
                                name="active_hours_start"
                                value={formData.active_hours_start}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Bot Active Hours (End)</label>
                            <input
                                type="time"
                                name="active_hours_end"
                                value={formData.active_hours_end}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                Dialing Interval (sec)
                            </label>
                            <input
                                type="number"
                                name="dial_delay"
                                min="0"
                                max="3600"
                                value={formData.dial_delay}
                                onChange={handleChange}
                                placeholder="Seconds between calls"
                            />
                        </div>
                    </div>

                    <div className="form-section-title">Retry Logic</div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                Retry Interval (mins)
                            </label>
                            <input
                                type="number"
                                name="retry_interval_minutes"
                                min="5"
                                max="1440"
                                value={formData.retry_interval_minutes}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <RotateCcw size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                Max Retries
                            </label>
                            <input
                                type="number"
                                name="max_retries"
                                min="0"
                                max="5"
                                value={formData.max_retries}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="submit-btn" disabled={loading || agents.length === 0}>
                            {loading ? 'Creating...' : 'Launch Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCampaignModal;
