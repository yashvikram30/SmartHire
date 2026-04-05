import { User } from 'lucide-react';

const Avatar = ({ 
  src, 
  alt = 'User', 
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };
  
  const sizeClass = sizes[size] || sizes.md;
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };
  
  const iconSize = iconSizes[size] || iconSizes.md;
  
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-dark-bg-tertiary ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <User className={`${iconSize} text-gray-500 dark:text-gray-400`} />
      )}
    </div>
  );
};

export default Avatar;
