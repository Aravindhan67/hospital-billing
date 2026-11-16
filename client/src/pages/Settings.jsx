import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function Settings({ onSettingsUpdated }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then(res => {
      if (res.data) setSettings(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleChange = (field, val) => {
    setSettings({ ...settings, [field]: val });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        if (onSettingsUpdated) onSettingsUpdated(res.data);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Hospital Configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hospital Profile & Billing Configuration</h2>
          <p className="text-xs text-slate-400">Customize hospital letterhead, GSTIN tax credentials, contact numbers, and printed receipt disclaimers</p>
        </div>

        {saved && (
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft-sm space-y-5 text-xs">
        
        {/* Hospital Entity Details */}
        <div className="space-y-3">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Hospital Organization & Letterhead
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Hospital Official Legal Name *</label>
              <input
                type="text"
                value={settings.hospitalName}
                onChange={(e) => handleChange('hospitalName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Motto / Hospital Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Full Postal Address (Prints on Bills)</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing Phone / Helpdesk</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Hotline (24x7)</label>
              <input
                type="text"
                value={settings.emergency}
                onChange={(e) => handleChange('emergency', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing & TPA Email</label>
              <input
                type="text"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Legal & Tax IDs */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Tax & Legal Identification (GST / PAN / Reg)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN (Tax ID)</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Registration No.</label>
              <input
                type="text"
                value={settings.regNo}
                onChange={(e) => handleChange('regNo', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hospital PAN</label>
              <input
                type="text"
                value={settings.panNo}
                onChange={(e) => handleChange('panNo', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Invoice Disclaimers */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Invoice Disclaimers & Patient Terms
          </span>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Terms & Conditions (Printed on bill footer)</label>
            <textarea
              rows={3}
              value={settings.invoiceNotes}
              onChange={(e) => handleChange('invoiceNotes', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Compassionate Footer Note</label>
            <input
              type="text"
              value={settings.footerDisclaimer}
              onChange={(e) => handleChange('footerDisclaimer', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-soft transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
}
