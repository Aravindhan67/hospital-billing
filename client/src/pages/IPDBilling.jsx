import React, { useState, useEffect } from 'react';
import {
  Bed,
  Plus,
  Receipt,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Calculator,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function IPDBilling({ onViewInvoice, onOpenNewInvoice, onAdmitPatient }) {
  const [admittedPatients, setAdmittedPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Discharge Modal State
  const [dischargePatient, setDischargePatient] = useState(null);
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [finalPaymentMode, setFinalPaymentMode] = useState('TPA_INSURANCE');
  const [finalTxnRef, setFinalTxnRef] = useState('');
  const [settling, setSettling] = useState(false);

  // Running charges modal
  const [chargePatient, setChargePatient] = useState(null);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeCat, setChargeCat] = useState('Nursing Care');
  const [chargeAmount, setChargeAmount] = useState(1500);

  const loadData = () => {
    Promise.all([
      api.getPatients({ type: 'IPD', status: 'Admitted' }),
      api.getBeds()
    ]).then(([pRes, bRes]) => {
      if (pRes.data) setAdmittedPatients(pRes.data);
      if (bRes.data) setBeds(bRes.data);
    }).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateDays = (admissionDate) => {
    if (!admissionDate) return 1;
    const start = new Date(admissionDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  // Handle final discharge settlement
  const handleConfirmDischarge = async (e) => {
    e.preventDefault();
    if (!dischargePatient) return;

    try {
      setSettling(true);
      const stayDays = calculateDays(dischargePatient.admissionDate);
      const bed = beds.find(b => b.id === dischargePatient.bedId || b.bedNumber === dischargePatient.bedNumber);
      const dailyTariff = bed?.dailyTariff || 1800;
      const bedTotal = dailyTariff * stayDays;
      const nursingTotal = 500 * stayDays;

      const items = [
        {
          category: 'Bed Charges',
          code: 'BED-TARIFF',
          description: `Room Tariff: ${dischargePatient.wardType || 'Ward'} (${stayDays} Days @ ₹${dailyTariff}/day)`,
          quantity: stayDays,
          unitPrice: dailyTariff,
          gstPercent: 0,
          discount: 0,
          total: bedTotal
        },
        {
          category: 'Nursing Care',
          code: 'SRV-NURSING',
          description: `General In-Patient Nursing Care (${stayDays} Days)`,
          quantity: stayDays,
          unitPrice: 500,
          gstPercent: 0,
          discount: 0,
          total: nursingTotal
        },
        {
          category: 'Doctor Visit',
          code: 'SRV-ROUNDS',
          description: `Consultant Daily Ward Rounds (${stayDays} Visits)`,
          quantity: stayDays,
          unitPrice: 600,
          gstPercent: 0,
          discount: 0,
          total: 600 * stayDays
        }
      ];

      const subTotal = items.reduce((s, it) => s + it.total, 0);
      const advance = dischargePatient.advanceDeposit || 0;
      const netPayable = Math.max(0, subTotal - advance);

      const invoicePayload = {
        patientId: dischargePatient.id,
        uhid: dischargePatient.uhid,
        patientName: dischargePatient.name,
        patientPhone: dischargePatient.phone,
        patientAge: dischargePatient.age,
        patientGender: dischargePatient.gender,
        doctorName: dischargePatient.attendingDoctorName || 'Chief Medical Officer',
        department: dischargePatient.department || 'General Medicine',
        wardBed: `${dischargePatient.bedNumber || 'GW-101'} (${dischargePatient.wardType || 'Ward'})`,
        invoiceType: 'IPD_FINAL_DISCHARGE',
        items,
        subTotal,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: subTotal,
        advanceAdjusted: advance,
        netPayable,
        paidAmount: netPayable,
        paymentStatus: 'PAID',
        paymentMode: finalPaymentMode,
        transactionRef: finalTxnRef,
        remarks: `Discharge Clearance Bill. ${dischargeNotes || 'All clinical clearances completed.'}`
      };

      const res = await api.createInvoice(invoicePayload);
      if (res.success) {
        setDischargePatient(null);
        loadData();
        onViewInvoice(res.data);
      }
    } catch (err) {
      alert('Error during discharge clearance: ' + err.message);
    } finally {
      setSettling(false);
    }
  };

  // Handle adding running charges
  const handleAddCharge = async (e) => {
    e.preventDefault();
    if (!chargePatient) return;

    try {
      const items = [
        {
          category: chargeCat,
          code: 'IPD-RUNNING',
          description: chargeDesc || `${chargeCat} Charges`,
          quantity: 1,
          unitPrice: Number(chargeAmount),
          gstPercent: 0,
          discount: 0,
          total: Number(chargeAmount)
        }
      ];

      const invoicePayload = {
        patientId: chargePatient.id,
        uhid: chargePatient.uhid,
        patientName: chargePatient.name,
        patientPhone: chargePatient.phone,
        patientAge: chargePatient.age,
        patientGender: chargePatient.gender,
        doctorName: chargePatient.attendingDoctorName,
        department: chargePatient.department,
        wardBed: chargePatient.bedNumber,
        invoiceType: 'IPD_INTERIM',
        items,
        subTotal: Number(chargeAmount),
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: Number(chargeAmount),
        advanceAdjusted: 0,
        netPayable: Number(chargeAmount),
        paidAmount: 0,
        balanceDue: Number(chargeAmount),
        paymentStatus: 'UNPAID',
        paymentMode: 'TPA_INSURANCE',
        remarks: 'Interim running charge added to bed folio'
      };

      const res = await api.createInvoice(invoicePayload);
      if (res.success) {
        setChargePatient(null);
        setChargeDesc('');
        loadData();
        alert('Running charge added to patient folio!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">IPD In-Patient Admissions & Bed Folio</h2>
          <p className="text-xs text-slate-400">Manage running bed tariffs, daily doctor visits, advance deposits, and final discharge billing</p>
        </div>

        <button
          onClick={onAdmitPatient}
          className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New In-Patient Admission</span>
        </button>
      </div>

      {/* Admitted Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {admittedPatients.map((pat) => {
          const stayDays = calculateDays(pat.admissionDate);
          return (
            <div
              key={pat.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm hover:shadow-soft transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Bed Badge & Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-brand-50 text-brand-700 border border-brand-200">
                      {pat.bedNumber || 'Bed Assigned'}
                    </span>
                    <span className="text-[11px] text-slate-400">{pat.wardType}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Stay: Day {stayDays}
                  </span>
                </div>

                {/* Patient Information */}
                <div className="mt-3 space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm">{pat.name}</h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span className="font-mono text-brand-700 font-semibold">{pat.uhid}</span>
                    <span>•</span>
                    <span>{pat.age} Y / {pat.gender}</span>
                    <span>•</span>
                    <span>Blood: <strong className="text-slate-700">{pat.bloodGroup}</strong></span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium pt-1">
                    Dr: <strong className="text-slate-800">{pat.attendingDoctorName || 'Assigned Consultant'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    Diagnosis: {pat.diagnosis || 'Under Evaluation'}
                  </p>
                </div>

                {/* Financial Ledger Mini-Card */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Initial Advance Deposited:</span>
                    <span className="font-mono font-semibold text-slate-800">₹{(pat.advanceDeposit || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total Running Billed:</span>
                    <span className="font-mono font-semibold text-slate-800">₹{(pat.totalBilled || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-slate-200/60 text-slate-800">
                    <span>Folio Balance Due:</span>
                    <span className="font-mono text-rose-600">₹{(pat.balanceDue || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Insurance Pill if active */}
                {pat.insurance?.hasInsurance && (
                  <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-teal-50/60 border border-teal-100 text-[11px] flex items-center justify-between text-teal-800">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate max-w-[150px]">{pat.insurance.tpaName}</span>
                    </div>
                    <span className="font-mono font-bold">Appr: ₹{(pat.insurance.preAuthApproved || 0).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setChargePatient(pat)}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors"
                >
                  + Add Charge
                </button>
                <button
                  onClick={() => setDischargePatient(pat)}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-soft-sm transition-all"
                >
                  Discharge Bill
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discharge Clearance Modal */}
      {dischargePatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-lg overflow-hidden border border-slate-200 text-xs">
            <div className="px-6 py-4 bg-teal-50 border-b border-teal-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-800">Final IPD Discharge & Settlement</h3>
              </div>
              <button onClick={() => setDischargePatient(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleConfirmDischarge} className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <p className="font-bold text-slate-800 text-sm">{dischargePatient.name}</p>
                <p className="text-slate-500">UHID: <span className="font-mono text-brand-700 font-bold">{dischargePatient.uhid}</span> | Bed: {dischargePatient.bedNumber}</p>
                <p className="text-slate-500">Stay Duration: <strong>{calculateDays(dischargePatient.admissionDate)} Days</strong></p>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-700">
                  <span>Advance Deposit Adjustment:</span>
                  <span className="font-mono font-bold text-emerald-700">₹{(dischargePatient.advanceDeposit || 0).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Final Settlement Payment Mode</label>
                <select
                  value={finalPaymentMode}
                  onChange={(e) => setFinalPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="TPA_INSURANCE">TPA / Cashless Claim Settlement</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CARD">Debit / Credit Card POS</option>
                  <option value="CASH">Cash Counter</option>
                  <option value="BANK_TRANSFER">Bank Wire</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / TPA Settlement Approval #</label>
                <input
                  type="text"
                  value={finalTxnRef}
                  onChange={(e) => setFinalTxnRef(e.target.value)}
                  placeholder="e.g. TPA-SETTLE-88902 or POS-9941"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discharge Summary / Clinical Notes</label>
                <input
                  type="text"
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  placeholder="e.g. Hemodynamically stable, wound healthy. Follow up in 7 days."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Confirming discharge will calculate total room tariff, adjust the advance deposit, release Bed {dischargePatient.bedNumber}, and print the Final Bill.</span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDischargePatient(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settling}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-soft"
                >
                  {settling ? 'Settling...' : 'Confirm Discharge & Print Final Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Running Charge Modal */}
      {chargePatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Add Running Charge to Folio</h3>
              <button onClick={() => setChargePatient(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddCharge} className="p-6 space-y-4">
              <p className="text-slate-600 font-medium">Patient: <strong>{chargePatient.name}</strong> ({chargePatient.bedNumber})</p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Category</label>
                <select
                  value={chargeCat}
                  onChange={(e) => setChargeCat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="Doctor Visit">Consultant Round Visit</option>
                  <option value="Nursing Care">Special Nursing Care</option>
                  <option value="Equipment Charges">Medical Oxygen / Ventilator</option>
                  <option value="Procedure">Dressing / Minor Procedure</option>
                  <option value="Pharmacy">IPD Pharmacy Infusions</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  placeholder="e.g. High Flow Oxygen Therapy (24 hrs)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setChargePatient(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-soft"
                >
                  Post to Folio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
