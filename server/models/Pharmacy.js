import mongoose from 'mongoose';

const PharmacySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  brandName: { type: String, required: true },
  genericName: { type: String, default: '' },
  category: { type: String, default: 'Tablet' },
  batchNo: { type: String, default: '' },
  expiryDate: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 20 },
  unitPrice: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 12 },
  manufacturer: { type: String, default: '' }
}, { timestamps: true });

export const PharmacyModel = mongoose.model('Pharmacy', PharmacySchema);
