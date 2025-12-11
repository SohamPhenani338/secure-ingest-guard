import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-border/50 bg-card',
    success: 'border-safe/30 bg-safe/5',
    warning: 'border-suspicious/30 bg-suspicious/5',
    danger: 'border-threat/30 bg-threat/5',
  };

  const iconStyles = {
    default: 'text-primary',
    success: 'text-safe',
    warning: 'text-suspicious',
    danger: 'text-threat',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:shadow-lg',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-display tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 text-sm">
              <span
                className={cn(
                  trend === 'up' && 'text-safe',
                  trend === 'down' && 'text-threat',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'rounded-lg bg-secondary/50 p-3',
            iconStyles[variant]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/20 pointer-events-none" />
    </div>
  );
}
