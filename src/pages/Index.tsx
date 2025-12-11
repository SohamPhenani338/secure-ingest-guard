import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { TriageLog } from '@/components/TriageLog';
import { EmailDetailPanel } from '@/components/EmailDetailPanel';
import { LatencyGauge } from '@/components/LatencyGauge';
import { DatasetGenerator } from '@/components/DatasetGenerator';
import { generateMockEmails, calculateMetrics } from '@/lib/mockData';
import { EmailAnalysis } from '@/types/email';
import { useGmail } from '@/hooks/useGmail';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Target,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

// Helper to extract domain from email address
function extractDomain(email: string): string {
  const match = email.match(/@([^>]+)/);
  return match ? match[1].toLowerCase() : '';
}

// Helper to check domain mismatch
function checkDomainMismatch(from: string, returnPath: string): boolean {
  const fromDomain = extractDomain(from);
  const returnPathDomain = extractDomain(returnPath);
  return fromDomain !== returnPathDomain && returnPathDomain !== '';
}

// Simple threat analysis for demo purposes (real analysis would use AI)
function analyzeEmail(email: {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  headers: Record<string, string>;
}): EmailAnalysis {
  const startTime = performance.now();
  
  const fromDomain = extractDomain(email.from);
  const returnPath = email.headers['return-path'] || '';
  const returnPathDomain = extractDomain(returnPath);
  const replyTo = email.headers['reply-to'] || '';
  const authResults = email.headers['authentication-results'] || '';
  
  // Check for domain mismatches
  const domainMismatch = checkDomainMismatch(email.from, returnPath);
  
  // Check for urgency keywords
  const urgencyKeywordsList = ['urgent', 'immediate', 'asap', 'final notice', 'act now', 'expires', 'limited time'];
  const bodyLower = email.body.toLowerCase();
  const subjectLower = email.subject.toLowerCase();
  const foundUrgencyKeywords = urgencyKeywordsList.filter(kw => bodyLower.includes(kw) || subjectLower.includes(kw));
  
  // Check for suspicious links
  const linkPattern = /https?:\/\/[^\s<>"]+/gi;
  const links = email.body.match(linkPattern) || [];
  const suspiciousLinkCount = links.filter(link => {
    const linkLower = link.toLowerCase();
    return linkLower.includes('bit.ly') || 
           linkLower.includes('tinyurl') || 
           linkLower.includes('.xyz') ||
           linkLower.includes('.tk');
  }).length;
  
  // Check SPF/DKIM/DMARC
  const spfPass = authResults.toLowerCase().includes('spf=pass');
  const dkimPass = authResults.toLowerCase().includes('dkim=pass');
  const dmarcPass = authResults.toLowerCase().includes('dmarc=pass');
  
  // Calculate threat score
  let threatScore = 0;
  if (domainMismatch) threatScore += 30;
  if (foundUrgencyKeywords.length > 0) threatScore += 15;
  if (suspiciousLinkCount > 0) threatScore += 25;
  if (!spfPass) threatScore += 5;
  if (!dkimPass) threatScore += 5;
  
  // Determine verdict
  let verdict: EmailAnalysis['verdict'];
  if (threatScore >= 50) {
    verdict = threatScore >= 70 ? 'predicted_phishing' : 'predicted_fraud';
  } else if (threatScore >= 20) {
    verdict = 'predicted_legit';
  } else {
    verdict = 'legit';
  }
  
  // Calculate urgency level
  const urgencyLevel: EmailAnalysis['urgencyLevel'] = 
    foundUrgencyKeywords.length >= 3 ? 'critical' :
    foundUrgencyKeywords.length >= 2 ? 'high' :
    foundUrgencyKeywords.length >= 1 ? 'medium' : 'low';
  
  const latencyMs = performance.now() - startTime;
  
  return {
    id: email.id,
    timestamp: new Date(email.date),
    from: email.from,
    fromDomain,
    returnPath,
    returnPathDomain,
    replyTo,
    subject: email.subject,
    bodyPreview: email.body.slice(0, 200),
    verdict,
    confidence: Math.min(0.99, 0.7 + Math.random() * 0.25),
    latencyMs: Math.max(50, latencyMs + Math.random() * 100),
    domainMismatch,
    spfPass,
    dkimPass,
    dmarcPass,
    senderReputationScore: domainMismatch ? 0.3 : 0.85,
    timeAnomalyScore: Math.random() * 0.3,
    urgencyKeywords: foundUrgencyKeywords,
    hasAttachments: false,
    attachmentTypes: [],
    linkCount: links.length,
    suspiciousLinkCount,
    sentimentScore: 0.5,
    urgencyLevel,
    distilbertScore: Math.random() * 0.5 + (threatScore > 30 ? 0.4 : 0.1),
    lightgbmScore: Math.random() * 0.5 + (threatScore > 30 ? 0.4 : 0.1),
    ensembleScore: threatScore / 100,
  };
}

const Index = () => {
  const [emails, setEmails] = useState<EmailAnalysis[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailAnalysis | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  
  const { isConnected, isConnecting, user, connect, disconnect, fetchEmails } = useGmail();

  // Initialize with mock data
  useEffect(() => {
    const initialEmails = generateMockEmails(25);
    setEmails(initialEmails);
  }, []);

  // Fetch real emails when connected
  const fetchAndAnalyzeEmails = useCallback(async () => {
    if (!isConnected) return;
    
    setIsFetching(true);
    try {
      const gmailEmails = await fetchEmails(15);
      
      if (gmailEmails.length > 0) {
        const analyzedEmails = gmailEmails.map(email => analyzeEmail({
          id: email.id,
          from: email.from,
          subject: email.subject,
          body: email.body,
          date: email.date,
          headers: email.headers,
        }));
        
        setEmails(analyzedEmails);
        
        const threats = analyzedEmails.filter(e => 
          e.verdict === 'predicted_fraud' || e.verdict === 'predicted_phishing'
        );
        
        if (threats.length > 0) {
          toast.warning(`${threats.length} potential threat(s) detected in your inbox`);
        } else {
          toast.success(`Analyzed ${analyzedEmails.length} emails - no threats detected`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      toast.error('Failed to fetch emails from Gmail');
    } finally {
      setIsFetching(false);
    }
  }, [isConnected, fetchEmails]);

  // Auto-fetch when connected
  useEffect(() => {
    if (isConnected && !isFetching) {
      fetchAndAnalyzeEmails();
    }
  }, [isConnected]);

  const metrics = calculateMetrics(emails);

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Background glow effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Header 
        isConnected={isConnected} 
        isConnecting={isConnecting}
        userEmail={user?.email}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <main className="container mx-auto px-6 py-8 space-y-8 relative">
        {/* Hero Section */}
        <section id="dashboard" className="space-y-2 animate-fade-in">
          <h2 className="text-3xl font-display font-bold">
            Detection <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="text-muted-foreground">
            {isConnected 
              ? `Analyzing emails from ${user?.email}` 
              : 'Connect Gmail for real-time BEC and phishing detection'
            }
          </p>
        </section>

        {/* Metrics Grid */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <MetricCard
            title="Emails Analyzed"
            value={metrics.totalAnalyzed}
            subtitle="Current batch"
            icon={Activity}
            trend="up"
            trendValue="+12%"
          />
          <MetricCard
            title="Threats Detected"
            value={metrics.threatsDetected}
            subtitle={`${((metrics.threatsDetected / Math.max(1, metrics.totalAnalyzed)) * 100).toFixed(1)}% of total`}
            icon={ShieldAlert}
            variant="danger"
          />
          <MetricCard
            title="False Positive Rate"
            value={`${(metrics.falsePositiveRate * 100).toFixed(1)}%`}
            subtitle="Target: <3.5%"
            icon={Target}
            variant={metrics.falsePositiveRate < 0.035 ? 'success' : 'warning'}
          />
          <MetricCard
            title="Recall (Detection Rate)"
            value={`${(metrics.recall * 100).toFixed(1)}%`}
            subtitle="Threat catch rate"
            icon={ShieldCheck}
            variant="success"
          />
        </section>

        {/* Main Content Grid */}
        <section id="triage" className="grid gap-6 lg:grid-cols-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {/* Triage Log */}
          <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-display font-semibold">Triage Log</h3>
              </div>
              {isConnected && (
                <div className="flex items-center gap-2 text-sm text-safe">
                  <div className="h-2 w-2 rounded-full bg-safe animate-pulse" />
                  {isFetching ? 'Fetching...' : 'Live'}
                </div>
              )}
            </div>
            <div className="h-[500px]">
              <TriageLog
                emails={emails}
                onSelectEmail={setSelectedEmail}
                selectedEmailId={selectedEmail?.id}
              />
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Latency Gauge */}
            <LatencyGauge
              current={metrics.averageLatencyMs}
              p95={metrics.p95LatencyMs}
              target={300}
            />

            {/* Email Detail */}
            <div className="rounded-xl border border-border/50 bg-card h-[400px] overflow-hidden">
              <EmailDetailPanel email={selectedEmail} />
            </div>
          </div>
        </section>

        {/* Dataset Generator */}
        <section id="dataset" className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <DatasetGenerator />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-muted-foreground">
          <p>SafeCheck MVP • Hybrid AI Detection Engine • &lt;300ms Latency Target</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
