import React, { useState, useEffect } from 'react';
import { X, UserPlus, Bed, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function NewPatientModal({ onClose, onPatientCreated, defaultType = 'OPD' }) {
  const [patientType, setPatientType] = useState(defaultType);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [allergies, setAllergies] = useState('None');
  const [emergencyContact, setEmergencyContact] = useState('');
  
  // Clinical / IPD
  const [diagnosis, setDiagnosis] = useState('');
  const [attendingDoctorId, setAttendingDoctorId] = useState('');
  const [attendingDoctorName, setAttendingDoctorName] = useState('');
  const [department, setDepartment] = useState('General Medicine');
  const [bedId, setBedId] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [wardType, setWardType] = useState('');
  const [advanceDeposit, setAdvanceDeposit] = useState(patientType === 'IPD' ? 10000 : 0);

  // Insurance
  const [hasInsurance, setHasInsurance] = useState(false);
  const [tpaName, setTpaName] = useState('');
  const [policyNo, setPolicyNo] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [preAuthApproved, setPreAuthApproved] = useState(0);

  // Masters
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getDoctors(), api.getBeds()])
      .then(([dRes, bRes]) => {
        if (dRes.data) setDoctors(dRes.data);
        if (bRes.data) setBeds(bRes.data);
      })
      .catch(console.error);
  }, []);

  const handleDoctorChange = (docId) => {
    setAttendingDoctorId(docId);
    const doc = doctors.find(d => d.id === docId);
    if (doc) {
      setAttendingDoctorName(doc.name);
      setDepartment(doc.department);
    }
  };

  const handleBedChange = (bId) => {
    setBedId(bId);
    const bed = beds.find(b => b.id === bId);
    if (bed) {
      setBedNumber(bed.bedNumber);
      setWardType(bed.wardType);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Patient name and phone number are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const patientData = {
        name,
        age: Number(age) || 0,
        gender,
        phone,
        email,
        address,
        bloodGroup,
        allergies,
        emergencyContact,
        patientType,
        status: patientType === 'IPD' ? 'Admitted' : 'Outpatient',
        admissionDate: patientType === 'IPD' ? new Date().toISOString() : null,
        attendingDoctorId,
        attendingDoctorName,
        department,
        bedId: patientType === 'IPD' ? bedId : null,
        bedNumber: patientType === 'IPD' ? bedNumber : null,
        wardType: patientType === 'IPD' ? wardType : null,
        diagnosis,
        advanceDeposit: Number(advanceDeposit) || 0,
        insurance: {
          hasInsurance,
          tpaName: hasInsurance ? tpaName : '',
          policyNo: hasInsurance ? policyNo : '',
          cardNo: hasInsurance ? cardNo : '',
          preAuthApproved: hasInsurance ? Number(preAuthApproved) || 0 : 0,
          coPayPercent: 0
        }
      };

      const res = await api.createPatient(patientData);
      if (res.success) {
        onPatientCreated(res.data);
      } else {
        setError(res.error || 'Failed to create patient record');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableBeds = beds.filter(b => b.status === 'Available');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {patientType === 'IPD' ? 'IPD In-Patient Hospital Admission' : 'Patient Registration (OPD)'}
              </h3>
              <p className="text-[11px] text-slate-400">Generate UHID, assign attending consultant & ward allocation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Category Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setPatientType('OPD'); setAdvanceDeposit(0); }}
              className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                patientType === 'OPD' ? 'bg-white text-brand-700 shadow-soft-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              OPD (Out-Patient)
            </button>
            <button
              type="button"
              onClick={() => { setPatientType('IPD'); if (!advanceDeposit) setAdvanceDeposit(15000); }}
              className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                patientType === 'IPD' ? 'bg-white text-teal-700 shadow-soft-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              IPD (In-Patient Admission)
            </button>
          </div>

          {/* Section: Demographics */}
          <div className="space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Patient Demographics</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age (Years) *</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 42"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Postal Code"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Kin Name & Phone"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section: Clinical Assignment & IPD Admission */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Consultant & Ward Assignment</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attending Consultant</label>
                <select
                  value={attendingDoctorId}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="">-- Select Attending Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Admitting Diagnosis / Chief Complaints</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Appendicitis, Uncontrolled Hypertension"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              {patientType === 'IPD' && (
                <>
                  <div>
                    <label className="block font-semibold text-teal-800 mb-1">
                      Allocate Ward & Bed *
                    </label>
                    <select
                      value={bedId}
                      onChange={(e) => handleBedChange(e.target.value)}
                      className="w-full px-3 py-2 bg-teal-50/50 border border-teal-200 rounded-xl text-slate-800 font-semibold"
                      required={patientType === 'IPD'}
                    >
                      <option value="">-- Select Available Bed ({availableBeds.length} Free) --</option>
                      {availableBeds.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.bedNumber} - {b.wardType} (₹{b.dailyTariff}/day)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Initial Advance Deposit Collected (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={advanceDeposit}
                        onChange={(e) => setAdvanceDeposit(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section: Insurance / TPA */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span className="font-semibold text-slate-700">Health Insurance / TPA Cashless Facility</span>
              </div>
              <input
                type="checkbox"
                id="insCheck"
                checked={hasInsurance}
                onChange={(e) => setHasInsurance(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
            </div>

            {hasInsurance && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Insurance / TPA Provider</label>
                  <input
                    type="text"
                    value={tpaName}
                    onChange={(e) => setTpaName(e.target.value)}
                    placeholder="e.g. Star Health / Care Health"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Policy / Member ID</label>
                  <input
                    type="text"
                    value={policyNo}
                    onChange={(e) => setPolicyNo(e.target.value)}
                    placeholder="e.g. SH-99410-2026"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Pre-Auth Approved Sum (₹)</label>
                  <input
                    type="number"
                    value={preAuthApproved}
                    onChange={(e) => setPreAuthApproved(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
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
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-soft disabled:opacity-50"
            >
              {loading ? 'Registering...' : patientType === 'IPD' ? 'Admit to Ward & Generate UHID' : 'Register OPD Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
