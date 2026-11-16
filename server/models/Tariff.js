import mongoose from 'mongoose';

const TariffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'General Service' },
  standardRate: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 0 },
  unit: { type: String, default: 'Per Service' }
}, { timestamps: true });

export const TariffModel = mongoose.model('Tariff', TariffSchema);
