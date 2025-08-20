import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  size?: 'default' | 'sm' | 'lg';
}

const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ variant = 'primary', loading = false, size = 'default', className, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: cn(
        "bg-primary text-primary-foreground hover:bg-primary-hover",
        "focus:ring-primary/20 shadow-grifo hover:shadow-grifo-hover",
        "hover:-translate-y-0.5"
      ),
      secondary: cn(
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        "focus:ring-secondary/20 border border-border"
      ),
      outline: cn(
        "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
        "focus:ring-primary/20"
      )
    };
    
    const sizes = {
      sm: "px-4 py-2 text-sm rounded-grifo-sm",
      default: "px-6 py-3 text-base rounded-grifo",
      lg: "px-8 py-4 text-lg rounded-grifo-lg"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

AuthButton.displayName = 'AuthButton';

export default AuthButton;