import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true },
  tagline: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  emergency: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  gstin: { type: String, default: '' },
  regNo: { type: String, default: '' },
  panNo: { type: String, default: '' },
  currency: { type: String, default: '₹' },
  invoiceNotes: { type: String, default: '' },
  footerDisclaimer: { type: String, default: '' }
}, { timestamps: true });

export const SettingsModel = mongoose.model('HospitalSettings', SettingsSchema);
