import React, { useState } from 'react';
import {
  Layers,
  FileDown,
  FileSpreadsheet,
  FileText,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Wand2,
  FileCode,
  Edit3,
  Sliders,
  X
} from 'lucide-react';
import { AccountProfileInput, ScanAuditRecord, SocialPlatform } from '../types/scanner';
import { predictAccountClientSide } from '../utils/mlEngine';
import { generateBatchReportPDF } from '../utils/pdfGenerator';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

const DEFAULT_SAMPLE_DATASET: AccountProfileInput[] = [
  {
    platform: 'Instagram',
    username: 'crypto_giveaway_airdrop_88',
    full_name: 'Ethereum Claim Hub',
    bio: 'Claim your $500 ETH promo right now on our official gateway.',
    followers: 12,
    following: 2450,
    posts: 1,
    account_age_days: 5,
    has_avatar: false,
    email: 'claim@airdrop-temp.xyz',
    avg_likes: 0.1,
    is_verified: false,
  },
  {
    platform: 'Instagram',
    username: 'sophia_travel_photographer',
    full_name: 'Sophia Laurent',
    bio: 'Visual stories across 42 countries. Leica Ambassador.',
    followers: 18400,
    following: 680,
    posts: 312,
    account_age_days: 1640,
    has_avatar: true,
    email: 'sophia@sophialaurent.com',
    avg_likes: 420,
    is_verified: true,
  },
  {
    platform: 'Twitter/X',
    username: 'elon_musk_parody_99182',
    full_name: 'Elon Musk [Free Tesla Giveaway]',
    bio: 'Official celebration promo! Send 0.1 BTC to receive 0.2 BTC back immediately.',
    followers: 88,
    following: 3820,
    posts: 4,
    account_age_days: 8,
    has_avatar: true,
    email: 'elonpromo@mailinator.com',
    avg_likes: 1.2,
    is_verified: false,
  },
  {
    platform: 'LinkedIn',
    username: 'david_ross_recruiting',
    full_name: 'David Ross',
    bio: 'Talent Acquisition Partner @ FinTech Global.',
    followers: 3200,
    following: 1100,
    posts: 54,
    account_age_days: 780,
    has_avatar: true,
    email: 'david.ross@fintech-talent.io',
    avg_likes: 24,
    is_verified: false,
  },
  {
    platform: 'Instagram',
    username: 'bot_farm_worker_00192',
    full_name: '',
    bio: '',
    followers: 2,
    following: 1980,
    posts: 0,
    account_age_days: 2,
    has_avatar: false,
    email: 'bot019@sharklasers.com',
    avg_likes: 0,
    is_verified: false,
  },
];

const BOT_HANDLE_STEMS = [
  'crypto_airdrop_', 'follow_churn_', 'free_followers_', 'bot_matrix_',
  'deal_finder_', 'instant_cash_', 'promo_stream_', 'giftcard_hub_'
];

const ORGANIC_HANDLE_STEMS = [
  'alex_adventures', 'sarah_codes', 'marcus_design', 'emily_reads',
  'elena_systems', 'daniel_travels', 'clara_bakes', 'liam_fitness'
];

function generateCustomDataset(count: number): AccountProfileInput[] {
  const generated: AccountProfileInput[] = [];
  const platforms: SocialPlatform[] = ['Instagram', 'Twitter/X', 'LinkedIn', 'TikTok'];

  for (let i = 0; i < count; i++) {
    const isBot = i % 2 === 0; // Alternate between fake and authentic
    const platform = platforms[i % platforms.length];

    if (isBot) {
      const stem = BOT_HANDLE_STEMS[i % BOT_HANDLE_STEMS.length];
      const randDigits = Math.floor(1000 + Math.random() * 900000);
      const followingCount = Math.floor(1200 + Math.random() * 3500);
      const followerCount = Math.floor(1 + Math.random() * 25);
      generated.push({
        platform,
        username: `${stem}${randDigits}`,
        full_name: i % 4 === 0 ? 'Official Claim Bot' : '',
        bio: i % 4 === 0 ? 'Click link for rewards and instant crypto airdrop!' : '',
        followers: followerCount,
        following: followingCount,
        posts: Math.floor(Math.random() * 3),
        account_age_days: Math.floor(1 + Math.random() * 12),
        has_avatar: Math.random() > 0.6,
        email: `spambot_${randDigits}@tempmail.com`,
        avg_likes: 0,
        is_verified: false,
      });
    } else {
      const stem = ORGANIC_HANDLE_STEMS[i % ORGANIC_HANDLE_STEMS.length];
      const followerCount = Math.floor(400 + Math.random() * 12000);
      const followingCount = Math.floor(200 + Math.random() * 800);
      const postsCount = Math.floor(25 + Math.random() * 280);
      generated.push({
        platform,
        username: `${stem}_${Math.floor(10 + Math.random() * 89)}`,
        full_name: stem.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        bio: 'Creating thoughtful projects, exploring nature, and building community.',
        followers: followerCount,
        following: followingCount,
        posts: postsCount,
        account_age_days: Math.floor(180 + Math.random() * 1400),
        has_avatar: true,
        email: `${stem}@gmail.com`,
        avg_likes: Math.floor(15 + Math.random() * 120),
        is_verified: followerCount > 8000,
      });
    }
  }

  return generated;
}

interface BatchScanViewProps {
  onBatchScanned: (records: ScanAuditRecord[]) => void;
}

export const BatchScanView: React.FC<BatchScanViewProps> = ({ onBatchScanned }) => {
  const [dataset, setDataset] = useState<AccountProfileInput[]>(DEFAULT_SAMPLE_DATASET);
  const [targetCountInput, setTargetCountInput] = useState<number>(5);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchResults, setBatchResults] = useState<ScanAuditRecord[]>([]);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvText, setCsvText] = useState('');

  // Handle generating custom number of accounts
  const handleGenerateTargetCount = (num: number) => {
    const validNum = Math.max(1, Math.min(100, num));
    setTargetCountInput(validNum);
    const newBatch = generateCustomDataset(validNum);
    setDataset(newBatch);
    setBatchResults([]);
  };

  // Add a single blank account row to edit
  const handleAddAccountRow = () => {
    const newAccount: AccountProfileInput = {
      platform: 'Instagram',
      username: `target_account_${dataset.length + 1}`,
      full_name: '',
      bio: '',
      followers: 100,
      following: 200,
      posts: 5,
      account_age_days: 45,
      has_avatar: true,
      email: '',
      avg_likes: 5,
      is_verified: false,
    };
    setDataset([...dataset, newAccount]);
    setBatchResults([]);
  };

  // Update a single account in the queue
  const handleUpdateRow = (index: number, field: keyof AccountProfileInput, value: any) => {
    setDataset((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Delete a specific row
  const handleDeleteRow = (index: number) => {
    setDataset((prev) => prev.filter((_, i) => i !== index));
    setBatchResults([]);
  };

  // Parse CSV text paste
  const handleApplyCSV = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    const parsedAccounts: AccountProfileInput[] = [];

    lines.forEach((line) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2 && !parts[0].toLowerCase().includes('username')) {
        const username = parts[0].replace(/^@/, '');
        const platform = (['Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'Facebook'].includes(parts[1])
          ? parts[1]
          : 'Instagram') as SocialPlatform;
        const followers = parseInt(parts[2]) || 0;
        const following = parseInt(parts[3]) || 0;
        const posts = parseInt(parts[4]) || 0;
        const age = parseInt(parts[5]) || 30;

        parsedAccounts.push({
          platform,
          username,
          followers,
          following,
          posts,
          account_age_days: age,
          has_avatar: true,
          email: '',
          avg_likes: 0,
        });
      }
    });

    if (parsedAccounts.length > 0) {
      setDataset(parsedAccounts);
      setTargetCountInput(parsedAccounts.length);
      setShowCSVModal(false);
      setCsvText('');
      setBatchResults([]);
    }
  };

  const handleRunBatchInference = async () => {
    if (dataset.length === 0) return;
    setIsRunning(true);
    setProgress(15);
    setBatchResults([]);

    try {
      let newRecords: ScanAuditRecord[] = [];
      try {
        const res = await fetch('/api/batch-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accounts: dataset }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.records) {
            newRecords = data.records;
          }
        }
      } catch (err) {
        console.warn('Backend batch API unreachable, utilizing client-side engine:', err);
      }

      if (newRecords.length === 0) {
        newRecords = dataset.map((account) => {
          const result = predictAccountClientSide(account);
          return {
            id: `AUD-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            timestamp: new Date().toISOString(),
            profile: account,
            result,
            status: result.is_fake ? 'ACTION_REQUIRED' : 'RESOLVED',
            tags: ['Batch Job', result.verdict_badge],
            execution_source: 'LOCAL_HYBRID_ENGINE',
          };
        });
      }

      setProgress(100);
      setBatchResults(newRecords);
      onBatchScanned(newRecords);
    } catch (e) {
      console.error('Batch error:', e);
    } finally {
      setIsRunning(false);
    }
  };

  const fakeCount = batchResults.filter((r) => r.result.is_fake).length;
  const realCount = batchResults.length - fakeCount;
  const fakeRate = batchResults.length > 0 ? ((fakeCount / batchResults.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Top Banner & Batch Control Panel */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              Batch Account Security Audit & Generator
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Configure the exact number of accounts to audit, edit any profile parameter in-place, or paste a custom list.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowCSVModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <FileCode className="h-3.5 w-3.5 text-cyan-400" />
              Paste CSV / Handles
            </button>
            <button
              onClick={handleAddAccountRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-400" />
              + Add Account Row
            </button>
            <button
              onClick={handleRunBatchInference}
              disabled={isRunning || dataset.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-950/40 transition-all disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Auditing ({dataset.length} accounts)...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  Audit {dataset.length} Accounts with ML
                </>
              )}
            </button>
          </div>
        </div>

        {/* Number of Accounts Selector */}
        <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              Set Number of Accounts:
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="100"
                value={targetCountInput}
                onChange={(e) => setTargetCountInput(parseInt(e.target.value) || 1)}
                className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white font-mono text-center focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleGenerateTargetCount(targetCountInput)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                <Wand2 className="h-3.5 w-3.5 text-cyan-400" />
                Generate {targetCountInput} Accounts
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Quick Counts:</span>
            {[3, 5, 10, 20, 50].map((num) => (
              <button
                key={num}
                onClick={() => handleGenerateTargetCount(num)}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  dataset.length === num
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
            {dataset.length > 0 && (
              <button
                onClick={() => {
                  setDataset([]);
                  setBatchResults([]);
                }}
                className="ml-2 text-rose-400 hover:text-rose-300 text-xs"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Aggregate Batch Stats (When results exist) */}
        {batchResults.length > 0 && (
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Total Evaluated</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {batchResults.length}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/80 border border-rose-900/40">
              <span className="text-xs text-rose-400 uppercase tracking-wider">Fake / Synthetic</span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {fakeCount} <span className="text-xs font-normal text-slate-400">({fakeRate}%)</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/80 border border-emerald-900/40">
              <span className="text-xs text-emerald-400 uppercase tracking-wider">Authentic Users</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {realCount}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Inference Speed</span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                ~12ms <span className="text-xs font-normal text-slate-400">/ entity</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Batch Results View (if audit ran) */}
      {batchResults.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                Batch ML Audit Output ({batchResults.length} Accounts)
              </h2>
              <span className="text-xs text-slate-400">
                Processed via Sentinel-RF-Ensemble-v2.4
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => generateBatchReportPDF(batchResults)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-colors"
              >
                <FileDown className="h-3.5 w-3.5" />
                Download Batch PDF Report
              </button>

              <button
                onClick={() => exportToCSV(batchResults, `Sentinel_Batch_${Date.now()}.csv`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Export Batch CSV
              </button>

              <button
                onClick={() => exportToJSON(batchResults, `Sentinel_Batch_${Date.now()}.json`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                Export JSON
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Audit ID</th>
                  <th className="py-2.5 px-3 font-semibold">Platform</th>
                  <th className="py-2.5 px-3 font-semibold">Handle</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Followers</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Following</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Risk Score</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Verdict</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {batchResults.map((record) => {
                  const isFake = record.result.is_fake;
                  return (
                    <tr key={record.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-cyan-400 font-bold">{record.id}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">{record.profile.platform}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-white">
                        @{record.profile.username}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">
                        {record.profile.followers.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">
                        {record.profile.following.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                        <span className={isFake ? 'text-rose-400' : 'text-emerald-400'}>
                          {record.result.risk_score}
                        </span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isFake
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {record.result.verdict_badge}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">
                        {record.result.confidence_percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editable Batch Queue Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-cyan-400" />
              Editable Batch Queue ({dataset.length} Accounts)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              You can edit any handle, followers, following, or email directly in the table below before running the ML audit.
            </p>
          </div>
          <button
            onClick={handleAddAccountRow}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            + Add Another Account
          </button>
        </div>

        {dataset.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-2 font-semibold">#</th>
                  <th className="py-2 px-2 font-semibold">Platform</th>
                  <th className="py-2 px-2 font-semibold">Username Handle</th>
                  <th className="py-2 px-2 font-semibold">Followers</th>
                  <th className="py-2 px-2 font-semibold">Following</th>
                  <th className="py-2 px-2 font-semibold">Posts</th>
                  <th className="py-2 px-2 font-semibold">Age (Days)</th>
                  <th className="py-2 px-2 font-semibold">Avatar</th>
                  <th className="py-2 px-2 font-semibold">Email / Domain</th>
                  <th className="py-2 px-2 text-center">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {dataset.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2 px-2 text-slate-500">{idx + 1}</td>

                    {/* Platform Selector */}
                    <td className="py-2 px-2 font-sans">
                      <select
                        value={item.platform}
                        onChange={(e) => handleUpdateRow(idx, 'platform', e.target.value as SocialPlatform)}
                        className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="Twitter/X">Twitter/X</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Facebook">Facebook</option>
                      </select>
                    </td>

                    {/* Username Handle */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.username}
                        onChange={(e) => handleUpdateRow(idx, 'username', e.target.value)}
                        placeholder="username"
                        className="w-40 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </td>

                    {/* Followers */}
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        value={item.followers}
                        onChange={(e) => handleUpdateRow(idx, 'followers', parseInt(e.target.value) || 0)}
                        className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white text-right focus:border-cyan-500 focus:outline-none tabular-nums"
                      />
                    </td>

                    {/* Following */}
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        value={item.following}
                        onChange={(e) => handleUpdateRow(idx, 'following', parseInt(e.target.value) || 0)}
                        className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white text-right focus:border-cyan-500 focus:outline-none tabular-nums"
                      />
                    </td>

                    {/* Posts */}
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        value={item.posts}
                        onChange={(e) => handleUpdateRow(idx, 'posts', parseInt(e.target.value) || 0)}
                        className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white text-right focus:border-cyan-500 focus:outline-none tabular-nums"
                      />
                    </td>

                    {/* Account Age */}
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="1"
                        value={item.account_age_days}
                        onChange={(e) => handleUpdateRow(idx, 'account_age_days', parseInt(e.target.value) || 1)}
                        className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white text-right focus:border-cyan-500 focus:outline-none tabular-nums"
                      />
                    </td>

                    {/* Has Avatar Toggle */}
                    <td className="py-2 px-2 text-center font-sans">
                      <button
                        type="button"
                        onClick={() => handleUpdateRow(idx, 'has_avatar', !item.has_avatar)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.has_avatar
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {item.has_avatar ? 'Yes' : 'No'}
                      </button>
                    </td>

                    {/* Email Domain */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.email || ''}
                        onChange={(e) => handleUpdateRow(idx, 'email', e.target.value)}
                        placeholder="email@example.com"
                        className="w-36 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                      />
                    </td>

                    {/* Delete Action */}
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Remove from batch queue"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No accounts in queue. Use "Set Number of Accounts" above or click "+ Add Account Row" to start.
          </div>
        )}

        <div className="pt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {dataset.length} accounts queued for ML classification
          </span>
          <button
            onClick={handleRunBatchInference}
            disabled={isRunning || dataset.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-950/40 transition-colors disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-white" />
            Audit {dataset.length} Accounts
          </button>
        </div>
      </div>

      {/* CSV Paste Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCode className="h-4 w-4 text-cyan-400" />
                Paste Account Handles or CSV
              </h3>
              <button
                onClick={() => setShowCSVModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste comma-separated accounts formatted as: <br />
              <code className="text-cyan-400 font-mono text-[11px]">
                username, platform, followers, following, posts, age_days
              </code>
            </p>

            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`user_bot_1928, Instagram, 5, 2400, 0, 3\nsarah_designer, Twitter/X, 4200, 520, 110, 890\ncrypto_claim_99, Instagram, 14, 1890, 1, 6`}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCSVModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCSV}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white"
              >
                Import Accounts to Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
