import { EmailAnalysis, VerdictType, PerformanceMetrics } from '@/types/email';

const generateId = () => Math.random().toString(36).substring(2, 15);

const verdicts: VerdictType[] = ['legit', 'predicted_legit', 'predicted_fraud', 'predicted_phishing'];

const legitimateDomains = ['company.com', 'microsoft.com', 'google.com', 'amazon.com', 'salesforce.com'];
const suspiciousDomains = ['c0mpany.com', 'micros0ft.com', 'g00gle.com', 'amaz0n.com', 'update-account.com'];

const legitimateSubjects = [
  'Q4 Budget Review Meeting - Thursday 2pm',
  'Weekly Team Standup Notes',
  'Project Milestone Update',
  'Your invoice for October',
  'Meeting rescheduled to Friday',
];

const phishingSubjects = [
  'URGENT: Your account will be suspended!',
  'IMMEDIATE ACTION REQUIRED - Verify your identity',
  'Final Notice: Payment overdue',
  'You have won $1,000,000!',
  'Security Alert: Unusual sign-in activity',
];

const urgencyKeywordsList = ['URGENT', 'IMMEDIATE', 'ASAP', 'Final Notice', 'Action Required', 'Suspended', 'Verify Now'];

export function generateMockEmail(isThreat: boolean = false): EmailAnalysis {
  const domain = isThreat 
    ? suspiciousDomains[Math.floor(Math.random() * suspiciousDomains.length)]
    : legitimateDomains[Math.floor(Math.random() * legitimateDomains.length)];
  
  const returnPathDomain = isThreat 
    ? suspiciousDomains[Math.floor(Math.random() * suspiciousDomains.length)]
    : domain;

  const verdict: VerdictType = isThreat 
    ? (Math.random() > 0.5 ? 'predicted_fraud' : 'predicted_phishing')
    : (Math.random() > 0.3 ? 'legit' : 'predicted_legit');

  const confidence = isThreat 
    ? 0.75 + Math.random() * 0.24
    : 0.85 + Math.random() * 0.14;

  const subject = isThreat
    ? phishingSubjects[Math.floor(Math.random() * phishingSubjects.length)]
    : legitimateSubjects[Math.floor(Math.random() * legitimateSubjects.length)];

  const urgencyKeywords = isThreat
    ? urgencyKeywordsList.filter(() => Math.random() > 0.6)
    : [];

  return {
    id: generateId(),
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
    from: `sender@${domain}`,
    fromDomain: domain,
    returnPath: `bounce@${returnPathDomain}`,
    returnPathDomain,
    replyTo: `reply@${isThreat ? suspiciousDomains[0] : domain}`,
    subject,
    bodyPreview: isThreat 
      ? 'Dear valued customer, your account requires immediate verification...'
      : 'Hi team, please find attached the updated project timeline...',
    verdict,
    confidence,
    latencyMs: 50 + Math.random() * 200,
    
    domainMismatch: isThreat && Math.random() > 0.3,
    spfPass: !isThreat || Math.random() > 0.7,
    dkimPass: !isThreat || Math.random() > 0.6,
    dmarcPass: !isThreat || Math.random() > 0.8,
    
    senderReputationScore: isThreat ? Math.random() * 40 : 60 + Math.random() * 40,
    timeAnomalyScore: isThreat ? 0.5 + Math.random() * 0.5 : Math.random() * 0.3,
    urgencyKeywords,
    hasAttachments: Math.random() > 0.6,
    attachmentTypes: isThreat && Math.random() > 0.5 ? ['.zip', '.html'] : ['.pdf', '.docx'],
    linkCount: isThreat ? 3 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 3),
    suspiciousLinkCount: isThreat ? 1 + Math.floor(Math.random() * 3) : 0,
    
    sentimentScore: isThreat ? -0.3 - Math.random() * 0.5 : 0.1 + Math.random() * 0.4,
    urgencyLevel: isThreat 
      ? (['high', 'critical'] as const)[Math.floor(Math.random() * 2)]
      : (['low', 'medium'] as const)[Math.floor(Math.random() * 2)],
    
    distilbertScore: isThreat ? 0.7 + Math.random() * 0.29 : Math.random() * 0.3,
    lightgbmScore: isThreat ? 0.65 + Math.random() * 0.34 : Math.random() * 0.25,
    ensembleScore: isThreat ? 0.72 + Math.random() * 0.27 : Math.random() * 0.28,
  };
}

export function generateMockEmails(count: number): EmailAnalysis[] {
  const emails: EmailAnalysis[] = [];
  for (let i = 0; i < count; i++) {
    const isThreat = Math.random() > 0.75;
    emails.push(generateMockEmail(isThreat));
  }
  return emails.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function calculateMetrics(emails: EmailAnalysis[]): PerformanceMetrics {
  const threats = emails.filter(e => e.verdict === 'predicted_fraud' || e.verdict === 'predicted_phishing');
  const latencies = emails.map(e => e.latencyMs).sort((a, b) => a - b);
  
  return {
    totalAnalyzed: emails.length,
    threatsDetected: threats.length,
    averageLatencyMs: emails.reduce((acc, e) => acc + e.latencyMs, 0) / emails.length,
    p95LatencyMs: latencies[Math.floor(latencies.length * 0.95)] || 0,
    falsePositiveRate: 0.028,
    recall: 0.967,
    precision: 0.943,
  };
}
