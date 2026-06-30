const userService = require('../service/userService');

class UserController {
    async getUsers(req, res) {
        try {
            const users = await userService.getUsers(req.query);
            return res.status(200).json({ success: true, users });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async createUser(req, res) {
        try {
            const user = await userService.createUser(req.body);
            return res.status(201).json({ success: true, user });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const user = await userService.updateUser(req.params.id, req.body);
            return res.status(200).json({ success: true, user });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            await userService.deleteUser(req.params.id);
            return res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async patchUserStatus(req, res) {
        try {
            const user = await userService.patchUserStatus(req.params.id, req.body.status);
            return res.status(200).json({ success: true, user });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new UserController();
