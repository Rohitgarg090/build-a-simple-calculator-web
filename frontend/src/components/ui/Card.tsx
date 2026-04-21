import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

const shadowMap = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-xl',
        'bg-[#1c1c24]',
        border ? 'border border-[#2e2e3d]' : '',
        paddingMap[padding],
        shadowMap[shadow],
        hover
          ? 'transition-all duration-200 hover:border-[#6366f1]/50 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.2)] cursor-pointer'
          : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        boxShadow:
          shadow !== 'none'
            ? '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)'
            : undefined,
      }}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  divider = false,
}) => {
  return (
    <div
      className={[
        'mb-4',
        divider ? 'pb-4 border-b border-[#2e2e3d]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  subtitle,
}) => {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-[#f1f1f5] leading-tight">
        {children}
      </h3>
      {subtitle && (
        <p className="mt-1 text-sm text-[#f1f1f5]/50">{subtitle}</p>
      )}
    </div>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={['text-[#f1f1f5]/80 text-sm leading-relaxed', className].join(' ')}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
  align?: 'left' | 'center' | 'right' | 'between';
}

const footerAlignMap = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  divider = false,
  align = 'right',
}) => {
  return (
    <div
      className={[
        'mt-4 flex items-center gap-3',
        footerAlignMap[align],
        divider ? 'pt-4 border-t border-[#2e2e3d]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
};

interface CardBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'danger' | 'neutral';
  className?: string;
}

const badgeVariantMap = {
  primary: 'bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/30',
  accent: 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
  neutral: 'bg-[#2e2e3d] text-[#f1f1f5]/60 border border-[#2e2e3d]',
};

export const CardBadge: React.FC<CardBadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        badgeVariantMap[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
};

export default Card;