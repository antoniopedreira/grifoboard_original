import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, showPasswordToggle = false, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const inputType = showPasswordToggle 
      ? (showPassword ? 'text' : 'password') 
      : type;

    return (
      <div className="space-y-2">
        <label className="grifo-small font-medium text-accent block">
          {label}
        </label>
        
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              // Base styles
              "w-full px-4 py-3 rounded-grifo border bg-background text-foreground",
              "transition-all duration-200 placeholder:text-muted-foreground",
              // Focus styles with golden glow
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "focus:shadow-focus-ring",
              // Error styles
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              // Default border
              !error && "border-border",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {/* Password Toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;