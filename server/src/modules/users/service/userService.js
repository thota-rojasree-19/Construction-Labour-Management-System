const User = require('../../auth/model/User');
const bcrypt = require('bcryptjs');

class UserService {
    async getUsers(filters = {}) {
        const query = {};
        if (filters.search) {
            query.$or = [
                { fullName: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } }
            ];
        }
        if (filters.role) query.role = filters.role;
        if (filters.status) query.status = filters.status;
        if (filters.department) query.department = filters.department;

        return await User.find(query).select('-password');
    }

    async createUser(data) {
        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password || 'Constro@123', salt);

        const newUser = await User.create({
            ...data,
            password: hashedPassword
        });

        // Exclude password in return
        const userObj = newUser.toObject();
        delete userObj.password;
        return userObj;
    }

    async updateUser(id, data) {
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        return await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
    }

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    }

    async patchUserStatus(id, status) {
        return await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    }
}

module.exports = new UserService();
