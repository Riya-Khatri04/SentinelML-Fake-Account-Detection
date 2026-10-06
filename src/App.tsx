import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SingleScanView } from './components/SingleScanView';
import { BatchScanView } from './components/BatchScanView';
import { AuditDashboardView } from './components/AuditDashboardView';
import { AuditStatus, ScanAuditRecord } from './types/scanner';
import { INITIAL_AUDIT_SEED } from './utils/mlEngine';
import { exportToCSV } from './utils/exportUtils';
import { Shield, Sparkles, CheckCircle2, Lock, Terminal } from 'lucide-react';

const STORAGE_KEY = 'sentinel_ml_audit_records_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'audit'>('single');
  const [records, setRecords] = useState<ScanAuditRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load localStorage audit records:', e);
    }
    return INITIAL_AUDIT_SEED;
  });

  const [activeRecord, setActiveRecord] = useState<ScanAuditRecord | null>(INITIAL_AUDIT_SEED[0]);

  // Sync with backend API on mount
  useEffect(() => {
    fetch('/api/scans')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.records) && data.records.length > 0) {
          setRecords(data.records);
        }
      })
      .catch((err) => {
        console.warn('Backend /api/scans not reachable, continuing with local store:', err);
      });
  }, []);

  // Save to localStorage when records change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to persist to localStorage:', e);
    }
  }, [records]);

  const handleScanCompleted = (newRecord: ScanAuditRecord) => {
    setRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    setActiveRecord(newRecord);
  };

  const handleBatchScanned = (newRecords: ScanAuditRecord[]) => {
    setRecords((prev) => [...newRecords, ...prev]);
  };

  const handleDeleteRecord = async (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (activeRecord?.id === id) {
      setActiveRecord(null);
    }
    try {
      await fetch(`/api/scans/${id}`, { method: 'DELETE' });
    } catch (e) {
      // ignored
    }
  };

  const handleUpdateStatus = async (id: string, status: AuditStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    if (activeRecord?.id === id) {
      setActiveRecord((prev) => (prev ? { ...prev, status } : null));
    }
    try {
      await fetch(`/api/scans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      // ignored
    }
  };

  const handleClearRecords = async () => {
    if (window.confirm('Are you sure you want to clear all archived scan records?')) {
      setRecords([]);
      setActiveRecord(null);
      localStorage.removeItem(STORAGE_KEY);
      try {
        await fetch('/api/scans/reset', { method: 'POST' });
      } catch (e) {
        // ignored
      }
    }
  };

  const handleExportAll = () => {
    exportToCSV(records, `Sentinel_Full_Audit_Export_${Date.now()}.csv`);
  };

  const handleNewScan = () => {
    setActiveTab('single');
  };

  const handleSelectRecordForScan = (rec: ScanAuditRecord) => {
    setActiveRecord(rec);
    setActiveTab('single');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewScan={handleNewScan}
        onExportAll={handleExportAll}
        totalRecordsCount={records.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'single' && (
          <SingleScanView
            onScanCompleted={handleScanCompleted}
            activeRecord={activeRecord}
            setActiveRecord={setActiveRecord}
          />
        )}

        {activeTab === 'batch' && (
          <BatchScanView onBatchScanned={handleBatchScanned} />
        )}

        {activeTab === 'audit' && (
          <AuditDashboardView
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onUpdateStatus={handleUpdateStatus}
            onClearRecords={handleClearRecords}
            onSelectRecordForScan={handleSelectRecordForScan}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">SentinelML</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Pre-trained Python ML Model Engine (v2.4)</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Zero-Trust Social Threat Forensics</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>NIST SP 800-207 Compliant</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="font-mono text-cyan-500/80">Audit Hash: SHA-256</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
