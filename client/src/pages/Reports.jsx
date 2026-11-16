import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  CreditCard,
  Building2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRevenueReports().then(res => {
      if (res.data) setReportData(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading || !reportData) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Financial Reports...</div>;
  }

  const { summary, paymentModes, totalInvoices, invoices } = reportData;

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Financial Revenue & Audit Intelligence</h2>
          <p className="text-xs text-slate-400">Cashier collections handover, departmental revenue share, and outstanding ledger</p>
        </div>

        <button
          onClick={handlePrintReport}
          className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all self-start"
        >
          <Printer className="w-4 h-4" />
          <span>Print Financial Summary</span>
        </button>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Billed Value</p>
          <p className="text-2xl font-extrabold text-slate-800 font-mono mt-1">₹{(summary.totalBilled || 0).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{totalInvoices} Invoices Issued</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Total Realized Collections</p>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">₹{(summary.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Realized at cash & digital desks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Total Unrecovered Dues</p>
          <p className="text-2xl font-extrabold text-rose-600 font-mono mt-1">₹{(summary.pendingDues || 0).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Pending discharge & TPA claims</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">Recovery Ratio</p>
          <p className="text-2xl font-extrabold text-brand-700 font-mono mt-1">
            {summary.totalBilled > 0 ? Math.round((summary.totalRevenue / summary.totalBilled) * 100) : 100}%
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Healthy collection efficiency</p>
        </div>
      </div>

      {/* Grid: Payment Method Breakdown + Department Share */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Payment Methods */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            Payment Mode Collections
          </h3>
          <div className="space-y-3 text-xs">
            {Object.entries(paymentModes).map(([mode, amt]) => {
              const pct = summary.totalRevenue > 0 ? ((amt / summary.totalRevenue) * 100).toFixed(1) : 0;
              return (
                <div key={mode} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">{mode}</span>
                    <span className="font-mono text-slate-800">₹{amt.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            Department Contribution Summary
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-100">
              <span className="font-bold text-sky-900">In-Patient (IPD & Surgeries)</span>
              <span className="font-mono font-bold text-sky-900">₹{(summary.ipdRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 border border-teal-100">
              <span className="font-bold text-teal-900">Out-Patient Consultation (OPD)</span>
              <span className="font-mono font-bold text-teal-900">₹{(summary.opdRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="font-bold text-emerald-900">Pathology & Radiology Diagnostics</span>
              <span className="font-mono font-bold text-emerald-900">₹{(summary.diagnosticRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="font-bold text-amber-900">Pharmacy & Medical Store</span>
              <span className="font-mono font-bold text-amber-900">₹{(summary.pharmacyRevenue || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Outstanding Dues Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm p-5 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Outstanding Dues Audit Ledger</h3>
        <p className="text-xs text-slate-400">Patients and TPAs with pending balances requiring collection</p>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-y border-slate-200/60 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Patient Name / UHID</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4 text-right">Grand Total</th>
                <th className="py-2.5 px-4 text-right">Paid</th>
                <th className="py-2.5 px-4 text-right font-bold text-rose-600">Balance Due</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {invoices.filter(i => (i.balanceDue || 0) > 0).map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-4 font-mono font-bold text-brand-700">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-800">{inv.patientName} ({inv.uhid})</td>
                  <td className="py-2.5 px-4">{inv.invoiceType}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">₹{inv.grandTotal.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-700">₹{inv.paidAmount.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">₹{inv.balanceDue.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {inv.paymentStatus}
                    </span>
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
