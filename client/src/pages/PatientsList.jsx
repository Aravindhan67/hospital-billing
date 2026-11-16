import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Receipt,
  Bed,
  ShieldCheck,
  Phone,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function PatientsList({ onOpenNewPatient, onOpenBillForPatient }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const loadPatients = () => {
    api.getPatients().then(res => {
      if (res.data) setPatients(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.uhid.toLowerCase().includes(q) ||
      p.phone.includes(q);
    const matchesType = typeFilter === 'ALL' || p.patientType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Unified Patient Registry & UHID Directory</h2>
          <p className="text-xs text-slate-400">Demographic profiles, clinical assignments, insurance cover, and patient billing ledgers</p>
        </div>

        <button
          onClick={onOpenNewPatient}
          className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all self-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by UHID, Patient Name or Phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              typeFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            All ({patients.length})
          </button>
          <button
            onClick={() => setTypeFilter('IPD')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              typeFilter === 'IPD' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            IPD In-Patients
          </button>
          <button
            onClick={() => setTypeFilter('OPD')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              typeFilter === 'OPD' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            OPD Out-Patients
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/60 font-semibold">
              <tr>
                <th className="py-3 px-4">UHID / MRN</th>
                <th className="py-3 px-4">Patient Name & Age</th>
                <th className="py-3 px-4">Type / Ward</th>
                <th className="py-3 px-4">Doctor / Department</th>
                <th className="py-3 px-4 text-right">Total Billed</th>
                <th className="py-3 px-4 text-right">Advance / Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Insurance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filtered.map(pat => (
                <tr key={pat.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">{pat.uhid}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{pat.name}</p>
                    <p className="text-[10px] text-slate-400">{pat.age} Y / {pat.gender} • Blood: {pat.bloodGroup}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pat.patientType === 'IPD' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-brand-50 text-brand-800'
                    }`}>
                      {pat.patientType} {pat.bedNumber ? `(${pat.bedNumber})` : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-slate-800">{pat.attendingDoctorName || 'Duty Doctor'}</p>
                    <p className="text-[10px] text-slate-400">{pat.department}</p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    ₹{(pat.totalBilled || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700 font-semibold">
                    ₹{(pat.totalPaid || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={(pat.balanceDue || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}>
                      ₹{(pat.balanceDue || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {pat.insurance?.hasInsurance ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {pat.insurance.tpaName?.slice(0, 15)}...
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Self Pay</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onOpenBillForPatient(pat)}
                      className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-xs transition-colors flex items-center space-x-1 mx-auto"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Create Bill</span>
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
