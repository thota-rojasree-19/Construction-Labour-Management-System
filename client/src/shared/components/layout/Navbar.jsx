import React, { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const checkUserStatus = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('hashchange', checkUserStatus);
        window.addEventListener('storage', checkUserStatus);

        // Initial check
        checkUserStatus();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('hashchange', checkUserStatus);
            window.removeEventListener('storage', checkUserStatus);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('storage'));
        window.location.hash = '#/login';
    };

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="landing-container nav-wrapper">
                <a href="#" className="logo">
                    <span>■</span> ConstroConnect
                </a>
                
                <nav className={`nav-menu ${mobileOpen ? 'active' : ''}`}>
                    <a href="#" className="nav-link" onClick={() => setMobileOpen(false)}>Home</a>
                    <a href="#features" className="nav-link" onClick={() => setMobileOpen(false)}>Features</a>
                    <a href="#dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Solutions</a>
                    <a href="#" className="nav-link" onClick={() => setMobileOpen(false)}>Pricing</a>
                    <a href="#faq" className="nav-link" onClick={() => setMobileOpen(false)}>FAQ</a>
                </nav>

                <div className="nav-actions">
                    {user ? (
                        <>
                            <span className="user-welcome" style={{ marginRight: '16px', fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>
                                Hi, {user.fullName.split(' ')[0]}
                            </span>
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #cbd5e0', cursor: 'pointer' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <a href="#/login" className="btn btn-secondary" style={{ padding: '8px 16px' }}>Login</a>
                            <a href="#/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Try Free</a>
                        </>
                    )}
                </div>

                <button 
                    className={`menu-toggle ${mobileOpen ? 'active' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle Menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </header>
    );
}
