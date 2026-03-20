(function () {
    // AItelz Embeddable Web Widget
    const scriptTag = document.currentScript;
    const widgetId = scriptTag.getAttribute('data-widget-id');

    // Always use production API for the widget unless explicitly testing locally
    const API_BASE_URL = 'https://api.aitelz.com';

    if (!widgetId) {
        console.error('AItelz Widget Error: No data-widget-id provided in script tag.');
        return;
    }

    let config = {
        theme_color: '#f97316',
        text_color: '#ffffff',
        bg_color: '#ffffff',
        button_text: 'Get a Call',
        modal_title: 'Request an Instant Call',
        modal_subtitle: 'Enter your phone number below and our AI agent will call you immediately.',
        success_message: 'Thank you! Our AI agent will call you shortly.',
        position: 'bottom-right',
        border_radius: 10
    };

    // 1. Fetch Configuration from Backend
    fetch(`${API_BASE_URL}/api/public/widget/config/${widgetId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.config) {
                config = { ...config, ...data.config };
                initWidget();
            } else {
                console.error('AItelz Widget Error:', data.error);
            }
        })
        .catch(err => console.error('AItelz Widget Error handling config:', err));

    // 2. Initialize UI
    function initWidget() {
        // Inject CSS
        const style = document.createElement('style');
        const pos = config.position || 'bottom-right';
        const isLeft = pos === 'bottom-left';

        style.textContent = `
            #aitelz-widget-btn {
                position: fixed;
                bottom: 24px;
                ${isLeft ? 'left: 24px;' : 'right: 24px;'}
                background-color: ${config.theme_color};
                color: ${config.text_color || '#ffffff'};
                border: none;
                border-radius: ${config.border_radius || 10}px;
                padding: 12px 24px;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 999998;
                transition: transform 0.2s, box-shadow 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            #aitelz-widget-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0,0,0,0.2);
            }
            #aitelz-widget-modal {
                display: none;
                position: fixed;
                bottom: 80px;
                ${isLeft ? 'left: 24px;' : 'right: 24px;'}
                width: 320px;
                background: ${config.bg_color || '#ffffff'};
                border-radius: ${config.border_radius || 10}px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 999999;
                font-family: system-ui, -apple-system, sans-serif;
                overflow: hidden;
                animation: slideUp 0.3s ease-out;
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .aitelz-modal-header {
                background-color: ${config.theme_color};
                color: ${config.text_color || '#ffffff'};
                padding: 16px 20px;
                position: relative;
            }
            .aitelz-modal-header h3 {
                margin: 0;
                font-size: 18px;
            }
            .aitelz-close-btn {
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                color: ${config.text_color || '#ffffff'};
                font-size: 20px;
                cursor: pointer;
                opacity: 0.8;
                line-height: 1;
            }
            .aitelz-close-btn:hover { opacity: 1; }
            .aitelz-modal-body {
                padding: 20px;
            }
            .aitelz-modal-body p {
                margin: 0 0 16px 0;
                color: #4b5563;
                font-size: 14px;
                line-height: 1.5;
            }
            .aitelz-input-group {
                display: flex;
                margin-bottom: 16px;
            }
            .aitelz-prefix {
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                border-right: none;
                padding: 10px 12px;
                border-radius: 6px 0 0 6px;
                color: #4b5563;
                font-weight: 500;
            }
            #aitelz-phone-input {
                flex: 1;
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 0 6px 6px 0;
                font-size: 14px;
                outline: none;
            }
            #aitelz-phone-input:focus {
                border-color: ${config.theme_color};
            }
            #aitelz-submit-btn {
                width: 100%;
                background-color: ${config.theme_color};
                color: ${config.text_color || '#ffffff'};
                border: none;
                padding: 12px;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s;
            }
            #aitelz-submit-btn:hover { opacity: 0.9; }
            #aitelz-submit-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .aitelz-message {
                margin-top: 12px;
                font-size: 13px;
                text-align: center;
                display: none;
            }
            .aitelz-success { color: #10b981; }
            .aitelz-error { color: #ef4444; }
            .aitelz-branding {
                text-align: center;
                padding: 10px;
                font-size: 11px;
                color: #9ca3af;
                background: #f9fafb;
                border-top: 1px solid #f3f4f6;
            }
            .aitelz-branding a {
                color: ${config.theme_color};
                text-decoration: none;
                font-weight: 600;
            }
             @media (max-width: 480px) {
                #aitelz-widget-modal {
                    width: calc(100% - 32px);
                    left: 16px;
                    right: 16px;
                    bottom: 80px;
                }
            }
        `;
        document.head.appendChild(style);

        // Inject Button
        const btn = document.createElement('button');
        btn.id = 'aitelz-widget-btn';
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            ${config.button_text}
        `;
        document.body.appendChild(btn);

        // Inject Modal
        const modal = document.createElement('div');
        modal.id = 'aitelz-widget-modal';
        modal.innerHTML = `
            <div class="aitelz-modal-header">
                <h3>${config.modal_title}</h3>
                <button class="aitelz-close-btn">&times;</button>
            </div>
            <div class="aitelz-modal-body">
                <p>${config.modal_subtitle}</p>
                <form id="aitelz-widget-form">
                    <div class="aitelz-input-group">
                        <span class="aitelz-prefix">+91</span>
                        <input type="tel" id="aitelz-phone-input" placeholder="Phone Number" required pattern="[0-9]{10}">
                    </div>
                    <button type="submit" id="aitelz-submit-btn">Call Me Now</button>
                </form>
                <div id="aitelz-msg" class="aitelz-message"></div>
            </div>
            <div class="aitelz-branding">
                Powered by <a href="https://aitelz.com" target="_blank">AItelz</a>
            </div>
        `;
        document.body.appendChild(modal);

        // Event Listeners
        const closeBtn = modal.querySelector('.aitelz-close-btn');
        const form = document.getElementById('aitelz-widget-form');
        const submitBtn = document.getElementById('aitelz-submit-btn');
        const msgDiv = document.getElementById('aitelz-msg');
        const phoneInput = document.getElementById('aitelz-phone-input');

        let isOpen = false;

        btn.addEventListener('click', () => {
            isOpen = !isOpen;
            modal.style.display = isOpen ? 'block' : 'none';
        });

        closeBtn.addEventListener('click', () => {
            isOpen = false;
            modal.style.display = 'none';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const phoneStr = phoneInput.value.trim();

            if (!phoneStr || phoneStr.length < 10) return;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Calling...';
            msgDiv.style.display = 'none';
            msgDiv.className = 'aitelz-message';

            const fullPhone = '+91' + phoneStr;

            fetch(`${API_BASE_URL}/api/public/widget/request-call`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    widget_id: widgetId,
                    phone_number: fullPhone
                })
            })
                .then(res => res.json())
                .then(data => {
                    msgDiv.style.display = 'block';
                    if (data.success) {
                        msgDiv.textContent = config.success_message || 'Call initiated! Please answer your phone.';
                        msgDiv.className = 'aitelz-message aitelz-success';
                        form.reset();
                        setTimeout(() => {
                            isOpen = false;
                            modal.style.display = 'none';
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Call Me Now';
                            msgDiv.style.display = 'none';
                        }, 5000);
                    } else {
                        throw new Error(data.error || 'Failed to initiate call');
                    }
                })
                .catch(err => {
                    msgDiv.style.display = 'block';
                    msgDiv.textContent = err.message || 'Error occurred. Please try again.';
                    msgDiv.className = 'aitelz-message aitelz-error';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Call Me Now';
                });
        });
    }

})();
