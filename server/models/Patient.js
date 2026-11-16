import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  uhid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, default: 0 },
  gender: { type: String, default: 'Other' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  bloodGroup: { type: String, default: 'Not Specified' },
  allergies: { type: String, default: 'None' },
  emergencyContact: { type: String, default: '' },
  patientType: { type: String, enum: ['OPD', 'IPD'], default: 'OPD' },
  status: { type: String, default: 'Outpatient' },
  admissionDate: { type: String, default: null },
  dischargeDate: { type: String, default: null },
  attendingDoctorId: { type: String, default: null },
  attendingDoctorName: { type: String, default: '' },
  department: { type: String, default: 'General Medicine' },
  bedId: { type: String, default: null },
  bedNumber: { type: String, default: null },
  wardType: { type: String, default: null },
  diagnosis: { type: String, default: 'General checkup' },
  advanceDeposit: { type: Number, default: 0 },
  insurance: {
    hasInsurance: { type: Boolean, default: false },
    tpaName: { type: String, default: '' },
    policyNo: { type: String, default: '' },
    cardNo: { type: String, default: '' },
    preAuthApproved: { type: Number, default: 0 },
    coPayPercent: { type: Number, default: 0 }
  },
  totalBilled: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 }
}, { timestamps: true });

export const PatientModel = mongoose.model('Patient', PatientSchema);
