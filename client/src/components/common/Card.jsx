const Card = ({ 
  children, 
  hover = false, 
  className = '',
  padding = 'default',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };
  
  const paddingClass = paddingClasses[padding] || paddingClasses.default;
  
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
