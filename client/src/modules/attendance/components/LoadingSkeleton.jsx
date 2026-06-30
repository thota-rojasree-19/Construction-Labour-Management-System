import React from 'react';

export default function LoadingSkeleton({ rows = 5, cols = 6 }) {
    return (
        <tbody>
            {Array.from({ length: rows }).map((_, rIdx) => (
                <tr key={rIdx}>
                    {Array.from({ length: cols }).map((_, cIdx) => (
                        <td key={cIdx} style={{ padding: '20px 16px' }}>
                            <div 
                                className="skeleton-line" 
                                style={{ 
                                    height: '16px', 
                                    backgroundColor: '#E2E8F0', 
                                    borderRadius: '4px',
                                    animation: 'pulse 1.5s infinite ease-in-out',
                                    width: cIdx === 0 ? '40%' : cIdx === 1 ? '70%' : '50%'
                                }}
                            ></div>
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
}
