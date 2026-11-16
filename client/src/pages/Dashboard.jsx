import React from 'react';
import {
  DollarSign,
  Users,
  Bed,
  Receipt,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight,
  PlusCircle,
  FileText,
  ShieldCheck,
  Pill,
  TestTube2,
  CheckCircle2,
  Printer
} from 'lucide-react';

export default function Dashboard({ stats, onViewInvoice, onQuickBill, onAdmitPatient, setActiveTab }) {
  const rev = stats?.revenue || {
    totalRevenue: 0,
    totalBilled: 0,
    pendingDues: 0,
    opdRevenue: 0,
    ipdRevenue: 0,
    pharmacyRevenue: 0,
    diagnosticRevenue: 0
  };

  const beds = stats?.beds || { totalBeds: 12, occupiedBeds: 5, availableBeds: 6, occupancyRate: 42 };
  const patients = stats?.patients || { totalPatients: 7, activeIpdCount: 5, activeOpdCount: 2 };
  const recentInvoices = stats?.recentInvoices || [];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner & Quick Action Launchpad */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-brand-800 rounded-2xl p-6 text-white shadow-soft-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12 translate-x-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-teal-100 text-xs font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Hospital Revenue & Billing Operations Console</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Good day, Clinical Administrator
            </h2>
            <p className="text-xs text-teal-100/90 mt-1 max-w-xl leading-relaxed">
              Real-time synchronization across OPD Tokens, IPD Bed Tariffs, Diagnostic Requisitions, and Pharmacy Dispensary.
            </p>
          </div>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onQuickBill('OPD_CONSULTATION')}
              className="px-3.5 py-2 bg-white text-brand-800 rounded-xl text-xs font-bold hover:bg-teal-50 shadow-soft transition-all flex items-center space-x-1.5"
            >
              <Receipt className="w-3.5 h-3.5 text-brand-600" />
              <span>OPD Token Bill</span>
            </button>
            <button
              onClick={onAdmitPatient}
              className="px-3.5 py-2 bg-teal-500/80 hover:bg-teal-500 text-white border border-teal-300/40 rounded-xl text-xs font-bold shadow-soft transition-all flex items-center space-x-1.5"
            >
              <Bed className="w-3.5 h-3.5" />
              <span>Admit to IPD</span>
            </button>
            <button
              onClick={() => setActiveTab('pharmacy')}
              className="px-3.5 py-2 bg-teal-900/60 hover:bg-teal-900/80 text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
            >
              <Pill className="w-3.5 h-3.5 text-teal-300" />
              <span>Pharmacy POS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top KPI Cards (Humane Soft Colors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Realized Collections */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm hover:shadow-soft transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Realized Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-slate-800 font-mono">
              ₹{rev.totalRevenue.toLocaleString()}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 100% Validated
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total billed volume: <strong className="text-slate-600 font-mono">₹{rev.totalBilled.toLocaleString()}</strong>
          </p>
        </div>

        {/* Card 2: IPD Running & Collections */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm hover:shadow-soft transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IPD In-Patient Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-slate-800 font-mono">
              ₹{rev.ipdRevenue.toLocaleString()}
            </h3>
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
              {patients.activeIpdCount} Admitted
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ward & surgical procedures
          </p>
        </div>

        {/* Card 3: OPD & Diagnostics Collections */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm hover:shadow-soft transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">OPD & Lab Collections</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-slate-800 font-mono">
              ₹{(rev.opdRevenue + rev.diagnosticRevenue).toLocaleString()}
            </h3>
            <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
              Quick Turnaround
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            OPD: ₹{rev.opdRevenue.toLocaleString()} | Lab: ₹{rev.diagnosticRevenue.toLocaleString()}
          </p>
        </div>

        {/* Card 4: Outstanding Dues / Debtor Recovery */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm hover:shadow-soft transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Dues & TPA</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-amber-600 font-mono">
              ₹{rev.pendingDues.toLocaleString()}
            </h3>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              TPA / Discharge Due
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Payable upon insurance final settlement
          </p>
        </div>
      </div>

      {/* Grid: Bed Matrix Snapshot + Department Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bed Occupancy Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Bed className="w-4 h-4 text-brand-600" />
              <h4 className="font-bold text-slate-800 text-sm">Bed Occupancy Status</h4>
            </div>
            <button
              onClick={() => setActiveTab('beds')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
            >
              View Grid →
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-extrabold text-slate-800 font-mono">{beds.occupancyRate}%</p>
              <p className="text-xs text-slate-400 mt-0.5">Live Occupancy Ratio</p>
            </div>
            <div className="space-y-1 text-right text-xs">
              <p className="text-emerald-700 font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                {beds.availableBeds} Available Beds
              </p>
              <p className="text-amber-700 font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                {beds.occupiedBeds} Occupied Beds
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${beds.occupancyRate}%` }}
            ></div>
          </div>

          <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">General</span>
              <span className="font-bold text-slate-700">2 / 4 Occ</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Deluxe & SP</span>
              <span className="font-bold text-slate-700">2 / 4 Occ</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">ICU / CCU</span>
              <span className="font-bold text-slate-700">1 / 3 Occ</span>
            </div>
          </div>
        </div>

        {/* Department Revenue Contribution */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-slate-800 text-sm">Department Revenue Streams</h4>
            </div>
            <span className="text-xs text-slate-400 font-medium">Auto-aggregated</span>
          </div>

          <div className="space-y-3.5">
            {/* IPD Stream */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center">
                  <span className="w-2.5 h-2.5 rounded bg-sky-500 mr-2"></span>
                  In-Patient Department (IPD & Surgeries)
                </span>
                <span className="font-mono text-slate-800">₹{rev.ipdRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full"
                  style={{ width: `${rev.totalRevenue ? (rev.ipdRevenue / rev.totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* OPD Stream */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center">
                  <span className="w-2.5 h-2.5 rounded bg-brand-500 mr-2"></span>
                  Out-Patient Consultation (OPD)
                </span>
                <span className="font-mono text-slate-800">₹{rev.opdRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full"
                  style={{ width: `${rev.totalRevenue ? (rev.opdRevenue / rev.totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Diagnostics Stream */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center">
                  <span className="w-2.5 h-2.5 rounded bg-teal-500 mr-2"></span>
                  Laboratory & Radiology Diagnostics
                </span>
                <span className="font-mono text-slate-800">₹{rev.diagnosticRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full"
                  style={{ width: `${rev.totalRevenue ? (rev.diagnosticRevenue / rev.totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Pharmacy Stream */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 mr-2"></span>
                  Pharmacy & Injectables Dispensary
                </span>
                <span className="font-mono text-slate-800">₹{rev.pharmacyRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${rev.totalRevenue ? (rev.pharmacyRevenue / rev.totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Billing Register */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Recent Billing Register</h4>
            <p className="text-xs text-slate-400">Latest medical receipts generated across all desks</p>
          </div>
          <button
            onClick={() => setActiveTab('invoices')}
            className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center space-x-1"
          >
            <span>View All Invoices</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/60 font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient / UHID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Department / Doctor</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{inv.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{inv.uhid}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {inv.invoiceType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-slate-700">{inv.doctorName}</p>
                    <p className="text-[10px] text-slate-400">{inv.department}</p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    ₹{inv.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700 font-semibold">
                    ₹{inv.paidAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-slate-400'}>
                      ₹{inv.balanceDue.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.paymentStatus === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : inv.paymentStatus === 'PARTIAL'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onViewInvoice(inv)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Print / View Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
