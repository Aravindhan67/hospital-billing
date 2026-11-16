import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Receipt,
  Search,
  User,
  Stethoscope,
  Sparkles,
  Calculator,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function NewInvoiceModal({ onClose, onInvoiceCreated, defaultType = 'OPD_CONSULTATION', preSelectedPatient = null }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [pharmacy, setPharmacy] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState(preSelectedPatient?.id || '');
  const [patientName, setPatientName] = useState(preSelectedPatient?.name || '');
  const [uhid, setUhid] = useState(preSelectedPatient?.uhid || '');
  const [patientPhone, setPatientPhone] = useState(preSelectedPatient?.phone || '');
  const [patientAge, setPatientAge] = useState(preSelectedPatient?.age || '');
  const [patientGender, setPatientGender] = useState(preSelectedPatient?.gender || 'Male');
  const [doctorName, setDoctorName] = useState(preSelectedPatient?.attendingDoctorName || '');
  const [department, setDepartment] = useState(preSelectedPatient?.department || 'General Medicine');
  const [wardBed, setWardBed] = useState(preSelectedPatient?.bedNumber || 'OPD');
  const [invoiceType, setInvoiceType] = useState(defaultType);
  const [advanceAdjusted, setAdvanceAdjusted] = useState(preSelectedPatient?.advanceDeposit ? Math.min(preSelectedPatient.advanceDeposit, 20000) : 0);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [paidNow, setPaidNow] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Line Items
  const [items, setItems] = useState([
    { id: '1', category: 'Consultation', code: 'OPD-GEN', description: 'General Outpatient Consultation', quantity: 1, unitPrice: 600, gstPercent: 0, discount: 0, total: 600 }
  ]);

  // Load masters on mount
  useEffect(() => {
    Promise.all([
      api.getPatients(),
      api.getDoctors(),
      api.getTariffs(),
      api.getPharmacy(),
      api.getDiagnostics()
    ]).then(([pRes, dRes, tRes, phRes, dgRes]) => {
      if (pRes.data) setPatients(pRes.data);
      if (dRes.data) setDoctors(dRes.data);
      if (tRes.data) setTariffs(tRes.data);
      if (phRes.data) setPharmacy(phRes.data);
      if (dgRes.data) setDiagnostics(dgRes.data);
    }).catch(console.error);
  }, []);

  // When patient is selected from dropdown
  const handleSelectPatient = (pId) => {
    setSelectedPatientId(pId);
    const pat = patients.find(p => p.id === pId);
    if (pat) {
      setPatientName(pat.name);
      setUhid(pat.uhid);
      setPatientPhone(pat.phone);
      setPatientAge(pat.age);
      setPatientGender(pat.gender);
      if (pat.attendingDoctorName) setDoctorName(pat.attendingDoctorName);
      if (pat.department) setDepartment(pat.department);
      if (pat.bedNumber) setWardBed(`${pat.bedNumber} (${pat.wardType || 'Ward'})`);
      if (pat.advanceDeposit) setAdvanceAdjusted(pat.advanceDeposit);
    }
  };

  // Add Item Line
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        category: 'Service',
        code: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        gstPercent: 0,
        discount: 0,
        total: 0
      }
    ]);
  };

  // Preset quick addition
  const handleAddPreset = (category, item) => {
    let newItem = {
      id: Date.now().toString(),
      category,
      code: item.code || '',
      description: item.name || item.brandName || item.description,
      quantity: 1,
      unitPrice: item.standardRate || item.unitPrice || item.price || 0,
      gstPercent: item.gstPercent || 0,
      discount: 0,
      total: 0
    };
    newItem.total = newItem.unitPrice * (1 + newItem.gstPercent / 100);
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    const it = { ...updated[index], [field]: value };

    const qty = Number(it.quantity) || 1;
    const price = Number(it.unitPrice) || 0;
    const gst = Number(it.gstPercent) || 0;
    const disc = Number(it.discount) || 0;
    const taxable = Math.max(0, (qty * price) - disc);
    const tax = (taxable * gst) / 100;
    it.total = Number((taxable + tax).toFixed(2));

    updated[index] = it;
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subTotal = items.reduce((s, it) => s + ((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)), 0);
  const totalDiscount = items.reduce((s, it) => s + (Number(it.discount) || 0), 0);
  const totalTax = items.reduce((s, it) => {
    const taxable = Math.max(0, ((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)) - (Number(it.discount) || 0));
    return s + ((taxable * (Number(it.gstPercent) || 0)) / 100);
  }, 0);
  const grandTotal = Math.max(0, subTotal - totalDiscount + totalTax);
  const netPayable = Math.max(0, grandTotal - (Number(advanceAdjusted) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError('Please provide or select a patient name');
      return;
    }
    if (items.some(i => !i.description.trim() || Number(i.unitPrice) < 0)) {
      setError('Please ensure all line items have descriptions and valid prices');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const invoicePayload = {
        patientId: selectedPatientId || null,
        uhid: uhid || 'CF-WALKIN',
        patientName,
        patientPhone,
        patientAge: Number(patientAge) || 0,
        patientGender,
        doctorName,
        department,
        wardBed,
        invoiceType,
        items,
        subTotal,
        totalDiscount,
        totalTax,
        grandTotal,
        advanceAdjusted: Number(advanceAdjusted) || 0,
        netPayable,
        paidAmount: paidNow ? netPayable : 0,
        paymentStatus: paidNow ? 'PAID' : 'UNPAID',
        paymentMode,
        transactionRef,
        remarks
      };

      const res = await api.createInvoice(invoicePayload);
      if (res.success) {
        onInvoiceCreated(res.data);
      } else {
        setError(res.error || 'Failed to create invoice');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Generate Hospital Invoice</h3>
              <p className="text-[11px] text-slate-400">Itemized billing with GST calculation and advance adjustment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Patient & Invoice Type Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
            {/* Patient Selector */}
            <div className="col-span-1 md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Select Existing Patient (or enter details below)
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => handleSelectPatient(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">-- Direct Walk-in / New Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.uhid}] - {p.patientType} ({p.department || 'General'})
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bill Type *</label>
              <select
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="OPD_CONSULTATION">OPD Consultation</option>
                <option value="IPD_FINAL_DISCHARGE">IPD Final Discharge Settlement</option>
                <option value="IPD_INTERIM">IPD Interim / Running Bill</option>
                <option value="IPD_SURGERY">Surgical & OT Procedure</option>
                <option value="PHARMACY">Pharmacy / Medicines</option>
                <option value="DIAGNOSTIC">Diagnostic & Lab Requisition</option>
              </select>
            </div>

            {/* Patient Basic Fields */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient Full Name *</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="Yrs"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Attending Doctor</label>
              <select
                value={doctorName}
                onChange={(e) => {
                  setDoctorName(e.target.value);
                  const doc = doctors.find(d => d.name === e.target.value);
                  if (doc) setDepartment(doc.department);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.department})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ward / Bed / Counter</label>
              <input
                type="text"
                value={wardBed}
                onChange={(e) => setWardBed(e.target.value)}
                placeholder="e.g. GW-101 / OPD"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-[11px]">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] shrink-0">Quick Add:</span>
            {tariffs.slice(0, 3).map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleAddPreset('Tariff Service', t)}
                className="px-2.5 py-1 bg-teal-50 text-brand-700 rounded-lg hover:bg-teal-100 font-medium whitespace-nowrap border border-teal-200/50"
              >
                + {t.name.slice(0, 24)}... (₹{t.standardRate})
              </button>
            ))}
            {diagnostics.slice(0, 2).map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleAddPreset('Diagnostics', d)}
                className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 font-medium whitespace-nowrap border border-sky-200/50"
              >
                + {d.name.slice(0, 20)}... (₹{d.price})
              </button>
            ))}
            {pharmacy.slice(0, 2).map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAddPreset('Pharmacy', p)}
                className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 font-medium whitespace-nowrap border border-amber-200/50"
              >
                + {p.brandName} (₹{p.unitPrice})
              </button>
            ))}
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Itemized Medical Services & Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[620px] divide-y divide-slate-100 p-2 space-y-2">
                {items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-slate-50">
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                        placeholder="Service / Medicine / Test Description"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <select
                        value={item.category}
                        onChange={(e) => handleUpdateItem(idx, 'category', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600"
                      >
                        <option value="Consultation">Consultation</option>
                        <option value="Bed Charges">Bed Tariff</option>
                        <option value="Nursing Care">Nursing Care</option>
                        <option value="Surgery">Surgery / OT</option>
                        <option value="Diagnostics">Diagnostics</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Procedure">Procedure</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                      />
                    </div>

                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-slate-400">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                          placeholder="Rate"
                          className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-right font-mono"
                        />
                      </div>
                    </div>

                    <div className="col-span-1">
                      <select
                        value={item.gstPercent}
                        onChange={(e) => handleUpdateItem(idx, 'gstPercent', e.target.value)}
                        className="w-full px-1.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                      </select>
                    </div>

                    <div className="col-span-1 text-right font-bold text-slate-800 font-mono">
                      ₹{item.total.toLocaleString()}
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="text-slate-300 hover:text-rose-500 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Totals & Advance Adjustment Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Payment & Settlement</span>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="paidNowCheck"
                  checked={paidNow}
                  onChange={(e) => setPaidNow(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300"
                />
                <label htmlFor="paidNowCheck" className="font-semibold text-slate-700">
                  Collect Payment Instantly (Mark as Settled / Paid)
                </label>
              </div>

              {paidNow && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <label className="block text-slate-500 mb-1">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="CASH">Cash Counter</option>
                      <option value="CARD">Debit / Credit Card</option>
                      <option value="TPA_INSURANCE">TPA / Cashless Insurance</option>
                      <option value="BANK_TRANSFER">Bank Wire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Transaction Ref #</label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. UPI-998811"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-500 mb-1">Remarks / Medical Billing Notes</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Routine OPD visit or Final discharge clearance"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Subtotal:</span>
                <span>₹{subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Taxes (GST):</span>
                <span>+ ₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Total Discounts:</span>
                <span>- ₹{totalDiscount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-800 border-t border-brand-200 pt-1.5">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              {/* Advance Adjustment Input */}
              <div className="flex items-center justify-between pt-1 text-brand-800">
                <span>Less Advance Deposit Adjusted:</span>
                <div className="w-28 relative">
                  <span className="absolute left-2 top-1 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={advanceAdjusted}
                    onChange={(e) => setAdvanceAdjusted(e.target.value)}
                    className="w-full pl-5 pr-2 py-1 bg-white border border-brand-200 rounded text-right text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t-2 border-slate-300 pt-2">
                <span>Net Payable:</span>
                <span className="text-brand-700">₹{netPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
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
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-soft transition-all disabled:opacity-50"
            >
              {loading ? 'Generating Bill...' : 'Create & Generate Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
