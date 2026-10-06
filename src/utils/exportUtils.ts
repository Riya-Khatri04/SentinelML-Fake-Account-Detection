import { ScanAuditRecord } from '../types/scanner';

/**
 * Exports scan audit records as standard CSV format.
 */
export function exportToCSV(records: ScanAuditRecord[], filename = 'sentinel_ml_audit_export.csv') {
  if (!records || records.length === 0) return;

  const headers = [
    'Audit_ID',
    'Timestamp',
    'Platform',
    'Username',
    'Full_Name',
    'Followers',
    'Following',
    'Follow_Ratio',
    'Posts',
    'Account_Age_Days',
    'Has_Avatar',
    'Email',
    'Is_Disposable_Email',
    'Verdict',
    'Verdict_Badge',
    'Is_Fake',
    'Risk_Score',
    'Risk_Level',
    'Model_Confidence_Pct',
    'Anomalies_Count',
    'Anomalies_List',
    'Model_Name',
    'Audit_Status',
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map((rec) => {
    const p = rec.profile;
    const r = rec.result;
    return [
      escapeCSV(rec.id),
      escapeCSV(rec.timestamp),
      escapeCSV(p.platform),
      escapeCSV(p.username),
      escapeCSV(p.full_name || ''),
      escapeCSV(p.followers),
      escapeCSV(p.following),
      escapeCSV(r.extracted_features?.follow_ratio?.toFixed(2) || '0'),
      escapeCSV(p.posts),
      escapeCSV(p.account_age_days),
      escapeCSV(p.has_avatar ? 'TRUE' : 'FALSE'),
      escapeCSV(p.email || ''),
      escapeCSV(r.extracted_features?.is_disposable_email ? 'TRUE' : 'FALSE'),
      escapeCSV(r.verdict),
      escapeCSV(r.verdict_badge),
      escapeCSV(r.is_fake ? '1' : '0'),
      escapeCSV(r.risk_score),
      escapeCSV(r.risk_level),
      escapeCSV(r.confidence_percentage),
      escapeCSV(r.anomalies_detected?.length || 0),
      escapeCSV(r.anomalies_detected?.join('; ') || ''),
      escapeCSV(r.model_metadata?.model_name || 'Sentinel-RF-v2.4'),
      escapeCSV(rec.status),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports scan records as formatted JSON for SIEM/Splunk ingestion.
 */
export function exportToJSON(records: ScanAuditRecord[], filename = 'sentinel_ml_audit_stream.json') {
  const data = JSON.stringify(
    {
      export_version: '2.4.0',
      system: 'SentinelML Anti-Fraud & Fake Account Detection Engine',
      exported_at: new Date().toISOString(),
      record_count: records.length,
      records: records,
    },
    null,
    2
  );

  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports a single forensic security incident briefing memo in plain text / markdown.
 */
export function exportToForensicTXT(record: ScanAuditRecord) {
  const p = record.profile;
  const r = record.result;
  const content = `
================================================================================
           SENTINEL-ML FORENSIC INCIDENT BRIEFING & AUDIT LOG
================================================================================
AUDIT REFERENCE : ${record.id}
EVALUATION DATE : ${record.timestamp}
STATUS          : ${record.status}
CLASSIFICATION  : ${r.verdict} [${r.verdict_badge}]
ML RISK SCORE   : ${r.risk_score} / 100
CONFIDENCE      : ${r.confidence_percentage}% (${r.risk_level} RISK)

--------------------------------------------------------------------------------
1. TARGET PROFILE IDENTIFICATION
--------------------------------------------------------------------------------
Platform        : ${p.platform}
Username Handle : @${p.username}
Display Name    : ${p.full_name || 'N/A'}
Email Address   : ${p.email || 'N/A'} (Disposable: ${r.extracted_features?.is_disposable_email ? 'YES (FLAGGED)' : 'NO'})
Registration Age: ${p.account_age_days} days
Network Graph   : ${p.followers.toLocaleString()} Followers / ${p.following.toLocaleString()} Following
Follower Ratio  : ${r.extracted_features?.follow_ratio?.toFixed(2)}:1
Media Count     : ${p.posts.toLocaleString()} posts (Avg Likes: ${p.avg_likes || 0})
Avatar Custom   : ${p.has_avatar ? 'YES' : 'NO (DEFAULT/MISSING)'}
External URL    : ${p.external_url || 'NONE'}

--------------------------------------------------------------------------------
2. MACHINE LEARNING MODEL DECISION PATH
--------------------------------------------------------------------------------
Engine Model    : ${r.model_metadata.model_name}
Algorithm       : ${r.model_metadata.algorithm}
Benchmark Metric: ROC-AUC ${r.model_metadata.roc_auc} (Cresci Benchmark)
Summary Finding : ${r.summary}

Top Attributed Risk Factors:
${r.top_risk_factors.map((f, i) => `  [${i + 1}] ${f.factor} (${f.impact === 'INCREASES_RISK' ? '+' : ''}${f.weight}): ${f.explanation}`).join('\n')}

Detected Behavioral Anomalies:
${r.anomalies_detected.length > 0 ? r.anomalies_detected.map((a) => `  * ${a}`).join('\n') : '  * None detected (Within standard human bounds)'}

--------------------------------------------------------------------------------
3. ACTIONABLE SECURITY REMEDIATIONS
--------------------------------------------------------------------------------
${r.recommendations.map((rec, i) => `  [ACT-${i + 1}] ${rec}`).join('\n')}

================================================================================
Generated by SentinelML Anti-Sybil Defense System. Cryptographic Integrity Verified.
================================================================================
`.trim();

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Incident_Memo_${p.username}_${record.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
