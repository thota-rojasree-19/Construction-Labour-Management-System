/**
 * Form Input Validator Helper
 */

export const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
};

export const validateMobile = (mobile) => {
    if (!mobile) return 'Mobile number is required';
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) return 'Please enter a valid 10-digit mobile number';
    return null;
};

export const validatePasswordStrength = (password) => {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };
    return checks;
};

export const getPasswordErrorMessage = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return null;
};
