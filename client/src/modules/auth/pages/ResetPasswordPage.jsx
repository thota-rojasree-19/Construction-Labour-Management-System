import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { validatePasswordStrength } from '../validation/authValidation';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const strength = validatePasswordStrength(password);

    const handleResetSubmit = (e) => {
        e.preventDefault();

        const formErrors = {};
        if (password.length < 8) formErrors.password = 'Password must be at least 8 characters';
        if (password !== confirmPassword) formErrors.confirmPassword = 'Passwords do not match';

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        setAlert(null);

        const resetToken = sessionStorage.getItem('reset_token');

        if (!resetToken) {
            setLoading(false);
            setAlert({ type: 'error', message: 'Reset token is missing or expired. Please start forgot password flow again.' });
            return;
        }

        fetch('/api/v1/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resetToken}`
            },
            body: JSON.stringify({ password })
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to reset password');
                }
                return data;
            })
            .then((data) => {
                setLoading(false);
                setAlert({ type: 'success', message: 'Password updated successfully! Redirecting to login...' });

                // Clean up session storage
                sessionStorage.removeItem('reset_token');
                sessionStorage.removeItem('otp_email');
                sessionStorage.removeItem('otp_purpose');

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
                <h3>Reset Password</h3>
                <p>Choose a secure, strong password to protect your account access.</p>
            </div>

            {alert && (
                <div className={`auth-alert auth-alert-${alert.type}`}>
                    <span>✅</span>
                    <span>{alert.message}</span>
                </div>
            )}

            <form onSubmit={handleResetSubmit}>
                {/* Password field */}
                <div className="form-group">
                    <label className="form-label">New Password</label>
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
                                <span>{strength.uppercase ? '🟢' : '⚪'}</span> At least one uppercase letter
                            </div>
                            <div className={`requirement-item ${strength.number ? 'valid' : ''}`}>
                                <span>{strength.number ? '🟢' : '⚪'}</span> At least one number
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password field */}
                <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
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

                <button type="submit" className="auth-submit-btn" style={{ marginTop: '24px' }} disabled={loading}>
                    {loading ? (
                        <>
                            <div className="spinner-icon"></div>
                            Updating Password...
                        </>
                    ) : 'Reset Password'}
                </button>
            </form>
        </AuthLayout>
    );
}
