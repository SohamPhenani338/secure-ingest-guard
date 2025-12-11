export type VerdictType = 'legit' | 'predicted_legit' | 'predicted_fraud' | 'predicted_phishing';

export interface EmailAnalysis {
  id: string;
  timestamp: Date;
  from: string;
  fromDomain: string;
  returnPath: string;
  returnPathDomain: string;
  replyTo: string;
  subject: string;
  bodyPreview: string;
  verdict: VerdictType;
  confidence: number;
  latencyMs: number;
  
  // Header Analysis
  domainMismatch: boolean;
  spfPass: boolean;
  dkimPass: boolean;
  dmarcPass: boolean;
  
  // Metadata Features
  senderReputationScore: number;
  timeAnomalyScore: number;
  urgencyKeywords: string[];
  hasAttachments: boolean;
  attachmentTypes: string[];
  linkCount: number;
  suspiciousLinkCount: number;
  
  // NLP Features
  sentimentScore: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Model Scores
  distilbertScore: number;
  lightgbmScore: number;
  ensembleScore: number;
}

export interface PerformanceMetrics {
  totalAnalyzed: number;
  threatsDetected: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  falsePositiveRate: number;
  recall: number;
  precision: number;
}

export interface SyntheticEmailRecord {
  label: 0 | 1;
  subject_line: string;
  email_body: string;
  from_domain: string;
  return_path_domain: string;
  domain_mismatch_flag: boolean;
  sender_reputation_score: number;
  time_anomaly_score: number;
  attachment_type: string;
  urgency_keywords: string[];
  has_links: boolean;
  link_count: number;
}
