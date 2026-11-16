import React, { useState, useEffect } from 'react';
import { Tags, Plus, Search } from 'lucide-react';
import { api } from '../services/api';

export default function TariffMaster() {
  const [tariffs, setTariffs] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTariff, setNewTariff] = useState({
    code: '',
    name: '',
    category: 'Surgical Services',
    standardRate: 1500,
    gstPercent: 0,
    unit: 'Per Procedure'
  });

  const loadTariffs = () => {
    api.getTariffs().then(res => {
      if (res.data) setTariffs(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    loadTariffs();
  }, []);

  const handleAddTariff = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createTariff(newTariff);
      if (res.success) {
        setShowAddModal(false);
        loadTariffs();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = tariffs.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tariff & Hospital Services Schedule</h2>
          <p className="text-xs text-slate-400">Standard rates for Operation Theatres, critical care equipment, doctor rounds, and nursing services</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service Rate</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-soft-sm max-w-md flex items-center space-x-2 text-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by service name or code (e.g. OT, Ventilator, Dressing)..."
          className="w-full bg-transparent focus:outline-none"
        />
      </div>

      {/* Tariff Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/60 font-semibold">
              <tr>
                <th className="py-3 px-4">Service Code</th>
                <th className="py-3 px-4">Service Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Billing Unit</th>
                <th className="py-3 px-4 text-right">Standard Rate (₹)</th>
                <th className="py-3 px-4 text-right">GST %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">{t.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{t.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{t.unit}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    ₹{t.standardRate.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-600">
                    {t.gstPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Add Service Tariff</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddTariff} className="p-6 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Description *</label>
                <input
                  type="text"
                  value={newTariff.name}
                  onChange={(e) => setNewTariff({ ...newTariff, name: e.target.value })}
                  placeholder="e.g. Minor OT Debridement"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Code</label>
                  <input
                    type="text"
                    value={newTariff.code}
                    onChange={(e) => setNewTariff({ ...newTariff, code: e.target.value })}
                    placeholder="SRV-OT-MIN"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newTariff.category}
                    onChange={(e) => setNewTariff({ ...newTariff, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="OT Charges">OT Charges</option>
                    <option value="Surgical Services">Surgical Services</option>
                    <option value="Nursing & Care">Nursing & Care</option>
                    <option value="Doctor Visit">Doctor Visit</option>
                    <option value="Equipment Charges">Equipment Charges</option>
                    <option value="Emergency & Transport">Ambulance / Emergency</option>
                    <option value="Procedure">Procedure</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rate (₹) *</label>
                  <input
                    type="number"
                    value={newTariff.standardRate}
                    onChange={(e) => setNewTariff({ ...newTariff, standardRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST %</label>
                  <select
                    value={newTariff.gstPercent}
                    onChange={(e) => setNewTariff({ ...newTariff, gstPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newTariff.unit}
                    onChange={(e) => setNewTariff({ ...newTariff, unit: e.target.value })}
                    placeholder="Per Day"
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
