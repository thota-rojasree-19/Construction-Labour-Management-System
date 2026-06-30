import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { validateEmail, validateMobile, validatePasswordStrength } from '../validation/authValidation';

export default function RegisterPage() {
    const [companyName, setCompanyName] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Company Admin');
    const [termsAccepted, setTermsAccepted] = useState(false);

    // UX Feedback States
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const strength = validatePasswordStrength(password);

    const handleRegisterSubmit = (e) => {
        e.preventDefault();

        // Local checks
        const formErrors = {};
        if (!companyName) formErrors.companyName = 'Company name is required';
        if (!fullName) formErrors.fullName = 'Full name is required';
        
        const emailErr = validateEmail(email);
        if (emailErr) formErrors.email = emailErr;

        const mobileErr = validateMobile(mobile);
        if (mobileErr) formErrors.mobile = mobileErr;

        if (password.length < 8) formErrors.password = 'Password must be at least 8 characters';
        if (password !== confirmPassword) formErrors.confirmPassword = 'Passwords do not match';
        if (!termsAccepted) formErrors.terms = 'You must accept the terms & conditions';

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        setAlert(null);

        fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                companyName,
                fullName,
                email,
                mobile,
                password,
                role
            })
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            return data;
        })
        .then((data) => {
            setLoading(false);
            setAlert({ type: 'success', message: 'Registration successful! You can now log in.' });
            setTimeout(() => {
                window.location.hash = '#/login';
            }, 1500);
        })
        .catch((err) => {
            setLoading(false);
            setAlert({ type: 'error', message: err.message });
        });
    };

    return (
        <AuthLayout>
            <div className="auth-header">
                <h3>Create Account</h3>
                <p>Register your construction company portal profile.</p>
            </div>

            {alert && (
                <div className={`auth-alert auth-alert-${alert.type}`}>
                    <span>✅</span>
                    <span>{alert.message}</span>
                </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
                {/* Company Name */}
                <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input 
                        type="text" 
                        className={`form-input ${errors.companyName ? 'error' : ''}`}
                        placeholder="e.g. Skyline Builders Inc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={loading}
                    />
                    {errors.companyName && <span className="input-error-msg">{errors.companyName}</span>}
                </div>

                {/* Full Name */}
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                        type="text" 
                        className={`form-input ${errors.fullName ? 'error' : ''}`}
                        placeholder="e.g. Sreeraju Thota"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                    />
                    {errors.fullName && <span className="input-error-msg">{errors.fullName}</span>}
                </div>

                {/* Email Address */}
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                        type="email" 
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        placeholder="e.g. admin@skyline.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    {errors.email && <span className="input-error-msg">{errors.email}</span>}
                </div>

                {/* Mobile Number */}
                <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input 
                        type="tel" 
                        className={`form-input ${errors.mobile ? 'error' : ''}`}
                        placeholder="e.g. 9876543210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        disabled={loading}
                    />
                    {errors.mobile && <span className="input-error-msg">{errors.mobile}</span>}
                </div>

                {/* Password Fields */}
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                        type="password" 
                        className={`form-input ${errors.password ? 'error' : ''}`}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    {errors.password && <span className="input-error-msg">{errors.password}</span>}

                    {/* Live Strength Checklist */}
                    {password && (
                        <div className="password-requirements">
                            <h4>Password Security Checklist:</h4>
                            <div className={`requirement-item ${strength.length ? 'valid' : ''}`}>
                                <span>{strength.length ? '🟢' : '⚪'}</span> At least 8 characters
                            </div>
                            <div className={`requirement-item ${strength.uppercase ? 'valid' : ''}`}>
                                <span>{strength.uppercase ? '🟢' : '⚪'}</span> At least one UPPERCASE letter
                            </div>
                            <div className={`requirement-item ${strength.number ? 'valid' : ''}`}>
                                <span>{strength.number ? '🟢' : '⚪'}</span> At least one number (0-9)
                            </div>
                            <div className={`requirement-item ${strength.special ? 'valid' : ''}`}>
                                <span>{strength.special ? '🟢' : '⚪'}</span> At least one special symbol
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input 
                        type="password" 
                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                    />
                    {errors.confirmPassword && <span className="input-error-msg">{errors.confirmPassword}</span>}
                </div>

                {/* Terms Acceptance */}
                <div className="form-group" style={{ marginTop: '24px' }}>
                    <label className="remember-me-checkbox" style={{ fontSize: '13px' }}>
                        <input 
                            type="checkbox" 
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            disabled={loading}
                        />
                        I accept the Construction Compliance Rules & Terms
                    </label>
                    {errors.terms && <span className="input-error-msg">{errors.terms}</span>}
                </div>

                {/* Submit button */}
                <button type="submit" className="auth-submit-btn" style={{ marginTop: '24px' }} disabled={loading}>
                    {loading ? (
                        <>
                            <div className="spinner-icon"></div>
                            Creating Profile...
                        </>
                    ) : 'Register Account'}
                </button>
            </form>

            <p className="auth-switch-link" style={{ marginTop: '24px' }}>
                Already registered? <a href="#/login">Login</a>
            </p>
        </AuthLayout>
    );
}
