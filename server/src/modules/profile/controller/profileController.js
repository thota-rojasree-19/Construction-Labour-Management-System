const User = require('../../auth/model/User');
const bcrypt = require('bcryptjs');

class ProfileController {
    // 1. Get Logged-in Profile
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user._id).select('-password');
            return res.status(200).json({ success: true, user });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // 2. Update Profile
    async updateProfile(req, res) {
        try {
            const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-password');
            return res.status(200).json({ success: true, user });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // 3. Change Password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
            }

            // Retrieve user with password
            const user = await User.findById(req.user._id);
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Current password does not match' });
            }

            // Hash and update
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            return res.status(200).json({ success: true, message: 'Password updated successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // 4. Update Notifications Preference
    async updateNotifications(req, res) {
        try {
            const user = await User.findByIdAndUpdate(
                req.user._id, 
                { notificationPreferences: req.body }, 
                { new: true }
            ).select('-password');
            return res.status(200).json({ success: true, user });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // 5. Get Subscription Info (SaaS limits mockup)
    async getSubscription(req, res) {
        try {
            const subscriptionInfo = {
                plan: 'Enterprise Pro',
                status: 'Active',
                projectsLimit: 20,
                usersLimit: 15,
                storageLimitGB: 50,
                usedStorageGB: 4.8,
                expiryDate: new Date('2028-12-31').toISOString(),
                renewalDate: new Date('2028-12-31').toISOString(),
                billingCycle: 'Annually'
            };
            return res.status(200).json({ success: true, subscription: subscriptionInfo });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ProfileController();
