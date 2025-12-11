import { Badge } from '@/components/ui/badge';
import { VerdictType } from '@/types/email';
import { ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: VerdictType;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

const verdictConfig = {
  legit: {
    label: 'Legit',
    variant: 'safe' as const,
    icon: ShieldCheck,
  },
  predicted_legit: {
    label: 'Predicted Legit',
    variant: 'safe' as const,
    icon: ShieldQuestion,
  },
  predicted_fraud: {
    label: 'Predicted Fraud',
    variant: 'threat' as const,
    icon: ShieldAlert,
  },
  predicted_phishing: {
    label: 'Predicted Phishing',
    variant: 'threat' as const,
    icon: ShieldX,
  },
};

export function VerdictBadge({ verdict, showIcon = true, size = 'default' }: VerdictBadgeProps) {
  const config = verdictConfig[verdict];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}
    >
      {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1.5'} />}
      {config.label}
    </Badge>
  );
}
