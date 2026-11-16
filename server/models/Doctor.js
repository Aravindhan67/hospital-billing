import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  specialization: { type: String, default: '' },
  opdFee: { type: Number, default: 500 },
  ipdVisitFee: { type: Number, default: 750 },
  phone: { type: String, default: '' },
  roomNo: { type: String, default: 'Consultation Room 1' },
  availability: { type: String, default: 'Mon - Sat, 09:00 AM - 01:00 PM' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const DoctorModel = mongoose.model('Doctor', DoctorSchema);
