export type SocialPlatform = 'Instagram' | 'Twitter/X' | 'LinkedIn' | 'TikTok' | 'Facebook' | 'Custom';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'SUSPICIOUS' | 'LOW' | 'MINIMAL';

export type VerdictBadge = 'FAKE' | 'REAL' | 'SUSPICIOUS';

export interface AccountProfileInput {
  platform: SocialPlatform;
  username: string;
  full_name?: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
  account_age_days: number;
  has_avatar: boolean;
  has_bio?: boolean;
  has_url?: boolean;
  external_url?: string;
  email?: string;
  avg_likes?: number;
  is_verified?: boolean;
}

export interface ExtractedFeatures {
  username: string;
  full_name: string;
  bio_length: number;
  has_bio: boolean;
  has_avatar: boolean;
  has_url: boolean;
  is_suspicious_url: boolean;
  followers: number;
  following: number;
  follow_ratio: number;
  posts: number;
  account_age_days: number;
  posts_per_day: number;
  digits_ratio: number;
  has_consecutive_digits: boolean;
  has_entropy_pattern: boolean;
  name_similarity: number;
  engagement_rate: number;
  is_disposable_email: boolean;
  email_domain: string;
  is_verified: boolean;
  log_followers: number;
  log_following: number;
}

export interface RiskFactor {
  factor: string;
  impact: 'INCREASES_RISK' | 'REDUCES_RISK';
  weight: number;
  explanation: string;
}

export interface ModelMetadata {
  model_name: string;
  version: string;
  algorithm: string;
  benchmark: string;
  accuracy: number;
  roc_auc: number;
  evaluated_at: string;
}

export interface PredictionResult {
  verdict: string;
  verdict_badge: VerdictBadge;
  is_fake: boolean;
  risk_score: number; // 0 to 100
  risk_level: RiskLevel;
  fake_probability: number;
  confidence_percentage: number;
  summary: string;
  extracted_features: ExtractedFeatures;
  top_risk_factors: RiskFactor[];
  anomalies_detected: string[];
  recommendations: string[];
  model_metadata: ModelMetadata;
}

export type AuditStatus = 'ACTION_REQUIRED' | 'RESOLVED' | 'UNDER_REVIEW' | 'WHITELISTED';

export interface ScanAuditRecord {
  id: string; // e.g. AUD-2026-9281
  timestamp: string; // ISO date
  profile: AccountProfileInput;
  result: PredictionResult;
  status: AuditStatus;
  analyst_notes?: string;
  tags?: string[];
  execution_source?: 'PYTHON_ML_SERVICE' | 'LOCAL_HYBRID_ENGINE';
}

export interface PresetScenario {
  id: string;
  title: string;
  badge: 'Bot Farm' | 'Verified Organic' | 'Impersonator' | 'Engagement Farm' | 'Casual User';
  description: string;
  profile: AccountProfileInput;
}
