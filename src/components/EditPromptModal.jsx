import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { agentsAPI } from '../services/api';
import './EditPromptModal.css';

const EditPromptModal = ({ agent, onClose }) => {
    const [systemPrompt, setSystemPrompt] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchAgentDetails = async () => {
            try {
                setLoading(true);
                const response = await agentsAPI.getBolnaDetails(agent._id);

                // AItelz structure: agent_prompts.task_1.system_prompt
                const prompt = response.details?.agent_prompts?.task_1?.system_prompt || '';
                setSystemPrompt(prompt);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching agent prompt:', err);
                setError('Failed to load agent configuration from AItelz. Please ensure the Agent ID is correct.');
                setLoading(false);
            }
        };

        if (agent) {
            fetchAgentDetails();
        }
    }, [agent]);

    const handleSave = async () => {
        if (!systemPrompt.trim()) {
            setError('System prompt cannot be empty');
            return;
        }

        try {
            setSaving(true);
            setError('');
            await agentsAPI.updatePrompt(agent._id, systemPrompt);
            setSuccess(true);

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Error saving prompt:', err);
            setError(err.response?.data?.error || 'Failed to update prompt on AItelz. Please try again.');
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content prompt-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-title">
                        <Sparkles size={20} className="header-icon" />
                        <h2>Manage System Prompt</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="agent-mini-info">
                        <span className="agent-label">Agent:</span>
                        <span className="agent-value">{agent.name}</span>
                        <span className="divider">|</span>
                        <span className="agent-label">ID:</span>
                        <span className="agent-value">{agent.bolna_agent_id}</span>
                    </div>

                    {loading ? (
                        <div className="prompt-loading">
                            <Loader2 className="spinning" size={32} />
                            <p>Fetching configuration...</p>
                        </div>
                    ) : success ? (
                        <div className="success-screen">
                            <div className="success-icon">✓</div>
                            <h3>Prompt Updated!</h3>
                            <p>The system prompt has been successfully updated on AItelz.</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="error-banner">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="prompt-editor-container">
                                <label htmlFor="system-prompt">System Prompt</label>
                                <p className="instruction">
                                    Define the personality, rules, and behavior for your AI agent.
                                    This prompt dictates how the agent responds to callers.
                                </p>
                                <textarea
                                    id="system-prompt"
                                    className="prompt-textarea"
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    placeholder="Enter system prompt here..."
                                    disabled={saving}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={onClose}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn-save"
                                    onClick={handleSave}
                                    disabled={saving || !systemPrompt.trim()}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="spinning" size={16} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Update Prompt
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditPromptModal;
