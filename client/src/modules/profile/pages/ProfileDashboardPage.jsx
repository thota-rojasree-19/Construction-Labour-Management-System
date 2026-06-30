import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import LoadingSkeleton from '../../attendance/components/LoadingSkeleton';
import EmptyState from '../../attendance/components/EmptyState';
import { 
    FaUser, 
    FaBuilding, 
    FaShieldAlt, 
    FaBell, 
    FaUsers, 
    FaKey,
    FaCrown,
    FaSave,
    FaLock,
    FaSignOutAlt,
    FaSpinner,
    FaTrash,
    FaUserPlus,
    FaUserCheck,
    FaEye
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/profile.css';

export default function ProfileDashboardPage() {
    const [activeSubTab, setActiveSubTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    
    // User profile data
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        mobile: '',
        department: '',
        designation: '',
        address: '',
        photo: ''
    });

    // Company profile data
    const [company, setCompany] = useState({
        companyName: '',
        logo: '',
        registrationNumber: '',
        gstNumber: '',
        taxId: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        timezone: '',
        currency: '',
        workingDays: 6,
        workingHours: 8
    });

    // User Directory data
    const [usersList, setUsersList] = useState([]);
    const [newUserForm, setNewUserForm] = useState({
        fullName: '',
        email: '',
        mobile: '',
        role: 'Supervisor',
        department: 'Operations',
        password: ''
    });
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);

    // Password form
    const [pwdForm, setPwdForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notifications Preference
    const [notifPrefs, setNotifPrefs] = useState({
        emailNotifications: true,
        attendanceAlerts: true,
        payrollAlerts: true,
        expenseAlerts: true,
        projectUpdates: true,
        siteReportNotifications: true,
        frequency: 'Instant'
    });

    // Subscription details
    const [subscription, setSubscription] = useState({
        plan: 'Enterprise Pro',
        status: 'Active',
        projectsLimit: 20,
        usersLimit: 15,
        storageLimitGB: 50,
        usedStorageGB: 4.8,
        expiryDate: '',
        renewalDate: ''
    });

    const [saving, setSaving] = useState(false);

    const fetchAllData = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        Promise.all([
            fetch('/api/v1/profile', { headers }).then(res => res.json()),
            fetch('/api/v1/company', { headers }).then(res => res.json()),
            fetch('/api/v1/users', { headers }).then(res => res.json()),
            fetch('/api/v1/profile/subscription', { headers }).then(res => res.json())
        ]).then(([profRes, compRes, usersRes, subRes]) => {
            if (profRes.success && profRes.user) {
                setProfile(profRes.user);
                if (profRes.user.notificationPreferences) {
                    setNotifPrefs(profRes.user.notificationPreferences);
                }
            }
            if (compRes.success && compRes.company) {
                setCompany(compRes.company);
            }
            if (usersRes.success && usersRes.users) {
                setUsersList(usersRes.users);
            }
            if (subRes.success && subRes.subscription) {
                setSubscription(subRes.subscription);
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
            toast.error('Failed to load profile administration data');
        });
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Save profile updates
    const handleSaveProfile = (e) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem('token');
        
        fetch('/api/v1/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profile)
        })
            .then(res => res.json())
            .then(data => {
                setSaving(false);
                if (data.success) {
                    toast.success('Personal profile details updated successfully');
                    setProfile(data.user);
                } else {
                    toast.error(data.message || 'Failed to save profile');
                }
            })
            .catch(() => {
                setSaving(false);
                toast.error('Failed to connect to profile server');
            });
    };

    // Save company details
    const handleSaveCompany = (e) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem('token');

        fetch('/api/v1/company', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(company)
        })
            .then(res => res.json())
            .then(data => {
                setSaving(false);
                if (data.success) {
                    toast.success('Company registries updated');
                    setCompany(data.company);
                } else {
                    toast.error(data.message);
                }
            })
            .catch(() => {
                setSaving(false);
                toast.error('Error saving company profile');
            });
    };

    // Change Password
    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            return toast.error('Confirm password does not match new password');
        }
        if (pwdForm.newPassword.length < 6) {
            return toast.error('New password must be at least 6 characters long');
        }

        setSaving(true);
        const token = localStorage.getItem('token');

        fetch('/api/v1/profile/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: pwdForm.currentPassword,
                newPassword: pwdForm.newPassword
            })
        })
            .then(res => res.json())
            .then(data => {
                setSaving(false);
                if (data.success) {
                    toast.success('Password changed successfully');
                    setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                } else {
                    toast.error(data.message);
                }
            })
            .catch(() => {
                setSaving(false);
                toast.error('Error modifying password');
            });
    };

    // Save Notifications Preferences
    const handleSaveNotifPrefs = (e) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem('token');

        fetch('/api/v1/profile/notifications', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(notifPrefs)
        })
            .then(res => res.json())
            .then(data => {
                setSaving(false);
                if (data.success) {
                    toast.success('Notification preferences saved');
                } else {
                    toast.error(data.message);
                }
            })
            .catch(() => {
                setSaving(false);
                toast.error('Error saving notification preferences');
            });
    };

    // Create User
    const handleCreateUser = (e) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem('token');
        const payload = { ...newUserForm, companyName: company.companyName };

        fetch('/api/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                setSaving(false);
                if (data.success) {
                    toast.success('New user invited/created successfully');
                    setNewUserForm({ fullName: '', email: '', mobile: '', role: 'Supervisor', department: 'Operations', password: '' });
                    setIsAddUserOpen(false);
                    fetchAllData();
                } else {
                    toast.error(data.message);
                }
            })
            .catch(() => {
                setSaving(false);
                toast.error('Error creating user');
            });
    };

    // Deactivate User
    const handleToggleUserStatus = (id, currentStatus) => {
        const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const token = localStorage.getItem('token');

        fetch(`/api/v1/users/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: nextStatus })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(`User is now ${nextStatus}`);
                    fetchAllData();
                }
            })
            .catch(() => {});
    };

    // Delete User
    const handleDeleteUser = (id) => {
        if (!window.confirm('Are you sure you want to delete this user permanently?')) return;
        const token = localStorage.getItem('token');

        fetch(`/api/v1/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success('User deleted successfully');
                    fetchAllData();
                }
            })
            .catch(() => {});
    };

    // Render navigation links
    const navigationTabs = [
        { id: 'profile', label: 'My Profile', icon: <FaUser /> },
        { id: 'company', label: 'Company Settings', icon: <FaBuilding /> },
        { id: 'security', label: 'Password & Security', icon: <FaLock /> },
        { id: 'notifications', label: 'Notifications Settings', icon: <FaBell /> },
        { id: 'users', label: 'User Directory', icon: <FaUsers /> },
        { id: 'permissions', label: 'Permission Matrix', icon: <FaShieldAlt /> },
        { id: 'subscription', label: 'SaaS Subscription', icon: <FaCrown /> }
    ];

    return (
        <DashboardLayout activePage="Settings">
            <ToastContainer />

            <div className="db-header">
                <div className="db-header-titles">
                    <h1>Enterprise Settings & Administration</h1>
                    <p>Configure personal profiles, company registries, role authorization matrix levels, and system notifications.</p>
                </div>
            </div>

            {loading ? (
                <LoadingSkeleton rows={6} cols={4} table={false} />
            ) : (
                <div className="profile-layout-grid">
                    {/* Left Navigation Card */}
                    <div className="profile-sidebar-card">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar-circle">
                                {profile.photo ? (
                                    <img src={profile.photo} className="profile-avatar-img" alt="Avatar" />
                                ) : (
                                    profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{profile.fullName}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{profile.designation} ({profile.role})</span>
                        </div>

                        <div className="profile-nav-menu">
                            {navigationTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`profile-nav-link ${activeSubTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveSubTab(tab.id)}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Details Panel */}
                    <div className="dashboard-card" style={{ minHeight: '420px' }}>
                        
                        {/* 1. MY PROFILE VIEW */}
                        {activeSubTab === 'profile' && (
                            <form onSubmit={handleSaveProfile}>
                                <h3 style={{ marginBottom: '16px' }}>Personal Profile Details</h3>
                                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={profile.fullName}
                                            onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={profile.email}
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Mobile Number</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={profile.mobile}
                                            onChange={e => setProfile({ ...profile, mobile: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Designation</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={profile.designation}
                                            onChange={e => setProfile({ ...profile, designation: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={profile.department}
                                            onChange={e => setProfile({ ...profile, department: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Profile Photo URL</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="https://example.com/photo.jpg"
                                            value={profile.photo}
                                            onChange={e => setProfile({ ...profile, photo: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label">Residential Address</label>
                                        <textarea
                                            className="form-input"
                                            rows="3"
                                            value={profile.address}
                                            onChange={e => setProfile({ ...profile, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} disabled={saving}>
                                    {saving ? <FaSpinner className="fa-spin" /> : <FaSave />} Save Changes
                                </button>
                            </form>
                        )}

                        {/* 2. COMPANY SETTINGS VIEW */}
                        {activeSubTab === 'company' && (
                            <form onSubmit={handleSaveCompany}>
                                <h3 style={{ marginBottom: '16px' }}>Company Information Registries</h3>
                                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Company Legal Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={company.companyName}
                                            onChange={e => setCompany({ ...company, companyName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Registration Number</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={company.registrationNumber}
                                            onChange={e => setCompany({ ...company, registrationNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">GSTIN / Tax ID</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={company.gstNumber}
                                            onChange={e => setCompany({ ...company, gstNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Support Email Address</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={company.email}
                                            onChange={e => setCompany({ ...company, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Contact Number</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={company.phone}
                                            onChange={e => setCompany({ ...company, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Website URL</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={company.website}
                                            onChange={e => setCompany({ ...company, website: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} disabled={saving}>
                                    {saving ? <FaSpinner className="fa-spin" /> : <FaSave />} Save Company Settings
                                </button>
                            </form>
                        )}

                        {/* 3. PASSWORD & SECURITY VIEW */}
                        {activeSubTab === 'security' && (
                            <form onSubmit={handlePasswordChange}>
                                <h3 style={{ marginBottom: '16px' }}>Security & Password Management</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Current Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={pwdForm.currentPassword}
                                            onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={pwdForm.newPassword}
                                            onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={pwdForm.confirmPassword}
                                            onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} disabled={saving}>
                                    {saving ? <FaSpinner className="fa-spin" /> : <FaKey />} Update Password
                                </button>
                            </form>
                        )}

                        {/* 4. NOTIFICATION SETTINGS VIEW */}
                        {activeSubTab === 'notifications' && (
                            <form onSubmit={handleSaveNotifPrefs}>
                                <h3 style={{ marginBottom: '16px' }}>Configure Notification Alerts</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={notifPrefs.emailNotifications}
                                            onChange={e => setNotifPrefs({ ...notifPrefs, emailNotifications: e.target.checked })}
                                        />
                                        Enable Email Notifications
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={notifPrefs.attendanceAlerts}
                                            onChange={e => setNotifPrefs({ ...notifPrefs, attendanceAlerts: e.target.checked })}
                                        />
                                        Attendance Check-in/Check-out Alerts
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={notifPrefs.payrollAlerts}
                                            onChange={e => setNotifPrefs({ ...notifPrefs, payrollAlerts: e.target.checked })}
                                        />
                                        Payroll Salary Release Alerts
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={notifPrefs.expenseAlerts}
                                            onChange={e => setNotifPrefs({ ...notifPrefs, expenseAlerts: e.target.checked })}
                                        />
                                        Operational Expense Threshold Warnings
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={notifPrefs.projectUpdates}
                                            onChange={e => setNotifPrefs({ ...notifPrefs, projectUpdates: e.target.checked })}
                                        />
                                        Project Timeline updates
                                    </label>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} disabled={saving}>
                                    {saving ? <FaSpinner className="fa-spin" /> : <FaSave />} Save Preferences
                                </button>
                            </form>
                        )}

                        {/* 5. USER DIRECTORY VIEW */}
                        {activeSubTab === 'users' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0 }}>Company Users Directory</h3>
                                    <button className="btn btn-primary" onClick={() => setIsAddUserOpen(!isAddUserOpen)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <FaUserPlus /> Invite User / Add Account
                                    </button>
                                </div>

                                {isAddUserOpen && (
                                    <form onSubmit={handleCreateUser} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>New User Account details</h4>
                                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Full Name"
                                                    value={newUserForm.fullName}
                                                    onChange={e => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="email"
                                                    className="form-input"
                                                    placeholder="Email Address"
                                                    value={newUserForm.email}
                                                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Mobile Phone"
                                                    value={newUserForm.mobile}
                                                    onChange={e => setNewUserForm({ ...newUserForm, mobile: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="password"
                                                    className="form-input"
                                                    placeholder="Temporary Password"
                                                    value={newUserForm.password}
                                                    onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <select
                                                    className="form-input"
                                                    value={newUserForm.role}
                                                    onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                                >
                                                    <option value="Administrator">Administrator</option>
                                                    <option value="Project Manager">Project Manager</option>
                                                    <option value="Site Engineer">Site Engineer</option>
                                                    <option value="Supervisor">Supervisor</option>
                                                    <option value="HR">HR Officer</option>
                                                    <option value="Accountant">Accountant</option>
                                                    <option value="Viewer">Viewer</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Department"
                                                    value={newUserForm.department}
                                                    onChange={e => setNewUserForm({ ...newUserForm, department: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary">Create User</button>
                                        </div>
                                    </form>
                                )}

                                <div className="table-responsive">
                                    <table className="project-table">
                                        <thead>
                                            <tr>
                                                <th>Full Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Department</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usersList.length > 0 ? (
                                                usersList.map((user, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ fontWeight: 600 }}>{user.fullName}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.role}</td>
                                                        <td>{user.department || 'N/A'}</td>
                                                        <td>
                                                            <span className={`badge ${user.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                                {user.status || 'Active'}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button
                                                                className="btn btn-secondary"
                                                                style={{ padding: '4px 8px', fontSize: '11px', marginRight: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                                                onClick={() => handleToggleUserStatus(user._id, user.status || 'Active')}
                                                            >
                                                                <FaUserCheck /> Toggle
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary"
                                                                style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--danger)' }}
                                                                onClick={() => handleDeleteUser(user._id)}
                                                            >
                                                                <FaTrash /> Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6">No team members registered.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 6. PERMISSIONS VIEW */}
                        {activeSubTab === 'permissions' && (
                            <div>
                                <h3 style={{ marginBottom: '16px' }}>Role Authorization permission matrix</h3>
                                <div className="table-responsive">
                                    <table className="permission-matrix-table">
                                        <thead>
                                            <tr>
                                                <th>Module Name</th>
                                                <th>Administrator</th>
                                                <th>Project Manager</th>
                                                <th>Supervisor</th>
                                                <th>HR</th>
                                                <th>Viewer</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {['Projects Portal', 'Labour directory', 'Daily Attendance', 'HRMS Payroll', 'Operations Expenses', 'Daily Site Reports', 'BI Analytics Center'].map((moduleName, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: 600 }}>{moduleName}</td>
                                                    <td><input type="checkbox" className="permission-checkbox" defaultChecked /></td>
                                                    <td><input type="checkbox" className="permission-checkbox" defaultChecked={idx !== 3 && idx !== 4} /></td>
                                                    <td><input type="checkbox" className="permission-checkbox" defaultChecked={idx === 1 || idx === 2 || idx === 5} /></td>
                                                    <td><input type="checkbox" className="permission-checkbox" defaultChecked={idx === 1 || idx === 3} /></td>
                                                    <td><input type="checkbox" className="permission-checkbox" defaultChecked={false} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 7. SUBSCRIPTION VIEW */}
                        {activeSubTab === 'subscription' && (
                            <div>
                                <h3 style={{ marginBottom: '16px' }}>SaaS Subscription Plan</h3>
                                <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', maxWidth: '500px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                                        <strong style={{ fontSize: '18px', color: 'var(--primary)' }}>{subscription.plan}</strong>
                                        <span className="badge bg-success" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center' }}>{subscription.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Active User Accounts Limit:</span>
                                            <strong>{usersList.length} / {subscription.usersLimit}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Maximum Project Sites Allowed:</span>
                                            <strong>{subscription.projectsLimit} Sites</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Cloud Media Storage Limit:</span>
                                            <strong>{subscription.usedStorageGB} GB / {subscription.storageLimitGB} GB</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Plan Renewal Date:</span>
                                            <strong>{new Date(subscription.renewalDate).toLocaleDateString()}</strong>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>Upgrade to Enterprise Premium</button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
