const bcrypt = require('bcryptjs');
const { User, DcaAgency } = require('../models');

const userController = {
    // Get current user's profile with agency details
    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            console.log('[Profile API] Fetching profile for user ID:', userId);

            const user = await User.findByPk(userId, {
                attributes: ['id', 'email', 'name', 'role', 'avatar', 'agencyId', 'createdAt'],
            });

            if (!user) {
                console.log('[Profile API] User not found:', userId);
                return res.status(404).json({ error: 'User not found' });
            }

            console.log('[Profile API] User found:', {
                id: user.id,
                name: user.name,
                email: user.email,
                agencyId: user.agencyId
            });

            let profile = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                agencyId: user.agencyId,
                createdAt: user.createdAt,
                agency: null,
            };

            // If user is a DCA agent, fetch agency details
            if (user.agencyId) {
                console.log('[Profile API] Fetching agency:', user.agencyId);
                const agency = await DcaAgency.findByPk(user.agencyId);

                if (agency) {
                    console.log('[Profile API] Agency found:', agency.agency_name);
                    profile.agency = {
                        dca_id: agency.dca_id,
                        agency_name: agency.agency_name,
                        short_name: agency.short_name,
                        contact_person: agency.contact_person,
                        contact_email: agency.contact_email,
                        contact_phone: agency.contact_phone,
                        status: agency.status,
                    };
                } else {
                    console.log('[Profile API] Agency not found for ID:', user.agencyId);
                }
            }

            console.log('[Profile API] Sending profile response');
            res.json(profile);
        } catch (error) {
            console.error('[Profile API] Error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch profile' });
        }
    },

    // Update user profile
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { name, email, avatar } = req.body;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if email is being changed and if it's already taken
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) {
                    return res.status(400).json({ error: 'Email already in use' });
                }
            }

            // Update allowed fields
            if (name !== undefined) user.name = name;
            if (email !== undefined) user.email = email;
            if (avatar !== undefined) user.avatar = avatar;

            await user.save();

            res.json({
                message: 'Profile updated successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    agencyId: user.agencyId,
                },
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ error: error.message || 'Failed to update profile' });
        }
    },

    // Change password
    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current password and new password are required' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters long' });
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash and save new password
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: error.message || 'Failed to change password' });
        }
    },
};

module.exports = userController;
