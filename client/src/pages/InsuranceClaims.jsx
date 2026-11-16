import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function InsuranceClaims() {
  const [claims, setClaims] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New claim modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [uhid, setUhid] = useState('');
  const [tpaName, setTpaName] = useState('Star Health & Allied Insurance');
  const [policyNo, setPolicyNo] = useState('');
  const [treatmentType, setTreatmentType] = useState('');
  const [requestedAmount, setRequestedAmount] = useState(50000);
  const [notes, setNotes] = useState('');

  // Status update modal
  const [activeClaim, setActiveClaim] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('Approved');
  const [approvedAmount, setApprovedAmount] = useState(0);

  const loadData = () => {
    Promise.all([api.getClaims(), api.getPatients()])
      .then(([cRes, pRes]) => {
        if (cRes.data) setClaims(cRes.data);
        if (pRes.data) setPatients(pRes.data);
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
      if (pat.insurance?.tpaName) setTpaName(pat.insurance.tpaName);
      if (pat.insurance?.policyNo) setPolicyNo(pat.insurance.policyNo);
      if (pat.diagnosis) setTreatmentType(pat.diagnosis);
    }
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Patient name is required');
      return;
    }

    try {
      const payload = {
        patientId: selectedPatientId || null,
        uhid: uhid || 'CF-INS',
        patientName,
        tpaName,
        policyNo,
        treatmentType: treatmentType || 'Hospital Medical Treatment',
        requestedAmount: Number(requestedAmount),
        approvedAmount: 0,
        claimStatus: 'Submitted',
        notes
      };

      const res = await api.createClaim(payload);
      if (res.success) {
        setShowAddModal(false);
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateClaimStatus = async (e) => {
    e.preventDefault();
    if (!activeClaim) return;

    try {
      const res = await api.updateClaim(activeClaim.id, {
        claimStatus: updateStatus,
        approvedAmount: Number(approvedAmount)
      });
      if (res.success) {
        setActiveClaim(null);
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredClaims = claims.filter(c => {
    const matchesSearch = c.patientName.toLowerCase().includes(search.toLowerCase()) ||
      c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.tpaName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.claimStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRequested = claims.reduce((s, c) => s + (c.requestedAmount || 0), 0);
  const totalApproved = claims.reduce((s, c) => s + (c.approvedAmount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Insurance & TPA Cashless Desk</h2>
          <p className="text-xs text-slate-400">Pre-authorization tracking, document processing, and cashless claims reconciliation</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Pre-Auth Claim Request</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Claims Processed</p>
          <p className="text-2xl font-extrabold text-slate-800 font-mono mt-1">{claims.length}</p>
          <p className="text-[10px] text-slate-400">Cashless pre-auths & settlements</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">Total Requested Sum</p>
          <p className="text-2xl font-extrabold text-brand-700 font-mono mt-1">₹{totalRequested.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Under TPA adjudication</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Total Approved Value</p>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">₹{totalApproved.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Sanctioned by insurance desks</p>
        </div>
      </div>

      {/* Claims List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden space-y-4 p-5">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Patient, TPA or Claim #..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center space-x-1.5 text-xs overflow-x-auto">
            {['ALL', 'Submitted', 'Pre-Approved', 'Approved', 'Settled'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === st ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-y border-slate-200/60 font-semibold">
              <tr>
                <th className="py-3 px-4">Claim #</th>
                <th className="py-3 px-4">Patient / UHID</th>
                <th className="py-3 px-4">TPA / Insurer</th>
                <th className="py-3 px-4">Treatment / Procedure</th>
                <th className="py-3 px-4 text-right">Requested (₹)</th>
                <th className="py-3 px-4 text-right">Approved (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredClaims.map(claim => (
                <tr key={claim.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">
                    {claim.claimNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{claim.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{claim.uhid}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">{claim.tpaName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Pol: {claim.policyNo || 'N/A'}</p>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate">
                    {claim.treatmentType}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    ₹{claim.requestedAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    ₹{claim.approvedAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      claim.claimStatus === 'Approved' || claim.claimStatus === 'Settled'
                        ? 'bg-emerald-100 text-emerald-800'
                        : claim.claimStatus === 'Pre-Approved'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {claim.claimStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setActiveClaim(claim);
                        setUpdateStatus(claim.claimStatus);
                        setApprovedAmount(claim.approvedAmount || claim.requestedAmount);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* New Pre-Auth Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-lg overflow-hidden border border-slate-200 text-xs">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Submit Cashless Pre-Auth Claim</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateClaim} className="p-6 space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">-- Choose Admitted / OPD Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} [{p.uhid}] - {p.patientType}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Sunita Kapoor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">TPA / Insurance Company</label>
                  <input
                    type="text"
                    value={tpaName}
                    onChange={(e) => setTpaName(e.target.value)}
                    placeholder="e.g. Care Health Insurance"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Policy Number</label>
                  <input
                    type="text"
                    value={policyNo}
                    onChange={(e) => setPolicyNo(e.target.value)}
                    placeholder="e.g. CHI-2026-99120"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposed Treatment / Diagnosis</label>
                <input
                  type="text"
                  value={treatmentType}
                  onChange={(e) => setTreatmentType(e.target.value)}
                  placeholder="e.g. Total Knee Replacement surgery"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requested Estimate Sum (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-soft"
                >
                  Transmit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Claim Modal */}
      {activeClaim && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Update Claim Status</h3>
              <button onClick={() => setActiveClaim(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleUpdateClaimStatus} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <p className="font-bold text-slate-800">{activeClaim.patientName}</p>
                <p className="text-slate-500 font-mono">{activeClaim.claimNumber} • {activeClaim.tpaName}</p>
                <p className="text-slate-600">Requested: <strong>₹{activeClaim.requestedAmount.toLocaleString()}</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjudication Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Submitted">Submitted (Under Review)</option>
                  <option value="Pre-Approved">Pre-Approved (Query Answered)</option>
                  <option value="Approved">Approved (Final Sanction)</option>
                  <option value="Settled">Settled (Funds Disbursed)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sanctioned / Approved Amount (₹)</label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveClaim(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-soft"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
