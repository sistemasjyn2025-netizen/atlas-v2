import React from 'react';
import './tokens.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'secondary', size = 'md', fullWidth = false, icon, style, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 500,
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      opacity: props.disabled ? 0.5 : 1,
      transition: 'all var(--transition-fast)',
      border: '1px solid transparent',
      width: fullWidth ? '100%' : 'auto',
      outline: 'none',
      ...style,
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: '4px 8px', fontSize: '12px', height: '28px' },
      md: { padding: '6px 16px', fontSize: '13px', height: '32px' },
      lg: { padding: '8px 24px', fontSize: '14px', height: '40px' },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--color-accent-default)',
        color: 'var(--text-on-accent)',
      },
      secondary: {
        backgroundColor: 'var(--surface-secondary)',
        border: '1px solid var(--border-strong)',
        color: 'var(--text-primary)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
      },
      danger: {
        backgroundColor: 'transparent',
        border: '1px solid var(--color-error-default)',
        color: 'var(--color-error-default)',
      }
    };

    const [isHovered, setIsHovered] = React.useState(false);

    const activeStyle = {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };

    if (isHovered && !props.disabled) {
      if (variant === 'primary') activeStyle.backgroundColor = 'var(--color-accent-hover)';
      if (variant === 'secondary') activeStyle.backgroundColor = 'var(--surface-hover)';
      if (variant === 'ghost') activeStyle.color = 'var(--text-primary)';
      if (variant === 'danger') {
        activeStyle.backgroundColor = 'var(--color-error-default)';
        activeStyle.color = 'var(--text-on-accent)';
      }
    }

    return (
      <button
        ref={ref}
        style={activeStyle}
        onMouseEnter={(e) => { setIsHovered(true); props.onMouseEnter?.(e); }}
        onMouseLeave={(e) => { setIsHovered(false); props.onMouseLeave?.(e); }}
        {...props}
      >
        {icon && <span style={{ display: 'flex' }}>{icon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
