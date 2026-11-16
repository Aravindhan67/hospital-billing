import React, { useState, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  UserPlus,
  Clock,
  Calendar,
  Building2,
  RefreshCw,
  Sliders,
  Layers,
  FileText
} from 'lucide-react';

export default function Navbar({
  onOpenNewInvoice,
  onOpenNewPatient,
  onSearch,
  onRefresh,
  hospitalName,
  theme,
  setTheme,
  setActiveTab
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchChange = (e) => {
    setSearchVal(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const isTrad = theme === 'traditional';

  return (
    <header className="no-print bg-white border-b border-slate-200/90 sticky top-0 z-20 shadow-soft-sm">
      
      {/* Top Station & Info Bar */}
      <div className={`px-5 py-2 flex items-center justify-between text-xs border-b ${
        isTrad
          ? 'bg-[#1e3a8a] text-white border-blue-900'
          : 'bg-gradient-to-r from-teal-700 to-brand-800 text-white border-teal-800'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[11px]">
            <Building2 className="w-4 h-4 text-amber-300" />
            <span>{hospitalName || "CURAFLOW MULTI-SPECIALITY HOSPITAL & HIS"}</span>
          </div>
          <span className="text-white/40">|</span>
          <span className="text-[11px] font-mono text-amber-200 font-semibold bg-white/10 px-2 py-0.5 rounded">
            TERMINAL: CASHIER-STATION-01
          </span>
          <span className="hidden md:inline text-[11px] text-white/80">
            SHIFT: MORNING (ACTIVE)
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Live Date / Time */}
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-white/70" />
              <span>{currentTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>

          <span className="text-white/40">|</span>

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setTheme(isTrad ? 'modern' : 'traditional')}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-white/15 hover:bg-white/25 text-white transition-all border border-white/20"
            title="Switch between Traditional Hospital ERP and Modern Soft theme"
          >
            <span>{isTrad ? '🏛️ Traditional ERP Theme' : '🌿 Modern Lite Theme'}</span>
          </button>
        </div>
      </div>

      {/* Main Action & Search Bar */}
      <div className="px-5 py-2.5 flex items-center justify-between gap-4">
        
        {/* Global Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Search Voucher, UHID, Patient Name, Phone or Invoice #..."
            className="w-full pl-9 pr-7 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
          {searchVal && (
            <button
              onClick={() => { setSearchVal(''); if (onSearch) onSearch(''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Function Keys / Quick Buttons Bar */}
        <div className="flex items-center space-x-2">
          {/* Refresh */}
          <button
            onClick={onRefresh}
            title="Refresh Database Ledger"
            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Register Patient Button */}
          <button
            onClick={onOpenNewPatient}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isTrad
                ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-white border-teal-200 text-teal-800 hover:bg-teal-50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-600" />
            <span>Register Patient</span>
            <kbd className="fkey ml-1">F2</kbd>
          </button>

          {/* Create New Bill Button */}
          <button
            onClick={onOpenNewInvoice}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-soft transition-all active:scale-[0.98] ${
              isTrad
                ? 'bg-[#1e40af] hover:bg-[#1e3a8a]'
                : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Generate Bill</span>
            <kbd className="fkey ml-1 bg-white/20 text-white border-white/40">F1</kbd>
          </button>
        </div>
      </div>

      {/* Traditional Function Keys Strip */}
      <div className="px-5 py-1 bg-slate-100 border-t border-slate-200/80 flex items-center space-x-3 overflow-x-auto text-[11px] text-slate-600">
        <span className="font-bold uppercase text-[10px] text-slate-400 tracking-wider">Fast Keys:</span>
        <button onClick={() => onOpenNewInvoice()} className="hover:text-blue-700 flex items-center space-x-1">
          <kbd className="fkey">F1</kbd><span>New Bill</span>
        </button>
        <button onClick={() => setActiveTab('opd-billing')} className="hover:text-blue-700 flex items-center space-x-1">
          <kbd className="fkey">F2</kbd><span>OPD Desk</span>
        </button>
        <button onClick={() => setActiveTab('ipd-billing')} className="hover:text-blue-700 flex items-center space-x-1">
          <kbd className="fkey">F3</kbd><span>IPD Folio</span>
        </button>
        <button onClick={() => setActiveTab('beds')} className="hover:text-blue-700 flex items-center space-x-1">
          <kbd className="fkey">F4</kbd><span>Bed Matrix</span>
        </button>
        <button onClick={() => setActiveTab('diagnostics')} className="hover:text-blue-700 flex items-center space-x-1">
          <kbd className="fkey">F5</kbd><span>Lab Tests</span>
        </button>
        <button onClick={() => setActiveTab('pharmacy')} className="hover:text-blue-700 flex items-center space-x-1">
          <kbd className="fkey">F6</kbd><span>Pharmacy POS</span>
        </button>
        <button onClick={() => setActiveTab('insurance')} className="hover:text-blue-700 flex items-center space-x-1">
          <kbd className="fkey">F7</kbd><span>TPA Claims</span>
        </button>
        <button onClick={() => setActiveTab('invoices')} className="hover:text-blue-700 flex items-center space-x-1">
          <kbd className="fkey">F8</kbd><span>Master Ledger</span>
        </button>
        <button onClick={() => setActiveTab('reports')} className="hover:text-blue-700 flex items-center space-x-1">
          <kbd className="fkey">F9</kbd><span>Audit Handover</span>
        </button>
      </div>

    </header>
  );
}
