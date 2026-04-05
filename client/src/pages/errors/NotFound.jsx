import { useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg text-center p-4">
            <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Page Not Found</h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8 max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
    );
};

export default NotFound;
