import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Printer,
  CreditCard,
  Download,
  PlusCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function InvoicesList({ onViewInvoice, onPayBalance, onOpenNewInvoice, searchQuery = '' }) {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const loadInvoices = () => {
    setLoading(true);
    api.getInvoices().then(res => {
      if (res.data) setInvoices(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.uhid.toLowerCase().includes(q) ||
      (inv.patientPhone && inv.patientPhone.includes(q)) ||
      (inv.transactionRef && inv.transactionRef.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
    const matchesType = typeFilter === 'ALL' || inv.invoiceType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalBilled = filtered.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const totalPaid = filtered.reduce((s, i) => s + (i.paidAmount || 0), 0);
  const totalDue = filtered.reduce((s, i) => s + (i.balanceDue || 0), 0);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Invoice No', 'Bill Date', 'Patient Name', 'UHID', 'Type', 'Doctor', 'Grand Total', 'Paid Amount', 'Balance Due', 'Status', 'Payment Mode'];
    const rows = filtered.map(i => [
      i.invoiceNumber,
      new Date(i.billingDate).toLocaleDateString(),
      `"${i.patientName}"`,
      i.uhid,
      i.invoiceType,
      `"${i.doctorName}"`,
      i.grandTotal,
      i.paidAmount,
      i.balanceDue,
      i.paymentStatus,
      i.paymentMode
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CuraFlow_Billing_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Master Hospital Invoices & Tax Register</h2>
          <p className="text-xs text-slate-400">Complete historical billing audit trail across OPD, IPD, Pharmacy, and Diagnostics</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-soft-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenNewInvoice()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtered Billed Volume</p>
          <p className="text-xl font-extrabold text-slate-800 font-mono mt-1">₹{totalBilled.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">{filtered.length} Invoices Found</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Realized Collections</p>
          <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">₹{totalPaid.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Cash / UPI / Card / TPA</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Outstanding Dues</p>
          <p className="text-xl font-extrabold text-rose-600 font-mono mt-1">₹{totalDue.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Pending settlement</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Invoice #, Patient Name, UHID, Phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid Only</option>
            <option value="PARTIAL">Partial Payment</option>
            <option value="UNPAID">Unpaid Only</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold"
          >
            <option value="ALL">All Categories</option>
            <option value="OPD_CONSULTATION">OPD Consultation</option>
            <option value="IPD_FINAL_DISCHARGE">IPD Final Discharge</option>
            <option value="IPD_INTERIM">IPD Running Bill</option>
            <option value="PHARMACY">Pharmacy Store</option>
            <option value="DIAGNOSTIC">Diagnostic & Lab</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/60 font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Patient / UHID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Consultant</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(inv.billingDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{inv.patientName}</p>
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
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="View / Print Tax Bill"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {inv.balanceDue > 0 && onPayBalance && (
                        <button
                          onClick={() => onPayBalance(inv)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Collect Due Payment"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
