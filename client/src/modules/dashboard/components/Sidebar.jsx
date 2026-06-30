import React from 'react';
import { 
    FaChartPie, 
    FaHardHat, 
    FaClipboardCheck, 
    FaMoneyBillWave, 
    FaCalculator, 
    FaFileInvoice, 
    FaChartBar, 
    FaBell, 
    FaCog, 
    FaUser, 
    FaSignOutAlt,
    FaBriefcase
} from 'react-icons/fa';

export default function Sidebar({ collapsed, activePage, onPageChange, mobileOpen, onCloseMobile }) {
    const currentHash = window.location.hash || '#/';
    
    // Determine active menu item based on hash route
    const getActivePage = () => {
        if (currentHash.startsWith('#/projects')) return 'Projects';
        if (currentHash.startsWith('#/labour')) return 'Labour';
        if (currentHash.startsWith('#/attendance')) return 'Attendance';
        if (currentHash.startsWith('#/payroll')) return 'Payroll';
        if (currentHash.startsWith('#/expenses')) return 'Expenses';
        if (currentHash.startsWith('#/reports')) return 'Reports';
        if (currentHash.startsWith('#/analytics')) return 'Analytics';
        if (currentHash.startsWith('#/notifications')) return 'Notifications';
        if (currentHash.startsWith('#/settings')) return 'Settings';
        if (currentHash.startsWith('#/profile')) return 'Profile';
        return 'Dashboard';
    };

    const currentActive = getActivePage();

    const menuItems = [
        { id: 'Dashboard', label: 'Dashboard', icon: <FaChartPie />, link: '#/' },
        { id: 'Projects', label: 'Projects', icon: <FaBriefcase />, link: '#/projects' },
        { id: 'Labour', label: 'Labour Force', icon: <FaHardHat />, link: '#/labour' },
        { id: 'Attendance', label: 'Attendance', icon: <FaClipboardCheck />, link: '#/attendance' },
        { id: 'Payroll', label: 'Payroll', icon: <FaCalculator />, link: '#/payroll' },
        { id: 'Expenses', label: 'Expenses', icon: <FaMoneyBillWave />, link: '#/expenses' },
        { id: 'Reports', label: 'Site Reports', icon: <FaFileInvoice />, link: '#/reports' },
        { id: 'Analytics', label: 'Analytics', icon: <FaChartBar />, link: '#/analytics' },
        { id: 'Notifications', label: 'Notifications', icon: <FaBell />, link: '#/notifications' },
        { id: 'Settings', label: 'Settings', icon: <FaCog />, link: '#/settings' },
        { id: 'Profile', label: 'Profile', icon: <FaUser />, link: '#/profile' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        window.location.hash = '#/login';
    };

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            <div 
                className={`sidebar-overlay ${mobileOpen ? 'mobile-open' : ''}`}
                onClick={onCloseMobile}
            ></div>

            <aside className={`db-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="db-sidebar-brand">
                    <span className="logo-icon">■</span>
                    <span className="brand-name">ConstroConnect</span>
                </div>

                <ul className="db-sidebar-menu">
                    {menuItems.map((item) => (
                        <li key={item.id} className="db-menu-item">
                            <a 
                                href={item.link}
                                className={`db-menu-link ${currentActive === item.id ? 'active' : ''}`}
                                onClick={() => {
                                    if (onCloseMobile) onCloseMobile();
                                }}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-text">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="db-sidebar-footer">
                    <a 
                        href="#/logout" 
                        className="db-menu-link" 
                        onClick={(e) => {
                            e.preventDefault();
                            handleLogout();
                        }}
                        style={{ color: '#EF4444' }}
                    >
                        <span className="menu-icon" style={{ color: '#EF4444' }}><FaSignOutAlt /></span>
                        <span className="menu-text">Logout</span>
                    </a>
                </div>
            </aside>
        </>
    );
}
