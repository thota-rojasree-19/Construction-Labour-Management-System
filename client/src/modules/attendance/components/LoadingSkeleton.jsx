import React from 'react';

export default function LoadingSkeleton({ rows = 5, cols = 6, table = true }) {
    const rowsArr = Array.from({ length: rows });
    const colsArr = Array.from({ length: cols });

    if (table) {
        return (
            <tbody>
                {rowsArr.map((_, rIdx) => (
                    <tr key={rIdx}>
                        {colsArr.map((_, cIdx) => (
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', width: '100%' }}>
            {rowsArr.map((_, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', gap: '16px', width: '100%' }}>
                    {colsArr.map((_, cIdx) => (
                        <div 
                            key={cIdx}
                            className="skeleton-line" 
                            style={{ 
                                flex: 1,
                                height: '24px', 
                                backgroundColor: '#E2E8F0', 
                                borderRadius: '6px',
                                animation: 'pulse 1.5s infinite ease-in-out'
                            }}
                        ></div>
                    ))}
                </div>
            ))}
        </div>
    );
}
