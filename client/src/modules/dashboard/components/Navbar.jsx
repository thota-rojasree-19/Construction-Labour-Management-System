import React, { useState, useEffect } from 'react';
import { FaBars, FaSearch, FaBell, FaSun, FaMoon, FaCalendarAlt } from 'react-icons/fa';

export default function Navbar({ onToggleSidebar, onToggleMobile, activePage }) {
    const [user, setUser] = useState({ fullName: 'Administrator', role: 'Company Admin' });
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        // Read user details from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // Keep default placeholder if parsing fails
            }
        }

        // Format active date
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        setCurrentTime(new Date().toLocaleDateString('en-US', options));
    }, []);

    return (
        <header className="db-navbar">
            <div className="db-navbar-left">
                {/* Desktop Toggle Button */}
                <button 
                    className="sidebar-toggle-btn d-none d-md-inline-flex" 
                    onClick={onToggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    <FaBars />
                </button>
                {/* Mobile Toggle Button */}
                <button 
                    className="sidebar-toggle-btn d-md-none" 
                    onClick={onToggleMobile}
                    aria-label="Open Mobile Menu"
                >
                    <FaBars />
                </button>

                <div className="db-search-box">
                    <FaSearch style={{ color: '#64748B' }} />
                    <input type="text" placeholder="Search projects, sites, labor..." />
                </div>
            </div>

            <div className="db-navbar-right">
                <div className="navbar-date d-none d-sm-flex">
                    <FaCalendarAlt style={{ color: '#F97316' }} />
                    <span>{currentTime}</span>
                </div>

                <div className="nav-icon-badge">
                    <FaBell />
                    <span className="nav-badge"></span>
                </div>

                <div className="navbar-profile-avatar">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=F97316&color=fff&bold=true`} 
                        alt="Profile Avatar" 
                    />
                    <div className="navbar-user-info d-none d-lg-flex">
                        <span className="navbar-user-name">{user.fullName}</span>
                        <span className="navbar-user-role">{user.role}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
