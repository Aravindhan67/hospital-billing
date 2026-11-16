import React, { useState, useEffect } from 'react';
import {
  Receipt,
  User,
  Stethoscope,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  Search,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function OPDBilling({ onViewInvoice }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [opdInvoices, setOpdInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [uhid, setUhid] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [department, setDepartment] = useState('');
  const [consultationFee, setConsultationFee] = useState(600);
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [addEcg, setAddEcg] = useState(false);
  const [addSugar, setAddSugar] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = () => {
    Promise.all([
      api.getPatients({ type: 'OPD' }),
      api.getDoctors(),
      api.getInvoices({ type: 'OPD_CONSULTATION' })
    ]).then(([pRes, dRes, iRes]) => {
      if (pRes.data) setPatients(pRes.data);
      if (dRes.data) {
        setDoctors(dRes.data);
        if (dRes.data.length > 0 && !selectedDoctorId) {
          const first = dRes.data[0];
          setSelectedDoctorId(first.id);
          setDoctorName(first.name);
          setDepartment(first.department);
          setConsultationFee(first.opdFee || 600);
        }
      }
      if (iRes.data) setOpdInvoices(iRes.data);
    }).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePatientSelect = (pId) => {
    setSelectedPatientId(pId);
    const pat = patients.find(p => p.id === pId);
    if (pat) {
      setPatientName(pat.name);
      setUhid(pat.uhid);
      setPatientPhone(pat.phone);
      setPatientAge(pat.age);
      setPatientGender(pat.gender);
    } else {
      setPatientName('');
      setUhid('');
      setPatientPhone('');
      setPatientAge('');
    }
  };

  const handleDoctorChange = (docId) => {
    setSelectedDoctorId(docId);
    const doc = doctors.find(d => d.id === docId);
    if (doc) {
      setDoctorName(doc.name);
      setDepartment(doc.department);
      setConsultationFee(doc.opdFee);
    }
  };

  // Compute Grand Total
  let subTotal = Number(consultationFee) || 0;
  if (addEcg) subTotal += 400;
  if (addSugar) subTotal += 150;
  const netTotal = Math.max(0, subTotal - (Number(discount) || 0));

  const handleGenerateOpdReceipt = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Please enter or select a patient name');
      return;
    }

    try {
      setLoading(true);
      const items = [
        {
          category: 'Consultation',
          code: 'OPD-FEE',
          description: `OPD Specialist Consultation - ${doctorName}`,
          quantity: 1,
          unitPrice: Number(consultationFee),
          gstPercent: 0,
          discount: Number(discount) || 0,
          total: Number(consultationFee) - (Number(discount) || 0)
        }
      ];

      if (addEcg) {
        items.push({
          category: 'Diagnostics',
          code: 'RAD-ECG-12',
          description: '12-Lead Electrocardiogram (ECG Routine)',
          quantity: 1,
          unitPrice: 400,
          gstPercent: 0,
          discount: 0,
          total: 400
        });
      }

      if (addSugar) {
        items.push({
          category: 'Diagnostics',
          code: 'LAB-RBS',
          description: 'Random Blood Sugar (RBS Glucometry)',
          quantity: 1,
          unitPrice: 150,
          gstPercent: 0,
          discount: 0,
          total: 150
        });
      }

      const invoicePayload = {
        patientId: selectedPatientId || null,
        uhid: uhid || 'CF-WALKIN',
        patientName,
        patientPhone,
        patientAge: Number(patientAge) || 0,
        patientGender,
        doctorName,
        department,
        wardBed: 'OPD Suite',
        invoiceType: 'OPD_CONSULTATION',
        items,
        subTotal,
        totalDiscount: Number(discount) || 0,
        totalTax: 0,
        grandTotal: netTotal,
        advanceAdjusted: 0,
        netPayable: netTotal,
        paidAmount: netTotal,
        paymentStatus: 'PAID',
        paymentMode,
        transactionRef,
        remarks: 'OPD Consultation Token Issued'
      };

      const res = await api.createInvoice(invoicePayload);
      if (res.success) {
        setMessage('OPD Consultation Bill & Token Generated Successfully!');
        setTimeout(() => setMessage(''), 4000);
        // Reset patient details
        setPatientName('');
        setUhid('');
        setPatientPhone('');
        setPatientAge('');
        setSelectedPatientId('');
        setDiscount(0);
        setAddEcg(false);
        setAddSugar(false);
        loadData();
        onViewInvoice(res.data);
      }
    } catch (err) {
      alert('Error creating bill: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">OPD Out-Patient Billing & Token Desk</h2>
          <p className="text-xs text-slate-400">Fast token generation, doctor fee processing, and instant thermal receipt printing</p>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Grid: OPD Form & Doctors Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Fast OPD Token Generation */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-4">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">New OPD Consultation Receipt</h3>
              <p className="text-[11px] text-slate-400">Assign doctor, compute consultation fee, and issue queue token</p>
            </div>
          </div>

          <form onSubmit={handleGenerateOpdReceipt} className="space-y-4 text-xs">
            {/* Patient Search / Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Registered OPD Patient (or enter new walk-in)
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              >
                <option value="">-- Walk-in Patient (Create Quick Ticket) --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.uhid}] - {p.phone} ({p.age} Y / {p.gender})
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="Yrs"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">UHID / MRN</label>
                <input
                  type="text"
                  value={uhid || 'AUTO-GENERATED'}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
                />
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consulting Specialist *</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  required
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.department}) - ₹{d.opdFee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consultation Tariff (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Add-ons */}
            <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 space-y-2">
              <span className="font-bold text-brand-900 uppercase text-[10px] tracking-wider block">
                Instant OPD Point-of-Care Add-ons
              </span>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addEcg}
                    onChange={(e) => setAddEcg(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="text-slate-700 font-medium">12-Lead ECG (+ ₹400)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addSugar}
                    onChange={(e) => setAddSugar(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="text-slate-700 font-medium">Random Blood Sugar (+ ₹150)</span>
                </label>
              </div>
            </div>

            {/* Payment & Concession */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Concession / Discount (₹)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CASH">Cash Counter</option>
                  <option value="CARD">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Net Bill Amount</label>
                <div className="px-3 py-2 bg-teal-50 border border-teal-200 rounded-xl font-mono font-bold text-sm text-teal-800">
                  ₹{netTotal.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-soft flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>{loading ? 'Processing...' : `Collect ₹${netTotal} & Print OPD Receipt`}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Available Doctors & OPD Schedules */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm">
            <h4 className="font-bold text-slate-800 text-sm mb-3">Today's Consultant Roster</h4>
            <div className="space-y-2.5">
              {doctors.map(d => (
                <div
                  key={d.id}
                  onClick={() => handleDoctorChange(d.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedDoctorId === d.id
                      ? 'bg-brand-50/70 border-brand-300 ring-1 ring-brand-400'
                      : 'bg-slate-50/50 border-slate-200/70 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{d.name}</p>
                      <p className="text-[11px] text-brand-700 font-medium">{d.specialization}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{d.roomNo} • {d.availability}</p>
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      ₹{d.opdFee}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Today's OPD Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Today's OPD Billing Register</h4>
            <p className="text-xs text-slate-400">Tokens and receipts issued in current shift</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/60 font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Consultant</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Fee (₹)</th>
                <th className="py-3 px-4 text-center">Payment Mode</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {opdInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{inv.patientName}</td>
                  <td className="py-3 px-4">{inv.doctorName}</td>
                  <td className="py-3 px-4">{inv.department}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">₹{inv.grandTotal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {inv.paymentMode}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onViewInvoice(inv)}
                      className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg"
                      title="Print Receipt"
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
