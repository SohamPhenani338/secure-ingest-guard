import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { TriageLog } from '@/components/TriageLog';
import { EmailDetailPanel } from '@/components/EmailDetailPanel';
import { LatencyGauge } from '@/components/LatencyGauge';
import { DatasetGenerator } from '@/components/DatasetGenerator';
import { generateMockEmails, calculateMetrics, generateMockEmail } from '@/lib/mockData';
import { EmailAnalysis } from '@/types/email';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [emails, setEmails] = useState<EmailAnalysis[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailAnalysis | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    const initialEmails = generateMockEmails(25);
    setEmails(initialEmails);
  }, []);

  // Simulate live email ingestion
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const isThreat = Math.random() > 0.75;
      const newEmail = generateMockEmail(isThreat);
      setEmails((prev) => [newEmail, ...prev].slice(0, 100));

      if (isThreat) {
        toast({
          title: 'Threat Detected',
          description: `${newEmail.verdict === 'predicted_fraud' ? 'Fraud' : 'Phishing'} attempt from ${newEmail.from}`,
          variant: 'destructive',
        });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleConnect = () => {
    if (isConnected) {
      setIsConnected(false);
      setIsLive(false);
      toast({
        title: 'Disconnected',
        description: 'Gmail integration disabled',
      });
    } else {
      // Simulate OAuth flow
      toast({
        title: 'Gmail Integration',
        description: 'OAuth flow would launch here. Using mock data for demo.',
      });
      setIsConnected(true);
      setIsLive(true);
    }
  };

  const metrics = calculateMetrics(emails);

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Background glow effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Header isConnected={isConnected} onConnect={handleConnect} />

      <main className="container mx-auto px-6 py-8 space-y-8 relative">
        {/* Hero Section */}
        <section id="dashboard" className="space-y-2 animate-fade-in">
          <h2 className="text-3xl font-display font-bold">
            Detection <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="text-muted-foreground">
            Real-time BEC and phishing detection with hybrid AI analysis
          </p>
        </section>

        {/* Metrics Grid */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <MetricCard
            title="Emails Analyzed"
            value={metrics.totalAnalyzed}
            subtitle="Last 7 days"
            icon={Activity}
            trend="up"
            trendValue="+12%"
          />
          <MetricCard
            title="Threats Detected"
            value={metrics.threatsDetected}
            subtitle={`${((metrics.threatsDetected / metrics.totalAnalyzed) * 100).toFixed(1)}% of total`}
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
              {isLive && (
                <div className="flex items-center gap-2 text-sm text-safe">
                  <div className="h-2 w-2 rounded-full bg-safe animate-pulse" />
                  Live Monitoring
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
