import React, { useState, useEffect } from 'react';

export default function PreviewDashboard() {
    const [checkedInCount, setCheckedInCount] = useState(342);

    useEffect(() => {
        const timer = setInterval(() => {
            if (Math.random() > 0.6) {
                setCheckedInCount(prev => prev + Math.floor(Math.random() * 3) + 1);
            }
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="dashboard-preview" id="dashboard">
            <div className="landing-container">
                <div className="section-header">
                    <span class="section-tag">Interactive Preview</span>
                    <h2 class="section-title">Control Centre for Site Managers</h2>
                    <p class="section-desc">An intuitive interface designed to keep site managers, contractor supervisors, and headquarters in sync.</p>
                </div>

                <div className="dashboard-window">
                    {/* Sidebar */}
                    <div className="preview-sidebar">
                        <div className="preview-sidebar-logo"><span>■</span> ConstroConnect</div>
                        <div className="sidebar-menu-item active"><span>📊</span> Dashboard Overview</div>
                        <div className="sidebar-menu-item"><span>👷</span> Labour Registry</div>
                        <div className="sidebar-menu-item"><span>⏱</span> Attendance Sheet</div>
                        <div className="sidebar-menu-item"><span>💸</span> Payroll Logs</div>
                        <div className="sidebar-menu-item"><span>📈</span> Site Expenses</div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="preview-content">
                        <div className="preview-header">
                            <h2>Dashboard Overview</h2>
                            <div className="user-pill">
                                <div className="user-avatar">SR</div>
                                <span>Sreeraju (Admin)</span>
                            </div>
                        </div>
                        
                        <div className="preview-body">
                            {/* Stat Row */}
                            <div className="metrics-row">
                                <div className="metric-card">
                                    <div className="metric-label">Active Projects</div>
                                    <div className="metric-val">12</div>
                                    <div className="metric-trend">⚡ 2 newly launched</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-label">Labour Checked In</div>
                                    <div className="metric-val">{checkedInCount}</div>
                                    <div className="metric-trend">🟢 94% attendance rate</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-label">Monthly Wages Paid</div>
                                    <div className="metric-val">$48,250</div>
                                    <div className="metric-trend" style={{ color: 'var(--primary)' }}>⏱ Next run in 4 days</div>
                                </div>
                            </div>

                            {/* Graphics Grid */}
                            <div className="preview-charts-grid">
                                <div className="preview-panel">
                                    <div className="preview-panel-title">
                                        <span>Labor Utilization Trend</span>
                                        <span style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 600 }}>Live Feed</span>
                                    </div>
                                    <svg className="chart-svg" viewBox="0 0 400 150" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="chartGradReact" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#F97316" stopOpacity="0.2"/>
                                                <stop offset="100%" stopColor="#F97316" stopOpacity="0.0"/>
                                            </linearGradient>
                                        </defs>
                                        <path d="M 0 120 Q 80 60, 160 90 T 320 40 T 400 30 L 400 150 L 0 150 Z" fill="url(#chartGradReact)"/>
                                        <path d="M 0 120 Q 80 60, 160 90 T 320 40 T 400 30" fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round"/>
                                        <circle cx="160" cy="90" r="4" fill="#F97316"/>
                                        <circle cx="320" cy="40" r="4" fill="#F97316"/>
                                    </svg>
                                </div>
                                <div className="preview-panel">
                                    <div className="preview-panel-title">Active Sites</div>
                                    <ul style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                                        <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>🏗 Metro Station Line A</span>
                                            <strong style={{ color: 'var(--success)' }}>On Schedule</strong>
                                        </li>
                                        <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>🏢 Downtown Plaza</span>
                                            <strong style={{ color: 'var(--primary)' }}>High Overtime</strong>
                                        </li>
                                        <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>🌉 Bridge Expansion B</span>
                                            <strong style={{ color: 'var(--accent)' }}>Waiting Materials</strong>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
