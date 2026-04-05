import { useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';
import { Lock } from 'lucide-react';

const Unauthorized = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg text-center p-4">
            <div className="w-16 h-16 bg-error-50 dark:bg-error-900/20 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-error-500" />
            </div>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Access Denied</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8 max-w-md">
                You do not have permission to view this page. Please contact your administrator if you believe this is an error.
            </p>
            <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
    );
};

export default Unauthorized;
