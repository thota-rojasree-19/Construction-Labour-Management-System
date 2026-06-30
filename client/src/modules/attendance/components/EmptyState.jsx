import React from 'react';
import { FaClipboardCheck } from 'react-icons/fa';

export default function EmptyState({ title = 'No Records Found', description = 'There are no attendance records matching your current filter criteria.', actionLabel, onAction }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.6 }}>
                <FaClipboardCheck />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>{title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '20px' }}>{description}</p>
            {actionLabel && onAction && (
                <button className="btn btn-primary" onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
