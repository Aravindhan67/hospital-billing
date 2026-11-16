import mongoose from 'mongoose';

const DiagnosticSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  sampleType: { type: String, default: 'Blood' },
  turnaroundTime: { type: String, default: '4 Hours' },
  price: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 0 },
  normalRange: { type: String, default: 'Normal' }
}, { timestamps: true });

export const DiagnosticModel = mongoose.model('Diagnostic', DiagnosticSchema);
