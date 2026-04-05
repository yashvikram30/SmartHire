const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}) => {
  const baseStyles = 'badge';
  
  const variants = {
    primary: 'badge-primary',
    secondary: 'badge-gray',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    gray: 'badge-gray',
  };
  
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <span className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
