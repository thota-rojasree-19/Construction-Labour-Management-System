import React, { useState } from 'react';

export default function AnalyticsShowcase() {
    const [activeTab, setActiveTab] = useState('attendance');

    return (
        <section className="analytics-showcase">
            <div className="landing-container">
                <div className="section-header">
                    <span class="section-tag">System Analytics</span>
                    <h2 class="section-title">Deep Operational Intelligence</h2>
                    <p class="section-desc">Generate automatic visual projections of your expenditures, labour ratios, and site milestones.</p>
                </div>

                <div className="tab-buttons">
                    <button 
                        className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attendance')}
                    >
                        Attendance Trends
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('expenses')}
                    >
                        Expense Budgets
                    </button>
                </div>

                {activeTab === 'attendance' && (
                    <div className="tab-content active">
                        <div style={{ backgroundColor: 'var(--bg-light)', borderRadius: 'var(--radius-md)', padding: '40px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Attendance trends by project</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>Track peak attendance weeks to anticipate project bottlenecks and optimize workforce deployment strategies.</p>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', listStyle: 'none' }}>
                                    <li>✅ Compare average attendance rates across up to 10 active sites.</li>
                                    <li>✅ Highlight days with abnormally high absenteeism or overtime counts.</li>
                                </ul>
                            </div>
                            <div>
                                <svg viewBox="0 0 300 150" className="chart-svg">
                                    <line x1="20" y1="130" x2="280" y2="130" stroke="#CBD5E1" strokeWidth="2"/>
                                    <rect x="40" y="50" width="24" height="80" rx="3" fill="#F97316" />
                                    <rect x="90" y="30" width="24" height="100" rx="3" fill="#2563EB" />
                                    <rect x="140" y="70" width="24" height="60" rx="3" fill="#16A34A" />
                                    <rect x="190" y="45" width="24" height="85" rx="3" fill="#334155" />
                                    <rect x="240" y="20" width="24" height="110" rx="3" fill="#EA580C" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="tab-content active">
                        <div style={{ backgroundColor: 'var(--bg-light)', borderRadius: 'var(--radius-md)', padding: '40px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Real-time site expenditure charts</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>Examine how material orders, fuel invoices, and machinery rental costs align against allocated budgets.</p>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', listStyle: 'none' }}>
                                    <li>✅ Monitor expense spikes instantly as slips are uploaded on-site.</li>
                                    <li>✅ Filter expense lists dynamically by category and project.</li>
                                </ul>
                            </div>
                            <div>
                                <svg viewBox="0 0 150 150" style={{ maxHeight: '150px', display: 'block', margin: '0 auto' }}>
                                    <circle cx="75" cy="75" r="50" fill="transparent" stroke="#2563EB" strokeWidth="30" strokeDasharray="100 314" />
                                    <circle cx="75" cy="75" r="50" fill="transparent" stroke="#F97316" strokeWidth="30" strokeDasharray="150 314" strokeDashoffset="-100" />
                                    <circle cx="75" cy="75" r="50" fill="transparent" stroke="#16A34A" strokeWidth="30" strokeDasharray="64 314" strokeDashoffset="-250" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
