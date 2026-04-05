import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@api/authApi';
import Card from '@components/common/Card';
import Button from '@components/common/Button';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. Token is missing.');
                return;
            }

            try {
                await authApi.verifyEmail(token);
                setStatus('success');
                setMessage('Your email has been successfully verified! You can now log in.');
            } catch (error) {
                console.error("Verification failed", error);
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
            <div className="container-custom flex justify-center items-center py-20">
                <Card className="w-full max-w-md text-center p-8">
                    {status === 'verifying' && (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mb-4" />
                            <h2 className="text-xl font-bold mb-2">Verifying Email...</h2>
                            <p className="text-gray-500">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <CheckCircle className="w-16 h-16 text-success-500 mb-4" />
                            <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
                            <p className="text-gray-500 mb-6">{message}</p>
                            <Button onClick={() => navigate('/login')}>
                                Proceed to Login
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <XCircle className="w-16 h-16 text-error-500 mb-4" />
                            <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
                            <p className="text-gray-500 mb-6">{message}</p>
                            <Button variant="outline" onClick={() => navigate('/login')}>
                                Back to Login
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default VerifyEmail;
