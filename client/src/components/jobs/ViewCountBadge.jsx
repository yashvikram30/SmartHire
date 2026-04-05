import { Eye } from 'lucide-react';

const ViewCountBadge = ({ count = 0, size = 'md', className = '' }) => {
  const sizes = {
    sm: {
      container: 'px-2 py-1',
      icon: 'w-3 h-3',
      text: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
    lg: {
      container: 'px-4 py-2',
      icon: 'w-5 h-5',
      text: 'text-base',
    },
  };

  const sizeClasses = sizes[size] || sizes.md;

  // Format count for display (e.g., 1.2k, 5.3k, etc.)
  const formatCount = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div
      className={`
        flex items-center space-x-1.5 rounded-full
        bg-gradient-to-r from-blue-50 to-purple-50
        dark:from-blue-900/20 dark:to-purple-900/20
        border border-blue-100 dark:border-blue-800/30
        backdrop-blur-sm
        ${sizeClasses.container}
        ${className}
      `}
      title={`${count.toLocaleString()} ${count === 1 ? 'view' : 'views'}`}
    >
      <Eye className={`${sizeClasses.icon} text-blue-600 dark:text-blue-400`} />
      <span className={`${sizeClasses.text} font-medium text-gray-700 dark:text-gray-300`}>
        {formatCount(count)}
      </span>
    </div>
  );
};

export default ViewCountBadge;
