import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { Translate } from '../hooks/useTranslation.jsx';

const ProfileView = ({ user }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        avatar: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Loading profile...');
            const data = await userService.getProfile();
            console.log('Profile data received:', data);

            if (!data || !data.id) {
                throw new Error('Invalid profile data received from server');
            }

            setProfile(data);
            setFormData({
                name: data.name || '',
                email: data.email || '',
                avatar: data.avatar || '',
            });
        } catch (err) {
            console.error('Profile load error:', err);
            setError(err.body?.error || err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const result = await userService.updateProfile(formData);
            setProfile({ ...profile, ...formData });
            setSuccess('Profile updated successfully');
            setEditMode(false);

            // Update local storage
            const storedUser = JSON.parse(localStorage.getItem('dca_user'));
            localStorage.setItem('dca_user', JSON.stringify({ ...storedUser, ...formData }));

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.body?.error || err.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            await userService.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );
            setSuccess('Password changed successfully');
            setShowPasswordModal(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.body?.error || err.message || 'Failed to change password');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-white flex flex-col items-center gap-4">
                    <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full"></div>
                    <p className="text-slate-400"><Translate text="Loading profile..." /></p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">error</span>
                    <p className="text-white font-bold text-xl mb-2"><Translate text="Failed to load profile" /></p>
                    <p className="text-slate-400">{error}</p>
                    <button
                        onClick={loadProfile}
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold"
                    >
                        <Translate text="Retry" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-background-dark p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
                            <Translate text="My Profile" />
                        </h1>
                        <p className="text-slate-400"><Translate text="Manage your account settings and preferences" /></p>
                    </div>
                    {!editMode ? (
                        <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
                        >
                            <span className="material-symbols-outlined">edit</span>
                            <Translate text="Edit Profile" />
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setEditMode(false);
                                setFormData({
                                    name: profile.name,
                                    email: profile.email,
                                    avatar: profile.avatar,
                                });
                                setError(null);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-surface-dark text-slate-400 font-bold rounded-xl border border-surface-border hover:border-slate-500 transition-all"
                        >
                            <span className="material-symbols-outlined">close</span>
                            <Translate text="Cancel" />
                        </button>
                    )}
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-6 py-4 rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span className="font-bold">{success}</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-4 rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined">error</span>
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {/* Profile Information */}
                <div className="bg-surface-dark border border-surface-border rounded-3xl p-8 space-y-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <span className="material-symbols-outlined">person</span>
                        <Translate text="Personal Information" />
                    </h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-6">
                            <div className="size-24 rounded-full overflow-hidden bg-slate-800 border-4 border-surface-border">
                                <img
                                    src={editMode ? formData.avatar : (profile?.avatar || 'https://via.placeholder.com/96')}
                                    alt={profile?.name || 'User'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/96';
                                    }}
                                />
                            </div>
                            {editMode && (
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <Translate text="Avatar URL" />
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.avatar}
                                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                        className="mt-2 w-full bg-[#111418] border-surface-border rounded-xl text-white px-4 py-3 focus:ring-primary focus:border-primary"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                    <Translate text="Full Name" />
                                </label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#111418] border-surface-border rounded-xl text-white px-4 py-3 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                ) : (
                                    <p className="text-white font-bold text-lg">{profile?.name || 'N/A'}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                    <Translate text="Email Address" />
                                </label>
                                {editMode ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-[#111418] border-surface-border rounded-xl text-white px-4 py-3 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                ) : (
                                    <p className="text-white font-bold text-lg">{profile?.email || 'N/A'}</p>
                                )}
                            </div>
                        </div>

                        {/* Role (Read-only) */}
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                <Translate text="Role" />
                            </label>
                            <p className="text-white font-bold text-lg flex items-center gap-2">
                                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                                    {profile?.role?.replace('_', ' ') || 'N/A'}
                                </span>
                            </p>
                        </div>

                        {/* Company Name (Read-only from agency) */}
                        {profile.agency && (
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                    <Translate text="Company / Agency" />
                                </label>
                                <div className="bg-[#111418] border border-surface-border rounded-xl p-4">
                                    <p className="text-white font-bold text-lg">{profile.agency.agency_name}</p>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {profile.agency.contact_person} • {profile.agency.contact_email}
                                    </p>
                                    <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${profile.agency.status === 'ACTIVE'
                                        ? 'bg-green-500/20 text-green-500'
                                        : 'bg-amber-500/20 text-amber-500'
                                        }`}>
                                        {profile.agency.status}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Member Since */}
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                <Translate text="Member Since" />
                            </label>
                            <p className="text-white font-bold">
                                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                }) : 'N/A'}
                            </p>
                        </div>

                        {/* Save Button */}
                        {editMode && (
                            <button
                                type="submit"
                                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">save</span>
                                <Translate text="Save Changes" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Security Section */}
                <div className="bg-surface-dark border border-surface-border rounded-3xl p-8 space-y-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <span className="material-symbols-outlined">lock</span>
                        <Translate text="Security" />
                    </h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-bold text-lg"><Translate text="Password" /></p>
                            <p className="text-slate-400 text-sm"><Translate text="Change your account password" /></p>
                        </div>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-6 py-3 bg-[#111418] text-white font-bold rounded-xl border border-surface-border hover:border-primary transition-all"
                        >
                            <Translate text="Change Password" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-surface-dark border border-surface-border rounded-3xl p-8 max-w-md w-full space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-white"><Translate text="Change Password" /></h3>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordData({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: '',
                                    });
                                    setError(null);
                                }}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                    <Translate text="Current Password" />
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) =>
                                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                                    }
                                    className="w-full bg-[#111418] border-surface-border rounded-xl text-white px-4 py-3 focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                    <Translate text="New Password" />
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                                    }
                                    className="w-full bg-[#111418] border-surface-border rounded-xl text-white px-4 py-3 focus:ring-primary focus:border-primary"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                    <Translate text="Confirm New Password" />
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                    }
                                    className="w-full bg-[#111418] border-surface-border rounded-xl text-white px-4 py-3 focus:ring-primary focus:border-primary"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">lock_reset</span>
                                <Translate text="Update Password" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileView;
