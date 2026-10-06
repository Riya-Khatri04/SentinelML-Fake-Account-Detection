import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileDown,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  ExternalLink,
  Info,
  ArrowRight,
  TrendingUp,
  UserCheck,
  UserX,
  FileSpreadsheet
} from 'lucide-react';
import { AccountProfileInput, ScanAuditRecord, SocialPlatform } from '../types/scanner';
import { PRESET_SCENARIOS, scanAccount } from '../utils/mlEngine';
import { generateAuditReportPDF } from '../utils/pdfGenerator';
import { exportToJSON } from '../utils/exportUtils';

interface SingleScanViewProps {
  onScanCompleted: (record: ScanAuditRecord) => void;
  activeRecord: ScanAuditRecord | null;
  setActiveRecord: (record: ScanAuditRecord | null) => void;
}

export const SingleScanView: React.FC<SingleScanViewProps> = ({
  onScanCompleted,
  activeRecord,
  setActiveRecord,
}) => {
  const [formData, setFormData] = useState<AccountProfileInput>({
    platform: 'Instagram',
    username: 'lucas_miller_983194',
    full_name: '',
    bio: '',
    followers: 4,
    following: 1850,
    posts: 0,
    account_age_days: 3,
    has_avatar: false,
    email: 'alex9831@tempmail.com',
    avg_likes: 0,
    is_verified: false,
    has_url: false,
    external_url: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [analystNotes, setAnalystNotes] = useState('');

  const handleApplyPreset = (presetId: string) => {
    const found = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (found) {
      setFormData({ ...found.profile });
    }
  };

  const handleRunScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.username.trim()) return;

    setIsLoading(true);
    try {
      const record = await scanAccount(formData);
      setActiveRecord(record);
      onScanCompleted(record);
      setAnalystNotes(record.analyst_notes || '');
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!activeRecord) return;
    generateAuditReportPDF(activeRecord);
  };

  const followRatio = formData.followers > 0 ? (formData.following / formData.followers).toFixed(2) : 'N/A';

  return (
    <div className="space-y-8">
      {/* Intro Header & Preset Scenarios */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Social Account Threat Scanner
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Submit user profile indicators to execute deep behavioral inference with our pre-trained Python ensemble classifier.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Engine: Sentinel-RF-v2.4
            </span>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quick Test Scenarios
            </span>
            <span className="text-xs text-slate-500">1-click automated benchmark load</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {PRESET_SCENARIOS.map((scenario) => {
              const isSelected = formData.username === scenario.profile.username;
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleApplyPreset(scenario.id)}
                  type="button"
                  className={`flex flex-col text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-cyan-500/60 bg-cyan-950/20 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-semibold truncate">{scenario.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {scenario.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column (5 cols) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleRunScan}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                Target Profile Parameters
              </h2>
            </div>

            {/* Platform & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as SocialPlatform })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter/X">Twitter / X</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Custom">Custom / API Endpoint</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username Handle <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. user_994821"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Full Name & Registered Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Display Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Lucas Miller"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Associated Email / Domain
                </label>
                <input
                  type="text"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. user@tempmail.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Followers, Following & Live Ratio */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Followers Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.followers}
                  onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono tabular-nums"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Following Count
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">Ratio: {followRatio}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.following}
                  onChange={(e) => setFormData({ ...formData, following: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono tabular-nums"
                />
              </div>
            </div>

            {/* Posts, Account Age & Avg Likes */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Posts Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.posts}
                  onChange={(e) => setFormData({ ...formData, posts: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Account Age (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.account_age_days}
                  onChange={(e) => setFormData({ ...formData, account_age_days: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Avg Likes / Post
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.avg_likes || 0}
                  onChange={(e) => setFormData({ ...formData, avg_likes: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono tabular-nums"
                />
              </div>
            </div>

            {/* Profile Avatar & Verified Checkboxes */}
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_avatar}
                  onChange={(e) => setFormData({ ...formData, has_avatar: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                />
                <span className="text-xs text-slate-300">Custom Profile Picture Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_verified || false}
                  onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                />
                <span className="text-xs text-slate-300">Platform Verified Badge</span>
              </label>
            </div>

            {/* Bio & External URL */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Biography / Description
              </label>
              <textarea
                rows={2}
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Profile bio content..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Bio External URL (Optional)
              </label>
              <input
                type="text"
                value={formData.external_url || ''}
                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                placeholder="e.g. https://bit.ly/crypto-promo"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Python ML Ensemble...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Analyze Profile with Machine Learning
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Result Column (7 cols) */}
        <div className="lg:col-span-7">
          {activeRecord ? (
            <div className="space-y-6">
              {/* Verdict Banner Card */}
              <div
                className={`rounded-xl border p-6 relative overflow-hidden transition-all ${
                  activeRecord.result.is_fake
                    ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950'
                    : 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        activeRecord.result.is_fake
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {activeRecord.result.is_fake ? (
                        <ShieldAlert className="h-7 w-7" />
                      ) : (
                        <ShieldCheck className="h-7 w-7" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded ${
                            activeRecord.result.is_fake
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {activeRecord.result.verdict_badge}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Audit ID: {activeRecord.id}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {activeRecord.result.verdict}
                      </h3>
                    </div>
                  </div>

                  {/* Quantitative Gauge */}
                  <div className="text-right">
                    <div className="text-2xl font-black font-mono tabular-nums text-white">
                      {activeRecord.result.risk_score}
                      <span className="text-xs text-slate-400 font-normal"> / 100 Risk</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Confidence: {activeRecord.result.confidence_percentage}%
                    </div>
                  </div>
                </div>

                {/* Narrative Summary */}
                <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                  {activeRecord.result.summary}
                </p>

                {/* Primary Action Buttons Bar */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-rose-950/60 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    title="Generate and download official PDF audit report determining whether this account is Fake or Real"
                  >
                    <FileDown className="h-4 w-4" />
                    <span>Generate & Download Official PDF Report</span>
                    <span className="bg-rose-700/90 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                      {activeRecord.result.is_fake ? 'FAKE ACCOUNT' : 'REAL USER'}
                    </span>
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Official Verification Certificate (.PDF)
                  </span>
                </div>
              </div>

              {/* Feature Attributions / SHAP Weights Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    ML Feature Attributions & Risk Vectors
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">Ensemble Tree Weights</span>
                </div>

                <div className="space-y-3">
                  {activeRecord.result.top_risk_factors.map((factor, idx) => {
                    const isRisk = factor.impact === 'INCREASES_RISK';
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5 max-w-md">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isRisk ? 'bg-rose-400' : 'bg-emerald-400'
                              }`}
                            />
                            <span className="text-xs font-semibold text-white">
                              {factor.factor}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold ${
                                isRisk ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {isRisk ? '+' : ''}
                              {factor.weight}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            {factor.explanation}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded self-start sm:self-center ${
                            isRisk
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isRisk ? 'Elevates Risk' : 'Reduces Risk'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Anomalies & Recommended Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Anomalies */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    Detected Threat Triggers ({activeRecord.result.anomalies_detected.length})
                  </h4>
                  {activeRecord.result.anomalies_detected.length > 0 ? (
                    <ul className="space-y-2">
                      {activeRecord.result.anomalies_detected.map((anomaly, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/60"
                        >
                          <span className="text-rose-400 font-bold font-mono">!</span>
                          <span>{anomaly}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-slate-400 py-4 text-center bg-slate-950/30 rounded border border-slate-800/40">
                      No critical threat triggers detected. Profile conforms to standard human distributions.
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    Recommended Security Actions
                  </h4>
                  <ul className="space-y-2">
                    {activeRecord.result.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/60"
                      >
                        <span className="text-cyan-400 font-bold font-mono">ACT-0{idx + 1}</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/20">
              <ShieldAlert className="h-12 w-12 text-slate-600 mb-3" />
              <h3 className="text-sm font-semibold text-white">No Target Scanned Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Configure profile parameters on the left or select a preset scenario above to execute the Python ML classifier.
              </p>
              <button
                onClick={() => handleRunScan()}
                className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-500 transition-colors"
              >
                Scan Default Test Scenario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
