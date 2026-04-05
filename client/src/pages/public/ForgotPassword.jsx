import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '@api/authApi';
import Navbar from '@components/layout/Navbar';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await authApi.forgotPassword(data.email);
            setIsSent(true);
            toast.success('Reset link sent to your email');
        } catch (error) {
            console.error("Forgot password error", error);
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
            <Navbar />
            <div className="container-custom flex justify-center items-center py-20">
                <Card className="w-full max-w-md p-6">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot Password?</h1>
                        <p className="text-gray-500 mt-2">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {isSent ? (
                        <div className="text-center">
                            <div className="bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 p-4 rounded-lg mb-6 flex flex-col items-center">
                                <CheckCircle className="w-12 h-12 mb-2" />
                                <p className="font-medium">Check your inbox!</p>
                                <p className="text-sm">We've sent a password reset link to your email.</p>
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
                                Try another email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <Input
                                type="email"
                                label="Email Address"
                                placeholder="you@example.com"
                                icon={Mail}
                                error={errors.email?.message}
                                {...register('email', { required: 'Email is required' })}
                            />

                            <Button type="submit" className="w-full" isLoading={loading}>
                                Send Reset Link
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
