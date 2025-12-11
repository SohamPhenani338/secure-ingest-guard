import { EmailAnalysis } from '@/types/email';
import { VerdictBadge } from './VerdictBadge';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Link,
  Paperclip,
  Brain,
  BarChart3,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailDetailPanelProps {
  email: EmailAnalysis | null;
}

export function EmailDetailPanel({ email }: EmailDetailPanelProps) {
  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Mail className="h-16 w-16 mb-4 opacity-20" />
        <p className="font-display">Select an email to view details</p>
      </div>
    );
  }

  const AuthCheck = ({ passed, label }: { passed: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {passed ? (
        <CheckCircle className="h-4 w-4 text-safe" />
      ) : (
        <XCircle className="h-4 w-4 text-threat" />
      )}
      <span className={cn(passed ? 'text-foreground' : 'text-threat')}>{label}</span>
    </div>
  );

  const ScoreBar = ({
    label,
    value,
    max = 1,
    variant = 'default',
  }: {
    label: string;
    value: number;
    max?: number;
    variant?: 'default' | 'danger' | 'success';
  }) => {
    const percentage = (value / max) * 100;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-mono">{(value * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              variant === 'danger' && 'bg-threat',
              variant === 'success' && 'bg-safe',
              variant === 'default' && 'bg-primary'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const isThreat = email.verdict === 'predicted_fraud' || email.verdict === 'predicted_phishing';

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-display font-bold">{email.subject}</h2>
            <p className="text-muted-foreground">From: {email.from}</p>
          </div>
          <VerdictBadge verdict={email.verdict} />
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {email.timestamp.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <span className={cn('font-mono', email.latencyMs > 200 ? 'text-suspicious' : 'text-safe')}>
              {email.latencyMs.toFixed(0)}ms
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <span className="text-muted-foreground">Confidence:</span>
            <span className={cn(isThreat ? 'text-threat' : 'text-safe')}>
              {(email.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Header Analysis */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold">Header Analysis</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3 p-4 rounded-lg bg-secondary/30">
            <h4 className="text-sm font-medium text-muted-foreground">Domain Verification</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From Domain:</span>
                <span className="font-mono">{email.fromDomain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Return-Path:</span>
                <span className={cn('font-mono', email.domainMismatch && 'text-threat')}>
                  {email.returnPathDomain}
                </span>
              </div>
              {email.domainMismatch && (
                <div className="flex items-center gap-1 text-threat text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  Domain mismatch detected
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-secondary/30">
            <h4 className="text-sm font-medium text-muted-foreground">Authentication</h4>
            <div className="space-y-2 text-sm">
              <AuthCheck passed={email.spfPass} label="SPF" />
              <AuthCheck passed={email.dkimPass} label="DKIM" />
              <AuthCheck passed={email.dmarcPass} label="DMARC" />
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Metadata Analysis */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold">Metadata Analysis</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
            <ScoreBar
              label="Sender Reputation"
              value={email.senderReputationScore / 100}
              variant={email.senderReputationScore < 50 ? 'danger' : 'success'}
            />
            <ScoreBar
              label="Time Anomaly"
              value={email.timeAnomalyScore}
              variant={email.timeAnomalyScore > 0.5 ? 'danger' : 'success'}
            />
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Links:</span>
              <span className="font-mono">{email.linkCount}</span>
              {email.suspiciousLinkCount > 0 && (
                <Badge variant="threat" className="text-[10px]">
                  {email.suspiciousLinkCount} suspicious
                </Badge>
              )}
            </div>

            {email.hasAttachments && (
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Attachments:</span>
                <div className="flex gap-1">
                  {email.attachmentTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={['.zip', '.html', '.js'].includes(type) ? 'suspicious' : 'neutral'}
                      className="text-[10px]"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {email.urgencyKeywords.length > 0 && (
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Urgency Keywords:</span>
                <div className="flex flex-wrap gap-1">
                  {email.urgencyKeywords.map((keyword) => (
                    <Badge key={keyword} variant="suspicious" className="text-[10px]">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Model Scores */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold">AI Model Scores</h3>
        </div>

        <div className="p-4 rounded-lg bg-secondary/30 space-y-4">
          <ScoreBar
            label="DistilBERT (Semantic)"
            value={email.distilbertScore}
            variant={email.distilbertScore > 0.5 ? 'danger' : 'success'}
          />
          <ScoreBar
            label="LightGBM (Metadata)"
            value={email.lightgbmScore}
            variant={email.lightgbmScore > 0.5 ? 'danger' : 'success'}
          />
          <Separator className="bg-border/30" />
          <ScoreBar
            label="Ensemble Score"
            value={email.ensembleScore}
            variant={email.ensembleScore > 0.5 ? 'danger' : 'success'}
          />
        </div>
      </div>

      {/* Body Preview */}
      <div className="space-y-2">
        <h3 className="font-display font-semibold">Email Preview</h3>
        <div className="p-4 rounded-lg bg-secondary/30 text-sm text-muted-foreground">
          {email.bodyPreview}
        </div>
      </div>
    </div>
  );
}
