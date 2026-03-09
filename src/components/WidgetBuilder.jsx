import React, { useState, useEffect } from 'react';
import { Settings, Code, Trash2, Smartphone, Save, Copy, CheckCircle2 } from 'lucide-react';
import { widgetsAPI } from '../services/api';
import './WidgetBuilder.css';

const WidgetBuilder = ({ agents }) => {
    const [widgets, setWidgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeWidget, setActiveWidget] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        fetchWidgets();
    }, []);

    const fetchWidgets = async () => {
        try {
            setLoading(true);
            const response = await widgetsAPI.getAll();
            const fetchedWidgets = response.widgets || [];
            setWidgets(fetchedWidgets);

            // If they have a widget, select the first one.
            if (fetchedWidgets.length > 0) {
                setActiveWidget(fetchedWidgets[0]);
            } else {
                handleCreateNew();
            }
        } catch (error) {
            console.error('Failed to fetch widgets', error);
            handleCreateNew(); // Fallback to new widget if fetch fails
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setActiveWidget({
            _id: 'new',
            name: 'My Website Widget',
            agent_id: agents.length > 0 ? agents[0]._id : '',
            theme_color: '#f97316',
            text_color: '#ffffff',
            bg_color: '#ffffff',
            button_text: 'Get a Call',
            modal_title: 'Request an Instant Call',
            modal_subtitle: 'Enter your phone number below and our AI agent will call you immediately.',
            success_message: 'Thank you! Our AI agent will call you shortly.',
            position: 'bottom-right',
            border_radius: 10,
            allowed_domains: []
        });
    };

    const handleSave = async () => {
        try {
            if (!activeWidget.agent_id) {
                alert('Please select an AI Agent for this widget.');
                return;
            }

            const payload = {
                ...activeWidget,
                // Clean up domains array
                allowed_domains: (typeof activeWidget.allowed_domains === 'string'
                    ? activeWidget.allowed_domains.split(',').map(d => d.trim()).filter(Boolean)
                    : activeWidget.allowed_domains)
            };

            if (activeWidget._id === 'new') {
                delete payload._id;
                await widgetsAPI.create(payload);
            } else {
                await widgetsAPI.update(activeWidget._id, payload);
            }
            alert('Widget saved successfully!');
            fetchWidgets(); // Refresh list to get real ID if it was new
        } catch (error) {
            console.error('Failed to save widget', error);
            alert('Failed to save widget.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this widget? This will break it on any website where it is embedded.')) return;
        try {
            await widgetsAPI.delete(id);
            fetchWidgets();
        } catch (error) {
            alert('Failed to delete widget');
        }
    };

    const handleCopyEmbed = () => {
        if (activeWidget._id === 'new') {
            alert('Please save the widget first to generate embed code.');
            return;
        }

        // Base URL for the script. Assuming dashboard and API might be on same domain or we fall back to API.
        const scriptUrl = window.location.origin.includes('localhost')
            ? 'http://localhost:5173/widget.js'
            : 'https://in.aitelz.com/widget.js'; // Fallback to production frontend domain

        const code = `<script src="${scriptUrl}" data-widget-id="${activeWidget._id}" async></script>`;
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleChange = (field, value) => {
        setActiveWidget(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return <div className="widget-loading"><div className="loading-spinner"></div></div>;
    }

    if (!activeWidget && !loading) {
        return (
            <div className="widget-error-state">
                <h3>Unable to load widget editor</h3>
                <button onClick={handleCreateNew} className="save-widget-btn">Create New Widget</button>
            </div>
        );
    }

    if (!activeWidget) return null;

    return (
        <div className="widget-builder-container">
            {/* LEFT PANEL : Editor settings */}
            <div className="widget-editor">
                <div className="editor-header">
                    <h2><Settings size={20} /> Widget Builder</h2>
                    {widgets.length > 0 && activeWidget._id !== 'new' && (
                        <button className="delete-btn outline" onClick={() => handleDelete(activeWidget._id)} title="Delete Widget">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                <div className="editor-form">
                    <div className="form-group">
                        <label>Internal Name</label>
                        <input
                            type="text"
                            value={activeWidget.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="e.g. Homepage Lead Gen"
                        />
                    </div>

                    <div className="form-group">
                        <label>AI Agent to Handle Calls</label>
                        <select
                            value={activeWidget.agent_id}
                            onChange={(e) => handleChange('agent_id', e.target.value)}
                        >
                            <option value="">-- Select an Agent --</option>
                            {agents.map(agent => (
                                <option key={agent._id} value={agent._id}>{agent.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group color-picker-group">
                        <label>Theme Color (Accent)</label>
                        <div className="color-inputs">
                            <input
                                type="color"
                                value={activeWidget.theme_color || '#f97316'}
                                onChange={(e) => handleChange('theme_color', e.target.value)}
                            />
                            <input
                                type="text"
                                value={activeWidget.theme_color || '#f97316'}
                                onChange={(e) => handleChange('theme_color', e.target.value)}
                                className="hex-input"
                            />
                        </div>
                    </div>

                    <div className="form-group color-picker-group">
                        <label>Button Text Color</label>
                        <div className="color-inputs">
                            <input
                                type="color"
                                value={activeWidget.text_color || '#ffffff'}
                                onChange={(e) => handleChange('text_color', e.target.value)}
                            />
                            <input
                                type="text"
                                value={activeWidget.text_color || '#ffffff'}
                                onChange={(e) => handleChange('text_color', e.target.value)}
                                className="hex-input"
                            />
                        </div>
                    </div>

                    <div className="form-group color-picker-group">
                        <label>Modal Background Color</label>
                        <div className="color-inputs">
                            <input
                                type="color"
                                value={activeWidget.bg_color || '#ffffff'}
                                onChange={(e) => handleChange('bg_color', e.target.value)}
                            />
                            <input
                                type="text"
                                value={activeWidget.bg_color || '#ffffff'}
                                onChange={(e) => handleChange('bg_color', e.target.value)}
                                className="hex-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Widget Position</label>
                        <select
                            value={activeWidget.position || 'bottom-right'}
                            onChange={(e) => handleChange('position', e.target.value)}
                        >
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Border Radius (px): {activeWidget.border_radius || 10}</label>
                        <input
                            type="range"
                            min="0"
                            max="30"
                            value={activeWidget.border_radius || 10}
                            onChange={(e) => handleChange('border_radius', parseInt(e.target.value))}
                        />
                    </div>

                    <div className="form-group">
                        <label>Floating Button Text</label>
                        <input
                            type="text"
                            value={activeWidget.button_text}
                            onChange={(e) => handleChange('button_text', e.target.value)}
                            maxLength={30}
                        />
                    </div>

                    <div className="form-group">
                        <label>Popup Title</label>
                        <input
                            type="text"
                            value={activeWidget.modal_title}
                            onChange={(e) => handleChange('modal_title', e.target.value)}
                            maxLength={50}
                        />
                    </div>

                    <div className="form-group">
                        <label>Popup Subtitle</label>
                        <textarea
                            value={activeWidget.modal_subtitle}
                            onChange={(e) => handleChange('modal_subtitle', e.target.value)}
                            rows={2}
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label>Success Message</label>
                        <textarea
                            value={activeWidget.success_message || 'Thank you! Our AI agent will call you shortly.'}
                            onChange={(e) => handleChange('success_message', e.target.value)}
                            rows={2}
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group security-group">
                        <label>Allowed Domains (Security)</label>
                        <p className="help-text">Comma-separated list of domains allowed to request calls. (e.g. example.com, mysite.org). Leave blank to allow all during testing.</p>
                        <input
                            type="text"
                            value={Array.isArray(activeWidget.allowed_domains) ? activeWidget.allowed_domains.join(', ') : activeWidget.allowed_domains}
                            onChange={(e) => handleChange('allowed_domains', e.target.value)}
                            placeholder="example.com, mywebsite.com"
                        />
                    </div>

                    <button className="save-widget-btn" onClick={handleSave}>
                        <Save size={18} /> Save Widget Configuration
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL : Live Preview & Embed Code */}
            <div className="widget-preview-section">

                {/* Embed Code Panel */}
                <div className="embed-code-panel">
                    <h3><Code size={18} /> Embed Code</h3>
                    <p>Paste this strictly before the closing <code>&lt;/body&gt;</code> tag on your website.</p>

                    <div className="code-block">
                        {activeWidget._id === 'new' ? (
                            <span className="code-warning">Save your widget first to generate code.</span>
                        ) : (
                            <code>
                                &lt;script src="{window.location.origin.includes('localhost') ? 'http://localhost:5173' : 'https://in.aitelz.com'}/widget.js" data-widget-id="{activeWidget._id}" async&gt;&lt;/script&gt;
                            </code>
                        )}
                        <button
                            className={`copy-btn ${isCopied ? 'copied' : ''}`}
                            onClick={handleCopyEmbed}
                            title="Copy to clipboard"
                        >
                            {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                {/* Live Visual Preview */}
                <div className="preview-container">
                    <div className="preview-header">
                        <h3><Smartphone size={18} /> Live Preview</h3>
                        <span className="live-badge">Live</span>
                    </div>

                    <div className="mock-browser">
                        <div className="mock-browser-top">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <div className="mock-url-bar">yoursite.com</div>
                        </div>

                        <div className="mock-website-content">
                            {/* Mock Widget Modal */}
                            <div
                                className={`mock-widget-modal ${activeWidget.position || 'bottom-right'}`}
                                style={{
                                    borderTop: `4px solid ${activeWidget.theme_color}`,
                                    backgroundColor: activeWidget.bg_color || '#ffffff',
                                    borderRadius: `${activeWidget.border_radius || 10}px`
                                }}
                            >
                                <div className="mock-modal-header" style={{ backgroundColor: activeWidget.theme_color, color: activeWidget.text_color || '#ffffff' }}>
                                    <h4>{activeWidget.modal_title}</h4>
                                </div>
                                <div className="mock-modal-body">
                                    <p>{activeWidget.modal_subtitle}</p>
                                    <div className="mock-input-group">
                                        <span className="mock-prefix">+91</span>
                                        <div className="mock-input">Phone Number</div>
                                    </div>
                                    <button
                                        className="mock-submit"
                                        style={{
                                            backgroundColor: activeWidget.theme_color,
                                            color: activeWidget.text_color || '#ffffff',
                                            borderRadius: `${(activeWidget.border_radius || 10) / 2}px`
                                        }}
                                    >
                                        Call Me Now
                                    </button>
                                </div>
                                <div className="mock-modal-footer">
                                    Powered by <a href="#" onClick={(e) => e.preventDefault()}>AItelz</a>
                                </div>
                            </div>

                            {/* Mock Floating Button */}
                            <button
                                className={`mock-floating-btn ${activeWidget.position || 'bottom-right'}`}
                                style={{
                                    backgroundColor: activeWidget.theme_color,
                                    color: activeWidget.text_color || '#ffffff',
                                    borderRadius: `${activeWidget.border_radius || 10}px`
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                {activeWidget.button_text}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WidgetBuilder;
