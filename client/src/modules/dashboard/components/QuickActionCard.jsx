import React from 'react';

export default function QuickActionCard({ label, icon, onClick }) {
    return (
        <button 
            type="button" 
            className="quick-action-card" 
            onClick={onClick}
            style={{ width: '100%', border: '1px solid var(--border-color)', outline: 'none' }}
        >
            <div className="quick-action-icon">
                {icon}
            </div>
            <span className="quick-action-label">{label}</span>
        </button>
    );
}
