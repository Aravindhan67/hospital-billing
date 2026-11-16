import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function PaymentModal({ invoice, onClose, onPaymentSuccess }) {
  const [amount, setAmount] = useState(invoice.balanceDue || 0);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }
    if (Number(amount) > invoice.balanceDue) {
      setError(`Amount cannot exceed the balance due of ₹${invoice.balanceDue}`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await api.recordPayment(invoice.id, {
        paidAmount: Number(amount),
        paymentMode,
        transactionRef,
        remarks
      });
      if (data.success) {
        onPaymentSuccess(data.data);
      } else {
        setError(data.error || 'Failed to record payment');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-md overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Record Bill Settlement</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <p className="font-semibold text-slate-700">Invoice: <span className="font-mono text-brand-700">{invoice.invoiceNumber}</span></p>
            <p className="text-slate-500">Patient: <strong className="text-slate-700">{invoice.patientName}</strong> ({invoice.uhid})</p>
            <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-700">
              <span>Outstanding Due:</span>
              <span className="font-bold text-rose-600 font-mono">₹{invoice.balanceDue.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Payment Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                max={invoice.balanceDue}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>
            <div className="flex space-x-2 mt-1.5">
              <button
                type="button"
                onClick={() => setAmount(invoice.balanceDue)}
                className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md"
              >
                Full Due (₹{invoice.balanceDue.toLocaleString()})
              </button>
              {invoice.balanceDue > 1000 && (
                <button
                  type="button"
                  onClick={() => setAmount(Math.round(invoice.balanceDue / 2))}
                  className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md"
                >
                  50% (₹{Math.round(invoice.balanceDue / 2).toLocaleString()})
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="UPI">UPI / QR Code (PhonePe, GPay, Paytm)</option>
              <option value="CASH">Cash Counter</option>
              <option value="CARD">Debit / Credit Card POS</option>
              <option value="TPA_INSURANCE">TPA / Cashless Claim Settlement</option>
              <option value="BANK_TRANSFER">Direct NEFT / RTGS</option>
              <option value="CHEQUE">Bank Cheque</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transaction Reference / UTR #</label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. UPI/20261116/12399 or Cheque # 99281"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Cashier Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Paid at Discharge counter"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-soft disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
