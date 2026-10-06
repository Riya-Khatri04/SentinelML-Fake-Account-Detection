import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileDown,
  FileSpreadsheet,
  FileText,
  Trash2,
  Eye,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Download,
  X,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { AuditStatus, ScanAuditRecord, SocialPlatform, VerdictBadge } from '../types/scanner';
import { generateAuditReportPDF } from '../utils/pdfGenerator';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

interface AuditDashboardViewProps {
  records: ScanAuditRecord[];
  onDeleteRecord: (id: string) => void;
  onUpdateStatus: (id: string, status: AuditStatus) => void;
  onClearRecords: () => void;
  onSelectRecordForScan: (record: ScanAuditRecord) => void;
}

export const AuditDashboardView: React.FC<AuditDashboardViewProps> = ({
  records,
  onDeleteRecord,
  onUpdateStatus,
  onClearRecords,
  onSelectRecordForScan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'ALL' | VerdictBadge>('ALL');
  const [platformFilter, setPlatformFilter] = useState<'ALL' | SocialPlatform>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AuditStatus>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<ScanAuditRecord | null>(null);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.profile.username.toLowerCase().includes(q) ||
        (r.profile.full_name && r.profile.full_name.toLowerCase().includes(q)) ||
        r.id.toLowerCase().includes(q);

      const matchesVerdict = verdictFilter === 'ALL' || r.result.verdict_badge === verdictFilter;
      const matchesPlatform = platformFilter === 'ALL' || r.profile.platform === platformFilter;
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

      return matchesSearch && matchesVerdict && matchesPlatform && matchesStatus;
    });
  }, [records, searchTerm, verdictFilter, platformFilter, statusFilter]);

  // Telemetry Aggregations
  const totalScans = records.length;
  const fakeCount = records.filter((r) => r.result.is_fake).length;
  const realCount = totalScans - fakeCount;
  const fakeRate = totalScans > 0 ? ((fakeCount / totalScans) * 100).toFixed(1) : '0.0';
  const actionRequiredCount = records.filter((r) => r.status === 'ACTION_REQUIRED').length;
  const avgConfidence = totalScans > 0
    ? (records.reduce((acc, r) => acc + r.result.confidence_percentage, 0) / totalScans).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Scanned */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Total Ingested Scans
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalScans}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Archived security audits
          </div>
        </div>

        {/* Fake Rate */}
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-5">
          <div className="text-xs text-rose-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Synthetic / Fake Rate</span>
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-rose-400 font-mono tabular-nums">
            {fakeRate}%
          </div>
          <div className="mt-1 text-xs text-rose-300/70">
            {fakeCount} flagged malicious / bots
          </div>
        </div>

        {/* Authentic Profiles */}
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5">
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Authentic Profiles</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {realCount}
          </div>
          <div className="mt-1 text-xs text-emerald-300/70">
            {(100 - parseFloat(fakeRate)).toFixed(1)}% verified genuine
          </div>
        </div>

        {/* Action Required */}
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-5">
          <div className="text-xs text-amber-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Enforcement Queue</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
            {actionRequiredCount}
          </div>
          <div className="mt-1 text-xs text-amber-300/70">
            Pending quarantine / 2FA
          </div>
        </div>

        {/* Confidence */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Mean Decision Confidence
          </div>
          <div className="mt-2 text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">
            {avgConfidence}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Ensemble calibration metric
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Export Actions */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by handle (@username), name, or Audit ID..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Export & Utility Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToCSV(filteredRecords, `Sentinel_Audit_Log_${Date.now()}.csv`)}
              disabled={filteredRecords.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              Export CSV ({filteredRecords.length})
            </button>

            <button
              onClick={() => exportToJSON(filteredRecords, `Sentinel_Audit_Log_${Date.now()}.json`)}
              disabled={filteredRecords.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
            >
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              Export JSON
            </button>

            {records.length > 0 && (
              <button
                onClick={onClearRecords}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
                title="Clear all stored logs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Verdict Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['ALL', 'FAKE', 'REAL', 'SUSPICIOUS'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVerdictFilter(v)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  verdictFilter === v
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {v === 'ALL' ? 'All Verdicts' : v}
              </button>
            ))}
          </div>

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as any)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="Twitter/X">Twitter / X</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="TikTok">TikTok</option>
            <option value="Facebook">Facebook</option>
            <option value="Custom">Custom</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTION_REQUIRED">Action Required</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="WHITELISTED">Whitelisted</option>
          </select>

          <span className="text-[11px] text-slate-500 font-mono ml-auto">
            Showing {filteredRecords.length} of {totalScans} audit records
          </span>
        </div>
      </div>

      {/* Main Audit Data Grid */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">Audit Ref</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Target Account</th>
                <th className="py-3 px-4 font-semibold text-right">Risk Score</th>
                <th className="py-3 px-4 font-semibold text-center">Verdict</th>
                <th className="py-3 px-4 font-semibold">Primary Risk Vector</th>
                <th className="py-3 px-4 font-semibold text-center">Enforcement</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  const isFake = rec.result.is_fake;
                  const dateStr = new Date(rec.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const primaryVector = rec.result.top_risk_factors[0]?.factor || 'Normal Baseline';

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Audit Ref */}
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                        {rec.id}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                        {dateStr}
                      </td>

                      {/* Target Account */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-500">
                            {rec.profile.platform}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="font-semibold text-white">
                            @{rec.profile.username}
                          </span>
                        </div>
                        {rec.profile.full_name && (
                          <div className="text-[11px] text-slate-400">
                            {rec.profile.full_name}
                          </div>
                        )}
                      </td>

                      {/* Risk Score */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full ${
                                isFake ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, rec.result.risk_score)}%` }}
                            />
                          </div>
                          <span
                            className={`font-bold ${
                              isFake ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {rec.result.risk_score}
                          </span>
                        </div>
                      </td>

                      {/* Verdict Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            rec.result.verdict_badge === 'FAKE'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : rec.result.verdict_badge === 'REAL'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {rec.result.verdict_badge}
                        </span>
                      </td>

                      {/* Primary Risk Vector */}
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {primaryVector}
                      </td>

                      {/* Enforcement Status Dropdown */}
                      <td className="py-3 px-4 text-center">
                        <select
                          value={rec.status}
                          onChange={(e) => onUpdateStatus(rec.id, e.target.value as AuditStatus)}
                          className={`rounded px-2 py-0.5 text-[10px] font-medium border focus:outline-none ${
                            rec.status === 'ACTION_REQUIRED'
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                              : rec.status === 'UNDER_REVIEW'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                              : rec.status === 'WHITELISTED'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="ACTION_REQUIRED">Action Required</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="WHITELISTED">Whitelisted</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click PDF Certificate Download */}
                          <button
                            onClick={() => generateAuditReportPDF(rec)}
                            title="Download Official Forensic Audit PDF Certificate"
                            className="p-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                          </button>

                          {/* Inspect Detail Modal */}
                          <button
                            onClick={() => setSelectedRecord(rec)}
                            title="View Forensic Feature Breakdown"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Record */}
                          <button
                            onClick={() => onDeleteRecord(rec.id)}
                            title="Delete Log"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-slate-400">No matching audit logs found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Adjust your search filters or run a new scan from the scanner tab.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="font-mono text-cyan-400 font-bold text-sm">
                  {selectedRecord.id}
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400">
                  {new Date(selectedRecord.timestamp).toUTCString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Verdict Box */}
            <div
              className={`p-4 rounded-xl border ${
                selectedRecord.result.is_fake
                  ? 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                  : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider font-mono">
                  {selectedRecord.result.verdict_badge} VERDICT
                </span>
                <span className="text-sm font-bold font-mono">
                  Risk: {selectedRecord.result.risk_score} / 100 ({selectedRecord.result.confidence_percentage}% Conf)
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {selectedRecord.result.verdict}
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                {selectedRecord.result.summary}
              </p>
            </div>

            {/* Profile Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Followers</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {selectedRecord.profile.followers.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Following</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {selectedRecord.profile.following.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Follow Ratio</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {selectedRecord.result.extracted_features.follow_ratio.toFixed(2)}:1
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Account Age</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {selectedRecord.profile.account_age_days} days
                </span>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Top ML Feature Attributions
              </h4>
              <div className="space-y-1.5">
                {selectedRecord.result.top_risk_factors.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-white">{f.factor}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{f.explanation}</p>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold ${
                        f.impact === 'INCREASES_RISK' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {f.impact === 'INCREASES_RISK' ? '+' : ''}{f.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  onSelectRecordForScan(selectedRecord);
                  setSelectedRecord(null);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Re-load in Deep Scanner →
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateAuditReportPDF(selectedRecord)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-sm"
                  title="Generate and download official PDF report determining Fake vs Real classification"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Download Official PDF Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
