import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Database, Download, Play, CheckCircle, FileJson } from 'lucide-react';
import { SyntheticEmailRecord } from '@/types/email';
import { toast } from '@/hooks/use-toast';

const legitimateSubjects = [
  'Q4 Budget Review - Action Items',
  'Weekly Status Update',
  'Meeting Notes - Project Sync',
  'Invoice #12345 for your records',
  'Team Building Event RSVP',
  'Performance Review Schedule',
  'Client Feedback Summary',
  'Holiday Schedule Reminder',
  'IT Maintenance Window Notice',
  'New Policy Documentation',
];

const fraudSubjects = [
  'URGENT: Account Suspended - Verify Now!',
  'IMMEDIATE ACTION REQUIRED - Payment Failed',
  'Final Notice: Your account will be deleted',
  'Security Alert: Unusual activity detected',
  'You have won $500,000 - Claim NOW',
  'VERIFY YOUR IDENTITY IMMEDIATELY',
  'Your password expires in 24 hours',
  'Unauthorized login attempt - Action Required',
  'CEO Request: Urgent Wire Transfer Needed',
  'Tax Refund Pending - Confirm Details',
];

const legitimateBodies = [
  'Hi team, please find attached the quarterly report. Let me know if you have questions.',
  'As discussed in our last meeting, here are the action items for this week.',
  'Thank you for your recent purchase. Your invoice is attached for your records.',
  'This is a reminder about our upcoming team meeting scheduled for Friday.',
  'Please review the attached document and provide your feedback by EOD.',
];

const fraudBodies = [
  'Dear valued customer, your account requires immediate verification. Click the link below.',
  'We detected suspicious activity on your account. Verify your identity now to avoid suspension.',
  'Your payment method has been declined. Update your information immediately to continue service.',
  'As CEO, I need you to process this urgent wire transfer. Keep this confidential.',
  'Congratulations! You have been selected for a special prize. Click here to claim.',
];

const legitimateDomains = ['company.com', 'corp.net', 'business.org', 'enterprise.io'];
const suspiciousDomains = ['c0mpany.com', 'corp-secure.net', 'busines5.org', 'enterprize.io'];

const urgencyKeywords = ['URGENT', 'IMMEDIATE', 'ASAP', 'Final Notice', 'Action Required', 'Verify Now', 'Suspended'];

export function DatasetGenerator() {
  const [totalRecords, setTotalRecords] = useState(1000);
  const [fraudRatio, setFraudRatio] = useState(0.25);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedData, setGeneratedData] = useState<SyntheticEmailRecord[]>([]);

  const generateDataset = () => {
    setIsGenerating(true);
    setProgress(0);
    
    const records: SyntheticEmailRecord[] = [];
    const fraudCount = Math.round(totalRecords * fraudRatio);
    const legitCount = totalRecords - fraudCount;

    const generateRecord = (isFraud: boolean): SyntheticEmailRecord => {
      const domain = isFraud 
        ? suspiciousDomains[Math.floor(Math.random() * suspiciousDomains.length)]
        : legitimateDomains[Math.floor(Math.random() * legitimateDomains.length)];
      
      const returnPathDomain = isFraud && Math.random() > 0.3
        ? suspiciousDomains[Math.floor(Math.random() * suspiciousDomains.length)]
        : domain;

      return {
        label: isFraud ? 1 : 0,
        subject_line: isFraud
          ? fraudSubjects[Math.floor(Math.random() * fraudSubjects.length)]
          : legitimateSubjects[Math.floor(Math.random() * legitimateSubjects.length)],
        email_body: isFraud
          ? fraudBodies[Math.floor(Math.random() * fraudBodies.length)]
          : legitimateBodies[Math.floor(Math.random() * legitimateBodies.length)],
        from_domain: domain,
        return_path_domain: returnPathDomain,
        domain_mismatch_flag: domain !== returnPathDomain,
        sender_reputation_score: isFraud ? Math.random() * 40 : 60 + Math.random() * 40,
        time_anomaly_score: isFraud ? 0.5 + Math.random() * 0.5 : Math.random() * 0.3,
        attachment_type: isFraud && Math.random() > 0.6 ? '.zip' : '.pdf',
        urgency_keywords: isFraud 
          ? urgencyKeywords.filter(() => Math.random() > 0.7)
          : [],
        has_links: Math.random() > 0.3,
        link_count: isFraud ? 2 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 3),
      };
    };

    // Simulate generation with progress
    let generated = 0;
    const batchSize = 50;
    
    const generateBatch = () => {
      const remaining = totalRecords - generated;
      const batch = Math.min(batchSize, remaining);
      
      for (let i = 0; i < batch; i++) {
        const isFraud = generated < fraudCount;
        records.push(generateRecord(isFraud));
        generated++;
      }

      // Shuffle occasionally to mix legit and fraud
      if (generated % 200 === 0) {
        for (let i = records.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [records[i], records[j]] = [records[j], records[i]];
        }
      }

      setProgress((generated / totalRecords) * 100);

      if (generated < totalRecords) {
        requestAnimationFrame(generateBatch);
      } else {
        setGeneratedData(records);
        setIsGenerating(false);
        toast({
          title: 'Dataset Generated',
          description: `Successfully generated ${totalRecords} synthetic email records.`,
        });
      }
    };

    requestAnimationFrame(generateBatch);
  };

  const downloadDataset = () => {
    const json = JSON.stringify(generatedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safecheck_synthetic_dataset.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download Started',
      description: 'Your synthetic dataset is downloading.',
    });
  };

  const legitCount = Math.round(totalRecords * (1 - fraudRatio));
  const fraudCount = Math.round(totalRecords * fraudRatio);

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold">Synthetic Dataset Generator</h2>
          <p className="text-sm text-muted-foreground">Generate training data for the hybrid AI model</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="records">Total Records</Label>
            <Input
              id="records"
              type="number"
              value={totalRecords}
              onChange={(e) => setTotalRecords(Math.max(100, parseInt(e.target.value) || 1000))}
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Fraud/Phishing Ratio</Label>
              <span className="text-sm font-mono text-muted-foreground">{(fraudRatio * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[fraudRatio * 100]}
              onValueChange={(v) => setFraudRatio(v[0] / 100)}
              max={50}
              min={10}
              step={5}
              className="py-2"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Badge variant="safe" className="gap-1">
              <span className="font-mono">{legitCount}</span> Legitimate
            </Badge>
            <Badge variant="threat" className="gap-1">
              <span className="font-mono">{fraudCount}</span> Fraud/Phishing
            </Badge>
          </div>
        </div>

        {/* Generation Status */}
        <div className="space-y-4">
          {isGenerating ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                <span className="text-sm">Generating dataset...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground font-mono">
                {Math.round((progress / 100) * totalRecords)} / {totalRecords} records
              </p>
            </div>
          ) : generatedData.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-safe">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Dataset Ready</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {generatedData.length} records generated with {generatedData.filter(r => r.label === 1).length} fraud samples
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">Configure and generate your dataset</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={generateDataset}
              disabled={isGenerating}
              variant="glow"
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
            <Button
              onClick={downloadDataset}
              disabled={generatedData.length === 0}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      {generatedData.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sample Preview</span>
          </div>
          <pre className="p-4 rounded-lg bg-secondary/50 text-xs font-mono overflow-auto max-h-48">
            {JSON.stringify(generatedData.slice(0, 2), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
