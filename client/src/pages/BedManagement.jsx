import React, { useState, useEffect } from 'react';
import { Bed, Users, ShieldAlert, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { api } from '../services/api';

export default function BedManagement({ onAdmitPatient }) {
  const [beds, setBeds] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const loadBeds = () => {
    api.getBeds().then(res => {
      if (res.data) setBeds(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    loadBeds();
  }, []);

  const handleToggleMaintenance = async (bed) => {
    if (bed.status === 'Occupied') {
      alert('Cannot change status of an occupied bed. Please discharge or transfer the patient first.');
      return;
    }
    const newStatus = bed.status === 'Available' ? 'Maintenance' : 'Available';
    try {
      await api.updateBedStatus(bed.id, { status: newStatus });
      loadBeds();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredBeds = beds.filter(b => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  const totalBeds = beds.length;
  const availableBeds = beds.filter(b => b.status === 'Available').length;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const maintenanceBeds = beds.filter(b => b.status === 'Maintenance').length;
  const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Bed & Ward Management Matrix</h2>
          <p className="text-xs text-slate-400">Live ward status, tariff categories, and patient allocation tracking</p>
        </div>

        <button
          onClick={onAdmitPatient}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all self-start"
        >
          Admit Patient to Free Bed
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bed Strength</p>
          <p className="text-2xl font-extrabold text-slate-800 font-mono mt-1">{totalBeds}</p>
          <p className="text-[10px] text-slate-400">All wards & critical units</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Available (Vacant)</p>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">{availableBeds}</p>
          <p className="text-[10px] text-slate-400">Ready for immediate admission</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Occupied Beds</p>
          <p className="text-2xl font-extrabold text-amber-600 font-mono mt-1">{occupiedBeds}</p>
          <p className="text-[10px] text-slate-400">Active in-patients</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm">
          <p className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">Occupancy Rate</p>
          <p className="text-2xl font-extrabold text-brand-700 font-mono mt-1">{occupancyPercent}%</p>
          <p className="text-[10px] text-slate-400">{maintenanceBeds} in sanitization / repair</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-3 text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
            filter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Beds ({totalBeds})
        </button>
        <button
          onClick={() => setFilter('Available')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
            filter === 'Available' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Available ({availableBeds})
        </button>
        <button
          onClick={() => setFilter('Occupied')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
            filter === 'Occupied' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Occupied ({occupiedBeds})
        </button>
        <button
          onClick={() => setFilter('Maintenance')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
            filter === 'Maintenance' ? 'bg-slate-500 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Maintenance ({maintenanceBeds})
        </button>
      </div>

      {/* Bed Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map(bed => {
          const isAvail = bed.status === 'Available';
          const isOcc = bed.status === 'Occupied';
          const isMaint = bed.status === 'Maintenance';

          return (
            <div
              key={bed.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isAvail
                  ? 'bg-emerald-50/30 border-emerald-200/80 shadow-soft-sm'
                  : isOcc
                  ? 'bg-amber-50/30 border-amber-200/80 shadow-soft-sm'
                  : 'bg-slate-50 border-slate-200 opacity-80'
              }`}
            >
              <div>
                {/* Header Bed # and Tariff */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
                  <span className="font-mono font-extrabold text-sm text-slate-800">
                    {bed.bedNumber}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    ₹{bed.dailyTariff}/day
                  </span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <p className="text-xs font-bold text-slate-800">{bed.wardType}</p>
                  <p className="text-[11px] text-slate-400">{bed.floor}</p>
                </div>

                {/* Patient details if occupied */}
                {isOcc && (
                  <div className="mt-3 p-2.5 bg-white/90 rounded-xl border border-amber-200/80 text-xs space-y-0.5">
                    <p className="font-bold text-slate-800 leading-tight">{bed.currentPatientName}</p>
                    <p className="text-[10px] text-slate-400">
                      Admitted: {new Date(bed.admissionDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {isAvail && (
                  <div className="mt-3 p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                    <span className="text-[11px] text-emerald-800 font-semibold flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Ready for Admission
                    </span>
                  </div>
                )}

                {isMaint && (
                  <div className="mt-3 p-2 bg-slate-100 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-600 font-semibold flex items-center justify-center">
                      <Wrench className="w-3.5 h-3.5 mr-1 text-slate-500" /> Sanitization / Service
                    </span>
                  </div>
                )}
              </div>

              {/* Status footer button */}
              <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isAvail
                    ? 'bg-emerald-100 text-emerald-800'
                    : isOcc
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {bed.status}
                </span>

                {!isOcc && (
                  <button
                    onClick={() => handleToggleMaintenance(bed)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
                  >
                    {isAvail ? 'Mark Service' : 'Mark Available'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
