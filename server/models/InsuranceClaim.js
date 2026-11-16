import mongoose from 'mongoose';

const InsuranceClaimSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  claimNumber: { type: String, required: true, unique: true },
  invoiceNumber: { type: String, default: 'INV-2026-PENDING' },
  patientId: { type: String, default: null },
  uhid: { type: String, default: '' },
  patientName: { type: String, required: true },
  tpaName: { type: String, required: true },
  policyNo: { type: String, default: '' },
  treatmentType: { type: String, default: 'Medical Treatment' },
  requestedAmount: { type: Number, default: 0 },
  approvedAmount: { type: Number, default: 0 },
  coPayAmount: { type: Number, default: 0 },
  deductible: { type: Number, default: 0 },
  claimStatus: { type: String, default: 'Submitted' },
  submissionDate: { type: String, default: () => new Date().toISOString() },
  approvalDate: { type: String, default: null },
  settlementDate: { type: String, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

export const InsuranceClaimModel = mongoose.model('InsuranceClaim', InsuranceClaimSchema);
