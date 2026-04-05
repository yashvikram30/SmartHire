import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`${sizeClass} animate-spin text-primary-600 dark:text-primary-400 ${className}`} />
    </div>
  );
};

export default Spinner;
