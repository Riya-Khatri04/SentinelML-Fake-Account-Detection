import React from 'react';
import { Shield, Sparkles, FileText, Download, FileSpreadsheet } from 'lucide-react';
import { downloadDatasetAsExcel } from '../utils/datasetExporter';

interface HeaderProps {
  activeTab: 'single' | 'batch' | 'audit';
  setActiveTab: (tab: 'single' | 'batch' | 'audit') => void;
  onNewScan: () => void;
  onExportAll: () => void;
  totalRecordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewScan,
  onExportAll,
  totalRecordsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              SentinelML
              <span className="inline-flex items-center gap-1 text-[11px] font-normal text-cyan-400/90 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Python ML v2.4
              </span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Segmented Control */}
        <nav className="hidden md:flex items-center gap-1 rounded-lg bg-slate-900/80 p-1 border border-slate-800/80">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'single'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Account Scanner
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'batch'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Batch Audit
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Audit History</span>
            <span className="text-[10px] font-mono text-cyan-400 tabular-nums">
              ({totalRecordsCount})
            </span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Download 5000 Dataset for Excel button */}
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/dataset/5000/csv');
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'SentinelML_5000_User_Benchmark_Dataset.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => window.URL.revokeObjectURL(url), 1000);
              } catch (e) {
                window.location.href = '/api/dataset/5000/csv';
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 hover:text-emerald-200 transition-colors whitespace-nowrap shadow-sm"
            title="Download 5,000 Users Dataset for Microsoft Excel (2,500 Real · 2,500 Fake - 20 Features)"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">5,000 Dataset (Excel CSV)</span>
            <span className="sm:hidden">5k Excel</span>
          </button>

          <button
            onClick={onExportAll}
            className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
            title="Export past scan log as CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onNewScan}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>New Scan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
