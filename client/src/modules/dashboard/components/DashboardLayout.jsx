import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ children, activePage, onPageChange }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="db-container">
            <Sidebar 
                collapsed={collapsed} 
                activePage={activePage} 
                onPageChange={onPageChange}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />
            <div className={`db-main ${collapsed ? 'collapsed-sidebar' : ''}`}>
                <Navbar 
                    onToggleSidebar={() => setCollapsed(!collapsed)}
                    onToggleMobile={() => setMobileOpen(!mobileOpen)}
                    activePage={activePage}
                />
                <main className="db-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
