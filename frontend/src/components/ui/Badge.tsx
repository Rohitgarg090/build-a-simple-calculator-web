import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'primary';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  default: {
    bg: 'bg-[#2e2e3d]',
    text: 'text-[#f1f1f5]',
    border: 'border-[#3e3e50]',
    dot: 'bg-[#f1f1f5]',
  },
  primary: {
    bg: 'bg-[#6366f1]/20',
    text: 'text-[#6366f1]',
    border: 'border-[#6366f1]/30',
    dot: 'bg-[#6366f1]',
  },
  success: {
    bg: 'bg-[#22c55e]/20',
    text: 'text-[#22c55e]',
    border: 'border-[#22c55e]/30',
    dot: 'bg-[#22c55e]',
  },
  warning: {
    bg: 'bg-[#f59e0b]/20',
    text: 'text-[#f59e0b]',
    border: 'border-[#f59e0b]/30',
    dot: 'bg-[#f59e0b]',
  },
  error: {
    bg: 'bg-[#ef4444]/20',
    text: 'text-[#ef4444]',
    border: 'border-[#ef4444]/30',
    dot: 'bg-[#ef4444]',
  },
};

const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

const dotSizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  dot = false,
  size = 'md',
}) => {
  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const dotSize = dotSizeStyles[size];

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${styles.bg} ${styles.text} ${styles.border}
        ${sizeStyle}
        transition-all duration-200
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            ${dotSize} rounded-full flex-shrink-0
            ${styles.dot}
            animate-pulse
          `}
        />
      )}
      {children}
    </span>
  );
};

export { Badge };
export type { BadgeVariant, BadgeProps };
export default Badge;