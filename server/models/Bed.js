import mongoose from 'mongoose';

const BedSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  bedNumber: { type: String, required: true },
  wardType: { type: String, required: true },
  floor: { type: String, default: '' },
  dailyTariff: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'], default: 'Available' },
  currentPatientId: { type: String, default: null },
  currentPatientName: { type: String, default: null },
  admissionDate: { type: String, default: null }
}, { timestamps: true });

export const BedModel = mongoose.model('Bed', BedSchema);
