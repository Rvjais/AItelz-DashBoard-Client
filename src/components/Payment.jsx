import React from 'react';
import { CreditCard, ArrowLeft, ArrowRight, Zap, Users, Building2, Wrench, Rocket } from 'lucide-react';
import './Payment.css';

const Payment = ({ onBack }) => {
    const subscriptionPlans = [
        {
            id: 'large-scale',
            name: 'Large Scale',
            description: 'Monthly subscription plan for large-scale operations',
            icon: Building2,
            url: 'https://payments.pabbly.com/subscribe/695228e7ad6f0fcae8b04068/monthly-subscription-plan-large-scale',
            color: 'purple'
        },
        {
            id: 'medium-scale',
            name: 'Medium Scale',
            description: 'Monthly subscription plan for medium-scale operations',
            icon: Users,
            url: 'https://payments.pabbly.com/subscribe/69522029585599caffb332b7/monthly-subscription-plan-medium-scale',
            color: 'blue'
        },
        {
            id: 'small-scale',
            name: 'Small Scale',
            description: 'Monthly subscription plan for small-scale operations',
            icon: Zap,
            url: 'https://payments.pabbly.com/subscribe/69521f35ad6f0fcae8b03bda/monthly-subscription-plan-small-scale',
            color: 'green'
        },
        {
            id: 'maintenance',
            name: 'Custom Dashboard Maintenance',
            description: 'Maintenance and support for custom dashboard',
            icon: Wrench,
            url: 'https://payments.pabbly.com/subscribe/69521dbaad6f0fcae8b03b1e/custom-dashboard-maintenance',
            color: 'orange'
        },
        {
            id: 'pilot',
            name: '1 Week Live Pilot',
            description: 'Try our service with a 1-week live pilot program',
            icon: Rocket,
            url: 'https://payments.pabbly.com/subscribe/69521cf1585599caffb33139/1-week-live-pilot',
            color: 'pink'
        }
    ];

    const handlePlanClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="payment-container">
            <div className="payment-wrapper">
                <div className="payment-header">
                    <button onClick={onBack} className="back-button">
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <div className="payment-title-section">
                        <CreditCard size={32} className="payment-icon" />
                        <div>
                            <h1>Choose Your Plan</h1>
                            <p>Select a subscription plan that fits your needs</p>
                        </div>
                    </div>
                </div>

                <div className="plans-grid">
                    {subscriptionPlans.map((plan) => {
                        const IconComponent = plan.icon;
                        return (
                            <div
                                key={plan.id}
                                className={`plan-card glass-card plan-card-${plan.color}`}
                                onClick={() => handlePlanClick(plan.url)}
                            >
                                <div className="plan-icon">
                                    <IconComponent size={32} />
                                </div>
                                <h3 className="plan-name">{plan.name}</h3>
                                <p className="plan-description">{plan.description}</p>
                                <button className="plan-button">
                                    Subscribe Now
                                    <ArrowRight size={16} className="arrow-right" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Payment;

