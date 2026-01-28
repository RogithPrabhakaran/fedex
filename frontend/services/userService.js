import { api } from './api';

export const userService = {
    // Get current user's profile
    async getProfile() {
        const response = await api.get('/users/profile');
        return response; // api.get already returns the JSON data
    },

    // Update user profile
    async updateProfile(data) {
        const response = await api.put('/users/profile', data);
        return response; // api.put already returns the JSON data
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
        const response = await api.put('/users/password', {
            currentPassword,
            newPassword,
        });
        return response; // api.put already returns the JSON data
    },
};
