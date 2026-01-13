import React, { useState } from 'react';
import { X } from 'lucide-react';
import { agentsAPI } from '../services/api';
import './AddAgentModal.css';

const AddAgentModal = ({ onClose, onAgentAdded }) => {
    const [formData, setFormData] = useState({
        bolna_agent_id: '',
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.bolna_agent_id.trim()) {
            setError('AItelz Agent ID is required');
            return;
        }
        if (!formData.name.trim()) {
            setError('Agent Name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await agentsAPI.create(formData);
            setSuccess(true);

            // Wait a bit to show success message
            setTimeout(() => {
                onAgentAdded();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add agent. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Voice Agent</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {success ? (
                    <div className="success-screen">
                        <div className="success-icon">✓</div>
                        <h3>Agent Added Successfully!</h3>
                        <p>Your voice agent has been added to your dashboard.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="agent-form">
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="bolna_agent_id">
                                AItelz Agent ID <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="bolna_agent_id"
                                name="bolna_agent_id"
                                value={formData.bolna_agent_id}
                                onChange={handleChange}
                                placeholder="e.g., agent-abc123"
                                disabled={loading}
                                autoFocus
                            />
                            <small className="field-hint">
                                Get this from your AItelz dashboard
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">
                                Agent Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Customer Support Bot"
                                disabled={loading}
                            />
                            <small className="field-hint">
                                A friendly name for your agent
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Description <span className="optional">(optional)</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="e.g., Handles customer inquiries and support tickets"
                                rows="3"
                                disabled={loading}
                            />
                            <small className="field-hint">
                                What does this agent do?
                            </small>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Adding Agent...' : 'Add Agent'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddAgentModal;
