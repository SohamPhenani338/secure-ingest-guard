import { useState } from 'react';
import { EmailAnalysis, VerdictType } from '@/types/email';
import { VerdictBadge } from './VerdictBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TriageLogProps {
  emails: EmailAnalysis[];
  onSelectEmail: (email: EmailAnalysis) => void;
  selectedEmailId?: string;
}

export function TriageLog({ emails, onSelectEmail, selectedEmailId }: TriageLogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<VerdictType | 'all'>('all');

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerdict = verdictFilter === 'all' || email.verdict === verdictFilter;
    return matchesSearch && matchesVerdict;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
        <Select value={verdictFilter} onValueChange={(v) => setVerdictFilter(v as VerdictType | 'all')}>
          <SelectTrigger className="w-[180px] bg-secondary/50 border-border/50">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by verdict" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verdicts</SelectItem>
            <SelectItem value="legit">Legit</SelectItem>
            <SelectItem value="predicted_legit">Predicted Legit</SelectItem>
            <SelectItem value="predicted_fraud">Predicted Fraud</SelectItem>
            <SelectItem value="predicted_phishing">Predicted Phishing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="w-[180px] font-display">Time</TableHead>
              <TableHead className="font-display">Sender</TableHead>
              <TableHead className="font-display">Subject</TableHead>
              <TableHead className="w-[160px] font-display">Verdict</TableHead>
              <TableHead className="w-[100px] text-right font-display">Latency</TableHead>
              <TableHead className="w-[80px] font-display">Flags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmails.map((email) => (
              <TableRow
                key={email.id}
                className={cn(
                  'cursor-pointer transition-colors',
                  selectedEmailId === email.id && 'bg-primary/10',
                  (email.verdict === 'predicted_fraud' || email.verdict === 'predicted_phishing') &&
                    'border-l-2 border-l-threat'
                )}
                onClick={() => onSelectEmail(email)}
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {formatTime(email.timestamp)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[200px]">{email.from}</span>
                    {email.domainMismatch && (
                      <span className="text-xs text-threat flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Domain mismatch
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="truncate max-w-[300px]">{email.subject}</TableCell>
                <TableCell>
                  <VerdictBadge verdict={email.verdict} size="sm" />
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  <span
                    className={cn(
                      email.latencyMs > 200 ? 'text-suspicious' : 'text-safe'
                    )}
                  >
                    {email.latencyMs.toFixed(0)}ms
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {email.hasAttachments && (
                      <Badge variant="outline" className="text-[10px] px-1.5">📎</Badge>
                    )}
                    {email.urgencyKeywords.length > 0 && (
                      <Badge variant="suspicious" className="text-[10px] px-1.5">⚡</Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 text-sm text-muted-foreground">
        Showing {filteredEmails.length} of {emails.length} emails
      </div>
    </div>
  );
}
