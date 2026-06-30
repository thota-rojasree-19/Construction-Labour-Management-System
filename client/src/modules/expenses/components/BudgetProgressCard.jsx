import React from 'react';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

export default function BudgetProgressCard({ projectName, budget, spent, remaining, utilizationPercentage, exceedsThreshold }) {
    
    // Choose color of progress bar based on utilization
    const getProgressColor = () => {
        if (utilizationPercentage >= 90) return 'var(--danger)';
        if (utilizationPercentage >= 70) return 'var(--warning)';
        return 'var(--success)';
    };

    return (
        <div className={`budget-util-card ${exceedsThreshold ? 'warning-exceeded' : ''}`}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-main)' }}>
                {projectName}
            </h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Budget Spent: <strong>₹{spent.toLocaleString('en-IN')}</strong></span>
                <span>Limit: <strong>₹{budget.toLocaleString('en-IN')}</strong></span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                <div 
                    style={{ 
                        height: '100%', 
                        width: `${Math.min(100, utilizationPercentage)}%`, 
                        backgroundColor: getProgressColor(),
                        borderRadius: '4px',
                        transition: 'width 0.4s ease-out'
                    }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Remaining: <strong style={{ color: remaining > 0 ? 'var(--text-main)' : 'var(--danger)' }}>₹{remaining.toLocaleString('en-IN')}</strong>
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: getProgressColor() }}>
                    {utilizationPercentage}%
                </span>
            </div>

            {exceedsThreshold ? (
                <div className="budget-warning-alert">
                    <FaExclamationTriangle />
                    <span>Warning: Project budget utilization exceeds safety threshold (90%)!</span>
                </div>
            ) : (
                utilizationPercentage >= 70 && (
                    <div className="budget-warning-alert" style={{ backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)', color: 'var(--warning)' }}>
                        <FaExclamationTriangle />
                        <span>Warning: Project budget utilization is high ({utilizationPercentage}%).</span>
                    </div>
                )
            )}
        </div>
    );
}
