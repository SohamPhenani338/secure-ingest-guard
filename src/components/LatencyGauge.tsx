import { cn } from '@/lib/utils';
import { Gauge } from 'lucide-react';

interface LatencyGaugeProps {
  current: number;
  p95: number;
  target?: number;
}

export function LatencyGauge({ current, p95, target = 300 }: LatencyGaugeProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isGood = current < target * 0.7;
  const isWarning = current >= target * 0.7 && current < target;
  const isBad = current >= target;

  const getColor = () => {
    if (isGood) return 'text-safe';
    if (isWarning) return 'text-suspicious';
    return 'text-threat';
  };

  const getArcColor = () => {
    if (isGood) return 'stroke-safe';
    if (isWarning) return 'stroke-suspicious';
    return 'stroke-threat';
  };

  // SVG arc calculation
  const radius = 45;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-border/50 bg-card">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Gauge className="h-4 w-4" />
        <span className="text-sm font-medium">Latency Monitor</span>
      </div>

      <div className="relative w-32 h-20">
        <svg viewBox="0 0 100 55" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            className="stroke-secondary"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            className={cn('transition-all duration-500', getArcColor())}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className={cn('text-2xl font-bold font-mono', getColor())}>
            {current.toFixed(0)}
            <span className="text-sm text-muted-foreground">ms</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full text-center text-sm">
        <div>
          <p className="text-muted-foreground">P95</p>
          <p className="font-mono font-medium">{p95.toFixed(0)}ms</p>
        </div>
        <div>
          <p className="text-muted-foreground">Target</p>
          <p className="font-mono font-medium text-safe">&lt;{target}ms</p>
        </div>
      </div>
    </div>
  );
}
