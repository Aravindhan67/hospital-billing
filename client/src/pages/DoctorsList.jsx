import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Search, Phone, DoorOpen, Calendar } from 'lucide-react';
import { api } from '../services/api';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    code: '',
    name: '',
    department: 'General Medicine',
    specialization: '',
    opdFee: 700,
    ipdVisitFee: 900,
    phone: '',
    roomNo: 'Consultation Suite 101',
    availability: 'Mon - Fri, 09:00 AM - 01:00 PM'
  });

  const loadDoctors = () => {
    api.getDoctors().then(res => {
      if (res.data) setDoctors(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createDoctor(newDoc);
      if (res.success) {
        setShowAddModal(false);
        loadDoctors();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.department.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Doctors & Clinical Specialists Roster</h2>
          <p className="text-xs text-slate-400">Consultant schedules, OPD consultation fees, IPD visit tariffs, and suite allocations</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Specialist</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-soft-sm max-w-md flex items-center space-x-2 text-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search doctor by name, department, or specialty..."
          className="w-full bg-transparent focus:outline-none"
        />
      </div>

      {/* Grid of Doctors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm hover:shadow-soft transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-brand-700 font-bold uppercase">{doc.code}</span>
                <h3 className="font-bold text-slate-800 text-sm">{doc.name}</h3>
                <p className="text-xs text-brand-700 font-semibold">{doc.department}</p>
                <p className="text-[11px] text-slate-400">{doc.specialization}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Stethoscope className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>OPD Consultation Tariff:</span>
                <span className="font-mono font-bold text-slate-800">₹{doc.opdFee}</span>
              </div>
              <div className="flex justify-between">
                <span>IPD Round Tariff:</span>
                <span className="font-mono font-bold text-slate-800">₹{doc.ipdVisitFee}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <p className="flex items-center text-slate-600">
                <DoorOpen className="w-3.5 h-3.5 mr-1 text-slate-400" /> {doc.roomNo}
              </p>
              <p className="flex items-center text-slate-500">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> {doc.availability}
              </p>
              <p className="flex items-center text-slate-500">
                <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" /> {doc.phone || '+91 Hospital PBX Ext'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Add Consulting Specialist</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddDoctor} className="p-6 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Full Name & Degrees *</label>
                <input
                  type="text"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  placeholder="e.g. Dr. Ramesh Gupta, MS, MCh"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Department</label>
                <input
                  type="text"
                  value={newDoc.department}
                  onChange={(e) => setNewDoc({ ...newDoc, department: e.target.value })}
                  placeholder="e.g. Cardiology"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sub-Specialization</label>
                <input
                  type="text"
                  value={newDoc.specialization}
                  onChange={(e) => setNewDoc({ ...newDoc, specialization: e.target.value })}
                  placeholder="e.g. Interventional Cardiology"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">OPD Fee (₹)</label>
                  <input
                    type="number"
                    value={newDoc.opdFee}
                    onChange={(e) => setNewDoc({ ...newDoc, opdFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IPD Visit Fee (₹)</label>
                  <input
                    type="number"
                    value={newDoc.ipdVisitFee}
                    onChange={(e) => setNewDoc({ ...newDoc, ipdVisitFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Suite / Room #</label>
                  <input
                    type="text"
                    value={newDoc.roomNo}
                    onChange={(e) => setNewDoc({ ...newDoc, roomNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newDoc.phone}
                    onChange={(e) => setNewDoc({ ...newDoc, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
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
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-soft"
                >
                  Save Specialist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
