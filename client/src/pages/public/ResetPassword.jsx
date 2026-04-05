import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { authApi } from '@api/authApi';
import Navbar from '@components/layout/Navbar';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        if (!token) {
            toast.error('Invalid or missing reset token');
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword(token, data.password);
            toast.success('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error("Reset password error", error);
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
                <Navbar />
                <div className="container-custom flex justify-center items-center py-20">
                    <Card className="max-w-md w-full text-center p-8">
                        <h2 className="text-xl font-bold text-error-600 mb-2">Invalid Request</h2>
                        <p className="text-gray-500 mb-6">Password reset token is missing from the URL.</p>
                        <Button onClick={() => navigate('/forgot-password')}>Request New Link</Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
            <Navbar />
            <div className="container-custom flex justify-center items-center py-20">
                <Card className="w-full max-w-md p-6">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reset Password</h1>
                        <p className="text-gray-500 mt-2">
                            Create a new, strong password for your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            type="password"
                            label="New Password"
                            placeholder="••••••••"
                            icon={Lock}
                            error={errors.password?.message}
                            {...register('password', { 
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Must be at least 6 characters' }
                            })}
                        />
                         <Input
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            icon={Lock}
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword', { 
                                required: 'Please confirm your password',
                                validate: val => val === watch('password') || "Passwords do not match"
                            })}
                        />

                        <Button type="submit" className="w-full" isLoading={loading}>
                            Reset Password <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
