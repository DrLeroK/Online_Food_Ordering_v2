import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const ResetPasswordConfirm = () => {
    const { uid, token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [reNewPassword, setReNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validate passwords match
        if (newPassword !== reNewPassword) {
            setErrors({ password: "Passwords don't match" });
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/users/reset_password_confirm/', {
                uid,
                token,
                new_password: newPassword,
                re_new_password: reNewPassword
            });

            toast.success('Password reset successfully!');
            navigate('/login');
        } catch (error) {
            if (error.response) {
                // Handle Django validation errors
                setErrors(error.response.data);
                toast.error('Error resetting password');
            } else {
                toast.error('Network error - please try again');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Reset Your Password
                    </h2>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                id="new-password"
                                name="new-password"
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.new_password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.new_password && (
                                <p className="mt-2 text-sm text-red-600">{errors.new_password}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="re-new-password" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                id="re-new-password"
                                name="re-new-password"
                                type="password"
                                required
                                value={reNewPassword}
                                onChange={(e) => setReNewPassword(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.re_new_password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.re_new_password && (
                                <p className="mt-2 text-sm text-red-600">{errors.re_new_password}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;