import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  helperText, 
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-light-text-secondary dark:text-dark-text-secondary">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-light-text-muted dark:text-dark-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
