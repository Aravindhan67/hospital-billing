import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Bed,
  TestTube2,
  Pill,
  ShieldCheck,
  FileText,
  Users,
  Stethoscope,
  Tags,
  BarChart3,
  Settings,
  HeartPulse,
  Sparkles,
  ChevronRight,
  ShieldPlus
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, category: 'Core Terminal', key: 'Home' },
  { id: 'opd-billing', label: 'OPD Consultation Token', icon: Receipt, category: 'Billing Operations', key: 'F2' },
  { id: 'ipd-billing', label: 'IPD Admissions & Discharge', icon: Bed, category: 'Billing Operations', key: 'F3' },
  { id: 'beds', label: 'Bed & Ward Matrix', icon: Bed, category: 'Clinical Operations', key: 'F4' },
  { id: 'diagnostics', label: 'Diagnostics & Lab Requisition', icon: TestTube2, category: 'Billing Operations', key: 'F5' },
  { id: 'pharmacy', label: 'Pharmacy Dispensary POS', icon: Pill, category: 'Billing Operations', key: 'F6' },
  { id: 'insurance', label: 'Insurance & TPA Claims', icon: ShieldCheck, category: 'Billing Operations', key: 'F7' },
  { id: 'invoices', label: 'Master Billing Register', icon: FileText, category: 'Financial Ledger', key: 'F8' },
  { id: 'patients', label: 'Patient Directory (UHID)', icon: Users, category: 'Master Records' },
  { id: 'doctors', label: 'Doctors & Consultants', icon: Stethoscope, category: 'Master Records' },
  { id: 'tariffs', label: 'Tariff Schedule Master', icon: Tags, category: 'Master Records' },
  { id: 'reports', label: 'Daily Collection & Audit', icon: BarChart3, category: 'Financial Ledger', key: 'F9' },
  { id: 'settings', label: 'Hospital Settings & Letterhead', icon: Settings, category: 'Configuration' }
];

export default function Sidebar({ activeTab, setActiveTab, stats, theme }) {
  const isTrad = theme === 'traditional';

  return (
    <aside className={`w-72 flex flex-col h-screen select-none shrink-0 transition-all duration-300 border-r ${
      isTrad
        ? 'bg-[#0f172a] text-slate-200 border-slate-800'
        : 'bg-white text-slate-700 border-slate-200/80'
    }`}>
      
      {/* Brand Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isTrad
          ? 'bg-[#1e293b] border-slate-700/80'
          : 'bg-gradient-to-b from-brand-50/50 to-white border-slate-100'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-soft ${
            isTrad ? 'bg-[#1e40af]' : 'bg-brand-600'
          }`}>
            <ShieldPlus className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className={`font-extrabold text-base tracking-tight ${
                isTrad ? 'text-white' : 'text-slate-800'
              }`}>
                Cura<span className={isTrad ? 'text-blue-400' : 'text-brand-600'}>Flow</span>
              </span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                isTrad ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-brand-100 text-brand-700 border-brand-200'
              }`}>
                ERP HIS
              </span>
            </div>
            <p className={`text-[11px] font-medium ${isTrad ? 'text-slate-400' : 'text-slate-400'}`}>
              Hospital Revenue Terminal
            </p>
          </div>
        </div>
      </div>

      {/* Cashier Badge */}
      <div className={`mx-3 mt-3 px-3 py-2 rounded-lg border flex items-center justify-between text-xs ${
        isTrad
          ? 'bg-slate-800/80 border-slate-700 text-slate-300'
          : 'bg-teal-50/60 border-teal-100/60 text-slate-700'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-[11px]">Station #01 Online</span>
        </div>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
          isTrad ? 'bg-slate-900 text-amber-300' : 'bg-white text-teal-800'
        }`}>
          VOUCHER ACTIVE
        </span>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showHeader = index === 0 || menuItems[index - 1].category !== item.category;

          return (
            <React.Fragment key={item.id}>
              {showHeader && (
                <div className="pt-2.5 pb-1 px-3">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    isTrad ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {item.category}
                  </p>
                </div>
              )}
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                  isActive
                    ? isTrad
                      ? 'bg-[#1e40af] text-white shadow-soft font-bold'
                      : 'bg-brand-500 text-white shadow-soft font-bold'
                    : isTrad
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : isTrad ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-brand-600'
                  }`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {item.key && !isActive && (
                    <kbd className={`px-1 py-0.5 rounded text-[9px] font-mono font-bold ${
                      isTrad ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.key}
                    </kbd>
                  )}
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-white/90" />
                  )}
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom User Shift Panel */}
      <div className={`p-3 border-t text-xs ${
        isTrad
          ? 'bg-[#1e293b]/70 border-slate-800 text-slate-400'
          : 'bg-slate-50 border-slate-100 text-slate-500'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-bold text-[11px] leading-tight ${isTrad ? 'text-slate-200' : 'text-slate-700'}`}>
              OPERATOR: CHIEF CASHIER
            </p>
            <p className="text-[10px] text-slate-400 font-mono">ID: HOSP-USER-102</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
            AUDIT OK
          </span>
        </div>
      </div>

    </aside>
  );
}
