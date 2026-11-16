import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema({
  id: { type: String, default: '' },
  category: { type: String, default: 'General' },
  code: { type: String, default: '' },
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});

const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  invoiceNumber: { type: String, required: true, unique: true },
  uhid: { type: String, default: 'CF-WALKIN' },
  patientId: { type: String, default: null },
  patientName: { type: String, required: true },
  patientPhone: { type: String, default: '' },
  patientGender: { type: String, default: '' },
  patientAge: { type: mongoose.Schema.Types.Mixed, default: '' },
  doctorName: { type: String, default: 'Duty Medical Officer' },
  department: { type: String, default: 'General Medicine' },
  wardBed: { type: String, default: 'OPD' },
  invoiceType: { type: String, default: 'OPD_CONSULTATION' },
  billingDate: { type: String, default: () => new Date().toISOString() },
  dueDate: { type: String, default: () => new Date().toISOString() },
  items: [InvoiceItemSchema],
  subTotal: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  advanceAdjusted: { type: Number, default: 0 },
  netPayable: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['PAID', 'PARTIAL', 'UNPAID'], default: 'PAID' },
  paymentMode: { type: String, default: 'CASH' },
  transactionRef: { type: String, default: '' },
  remarks: { type: String, default: '' },
  createdBy: { type: String, default: 'Billing Specialist' }
}, { timestamps: true });

export const InvoiceModel = mongoose.model('Invoice', InvoiceSchema);
