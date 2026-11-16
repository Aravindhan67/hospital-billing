import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedData } from '../data/seedData.js';
import { isConnectedToMongo } from './db.js';
import { PatientModel } from '../models/Patient.js';
import { DoctorModel } from '../models/Doctor.js';
import { BedModel } from '../models/Bed.js';
import { InvoiceModel } from '../models/Invoice.js';
import { PharmacyModel } from '../models/Pharmacy.js';
import { DiagnosticModel } from '../models/Diagnostic.js';
import { TariffModel } from '../models/Tariff.js';
import { InsuranceClaimModel } from '../models/InsuranceClaim.js';
import { SettingsModel } from '../models/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/db.json');

class Store {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('✓ Loaded existing hospital database from local persistent storage');
      } else {
        // Deep copy seedData
        this.data = JSON.parse(JSON.stringify(seedData));
        this.save();
        console.log('✓ Initialized hospital database with comprehensive clinical and billing seed data');
      }
    } catch (err) {
      console.warn('! Failed to load DB file, resetting to seed data:', err.message);
      this.data = JSON.parse(JSON.stringify(seedData));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save to db.json:', err.message);
    }
  }

  // Patients
  getPatients(query = {}) {
    let list = [...this.data.patients];
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        p.phone.includes(q)
      );
    }
    if (query.type) {
      list = list.filter(p => p.patientType === query.type);
    }
    if (query.status) {
      list = list.filter(p => p.status === query.status);
    }
    return list;
  }

  getPatientById(id) {
    return this.data.patients.find(p => p.id === id || p.uhid === id);
  }

  createPatient(patient) {
    const nextNumber = this.data.patients.length + 891;
    const newPatient = {
      id: `pat-${Date.now()}`,
      uhid: patient.uhid || `CF-2026-0${nextNumber}`,
      name: patient.name,
      age: Number(patient.age) || 0,
      gender: patient.gender || 'Other',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      bloodGroup: patient.bloodGroup || 'Not Specified',
      allergies: patient.allergies || 'None',
      emergencyContact: patient.emergencyContact || '',
      patientType: patient.patientType || 'OPD',
      status: patient.status || (patient.patientType === 'IPD' ? 'Admitted' : 'Outpatient'),
      admissionDate: patient.admissionDate || (patient.patientType === 'IPD' ? new Date().toISOString() : null),
      attendingDoctorId: patient.attendingDoctorId || null,
      attendingDoctorName: patient.attendingDoctorName || '',
      department: patient.department || 'General Medicine',
      bedId: patient.bedId || null,
      bedNumber: patient.bedNumber || null,
      wardType: patient.wardType || null,
      diagnosis: patient.diagnosis || 'General checkup',
      advanceDeposit: Number(patient.advanceDeposit) || 0,
      insurance: patient.insurance || {
        hasInsurance: false,
        tpaName: '',
        policyNo: '',
        cardNo: '',
        preAuthApproved: 0,
        coPayPercent: 0
      },
      totalBilled: Number(patient.advanceDeposit) || 0,
      totalPaid: Number(patient.advanceDeposit) || 0,
      balanceDue: 0,
      createdAt: new Date().toISOString()
    };

    // If assigned to a bed, mark bed occupied
    if (newPatient.bedId) {
      const bed = this.data.beds.find(b => b.id === newPatient.bedId || b.bedNumber === newPatient.bedNumber);
      if (bed) {
        bed.status = 'Occupied';
        bed.currentPatientId = newPatient.id;
        bed.currentPatientName = newPatient.name;
        bed.admissionDate = newPatient.admissionDate;

        if (isConnectedToMongo) {
          BedModel.findOneAndUpdate({ id: bed.id }, bed, { upsert: true }).catch(console.error);
        }
      }
    }

    this.data.patients.unshift(newPatient);
    this.save();

    // Persist to MongoDB Atlas
    if (isConnectedToMongo) {
      PatientModel.create(newPatient).catch(err => console.error('MongoDB Atlas save patient error:', err.message));
    }

    return newPatient;
  }

  updatePatient(id, updates) {
    const idx = this.data.patients.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const old = this.data.patients[idx];

    // Check if bed changed
    if (updates.bedId && updates.bedId !== old.bedId) {
      // Free old bed
      if (old.bedId) {
        const oldBed = this.data.beds.find(b => b.id === old.bedId);
        if (oldBed) {
          oldBed.status = 'Available';
          oldBed.currentPatientId = null;
          oldBed.currentPatientName = null;
          oldBed.admissionDate = null;
          if (isConnectedToMongo) {
            BedModel.findOneAndUpdate({ id: oldBed.id }, oldBed).catch(console.error);
          }
        }
      }
      // Occupy new bed
      const newBed = this.data.beds.find(b => b.id === updates.bedId);
      if (newBed) {
        newBed.status = 'Occupied';
        newBed.currentPatientId = old.id;
        newBed.currentPatientName = updates.name || old.name;
        newBed.admissionDate = updates.admissionDate || old.admissionDate || new Date().toISOString();
        updates.bedNumber = newBed.bedNumber;
        updates.wardType = newBed.wardType;
        if (isConnectedToMongo) {
          BedModel.findOneAndUpdate({ id: newBed.id }, newBed).catch(console.error);
        }
      }
    }

    this.data.patients[idx] = { ...old, ...updates, updatedAt: new Date().toISOString() };
    this.save();

    if (isConnectedToMongo) {
      PatientModel.findOneAndUpdate({ id }, this.data.patients[idx], { upsert: true }).catch(console.error);
    }

    return this.data.patients[idx];
  }

  // Doctors
  getDoctors() {
    return this.data.doctors;
  }

  createDoctor(doctor) {
    const newDoc = {
      id: `doc-${Date.now()}`,
      code: doctor.code || `DOC-${doctor.department?.slice(0, 4).toUpperCase() || 'GEN'}-${Math.floor(10 + Math.random() * 90)}`,
      name: doctor.name,
      department: doctor.department || 'General Medicine',
      specialization: doctor.specialization || '',
      opdFee: Number(doctor.opdFee) || 500,
      ipdVisitFee: Number(doctor.ipdVisitFee) || 750,
      phone: doctor.phone || '',
      roomNo: doctor.roomNo || 'Consultation Room 1',
      availability: doctor.availability || 'Mon - Sat, 09:00 AM - 01:00 PM',
      active: doctor.active ?? true
    };
    this.data.doctors.push(newDoc);
    this.save();

    if (isConnectedToMongo) {
      DoctorModel.create(newDoc).catch(console.error);
    }

    return newDoc;
  }

  // Beds & Wards
  getBeds() {
    return this.data.beds;
  }

  updateBedStatus(id, status, patientId = null, patientName = null) {
    const bed = this.data.beds.find(b => b.id === id);
    if (!bed) return null;
    bed.status = status;
    bed.currentPatientId = patientId;
    bed.currentPatientName = patientName;
    bed.admissionDate = status === 'Occupied' ? new Date().toISOString() : null;
    this.save();

    if (isConnectedToMongo) {
      BedModel.findOneAndUpdate({ id }, bed).catch(console.error);
    }

    return bed;
  }

  // Invoices & Billing
  getInvoices(query = {}) {
    let list = [...this.data.invoices];
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(i =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.patientName.toLowerCase().includes(q) ||
        i.uhid.toLowerCase().includes(q) ||
        (i.transactionRef && i.transactionRef.toLowerCase().includes(q))
      );
    }
    if (query.type) {
      list = list.filter(i => i.invoiceType === query.type);
    }
    if (query.status) {
      list = list.filter(i => i.paymentStatus === query.status);
    }
    return list;
  }

  getInvoiceById(id) {
    return this.data.invoices.find(i => i.id === id || i.invoiceNumber === id);
  }

  createInvoice(payload) {
    const nextSeq = this.data.invoices.length + 1006;
    const invoiceNumber = payload.invoiceNumber || `INV-2026-${nextSeq}`;

    // Calculate totals safely
    const items = (payload.items || []).map((item, idx) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const gst = Number(item.gstPercent) || 0;
      const disc = Number(item.discount) || 0;
      const taxable = (qty * price) - disc;
      const taxAmount = Number(((taxable * gst) / 100).toFixed(2));
      const total = Number((taxable + taxAmount).toFixed(2));
      return {
        id: item.id || `item-${Date.now()}-${idx}`,
        category: item.category || 'General',
        code: item.code || '',
        description: item.description,
        quantity: qty,
        unitPrice: price,
        gstPercent: gst,
        taxAmount,
        discount: disc,
        total
      };
    });

    const subTotal = Number(items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2));
    const totalDiscount = Number((items.reduce((sum, item) => sum + item.discount, 0) + (Number(payload.overallDiscount) || 0)).toFixed(2));
    const totalTax = Number(items.reduce((sum, item) => sum + item.taxAmount, 0).toFixed(2));
    const grandTotal = Number((subTotal - totalDiscount + totalTax).toFixed(2));

    const advanceAdjusted = Number(payload.advanceAdjusted) || 0;
    const netPayable = Math.max(0, Number((grandTotal - advanceAdjusted).toFixed(2)));
    const paidAmount = Number(payload.paidAmount) || 0;
    const balanceDue = Math.max(0, Number((netPayable - paidAmount).toFixed(2)));

    let paymentStatus = payload.paymentStatus;
    if (!paymentStatus) {
      if (balanceDue === 0) paymentStatus = 'PAID';
      else if (paidAmount > 0) paymentStatus = 'PARTIAL';
      else paymentStatus = 'UNPAID';
    }

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      uhid: payload.uhid || 'CF-WALKIN',
      patientId: payload.patientId || null,
      patientName: payload.patientName || 'Walk-in Patient',
      patientPhone: payload.patientPhone || '',
      patientGender: payload.patientGender || '',
      patientAge: payload.patientAge || '',
      doctorName: payload.doctorName || 'Duty Medical Officer',
      department: payload.department || 'General Medicine',
      wardBed: payload.wardBed || (payload.invoiceType?.includes('IPD') ? 'Ward Assigned' : 'OPD'),
      invoiceType: payload.invoiceType || 'OPD_CONSULTATION',
      billingDate: payload.billingDate || new Date().toISOString(),
      dueDate: payload.dueDate || new Date().toISOString(),
      items,
      subTotal,
      totalDiscount,
      totalTax,
      grandTotal,
      advanceAdjusted,
      netPayable,
      paidAmount: paidAmount + advanceAdjusted,
      balanceDue,
      paymentStatus,
      paymentMode: payload.paymentMode || 'CASH',
      transactionRef: payload.transactionRef || '',
      remarks: payload.remarks || '',
      createdBy: payload.createdBy || 'Billing Specialist'
    };

    // Update patient totals if patientId is provided
    if (newInvoice.patientId) {
      const patient = this.data.patients.find(p => p.id === newInvoice.patientId);
      if (patient) {
        patient.totalBilled = Number(((patient.totalBilled || 0) + grandTotal).toFixed(2));
        patient.totalPaid = Number(((patient.totalPaid || 0) + paidAmount + advanceAdjusted).toFixed(2));
        patient.balanceDue = Number(((patient.balanceDue || 0) + balanceDue).toFixed(2));

        if (isConnectedToMongo) {
          PatientModel.findOneAndUpdate({ id: patient.id }, patient).catch(console.error);
        }
      }
    }

    // If IPD final discharge, update patient status and release bed
    if (payload.invoiceType === 'IPD_FINAL_DISCHARGE' && payload.patientId) {
      const patient = this.data.patients.find(p => p.id === payload.patientId);
      if (patient) {
        patient.status = 'Discharged';
        patient.dischargeDate = new Date().toISOString();
        if (patient.bedId) {
          const bed = this.data.beds.find(b => b.id === patient.bedId);
          if (bed) {
            bed.status = 'Available';
            bed.currentPatientId = null;
            bed.currentPatientName = null;
            bed.admissionDate = null;
            if (isConnectedToMongo) {
              BedModel.findOneAndUpdate({ id: bed.id }, bed).catch(console.error);
            }
          }
        }
        if (isConnectedToMongo) {
          PatientModel.findOneAndUpdate({ id: patient.id }, patient).catch(console.error);
        }
      }
    }

    // Deduct stock if pharmacy item
    items.forEach(item => {
      if (item.category === 'Pharmacy' && item.code) {
        const med = this.data.pharmacy.find(p => p.code === item.code);
        if (med) {
          med.stock = Math.max(0, med.stock - item.quantity);
          if (isConnectedToMongo) {
            PharmacyModel.findOneAndUpdate({ id: med.id }, med).catch(console.error);
          }
        }
      }
    });

    this.data.invoices.unshift(newInvoice);
    this.save();

    if (isConnectedToMongo) {
      InvoiceModel.create(newInvoice).catch(console.error);
    }

    return newInvoice;
  }

  updateInvoicePayment(id, { paidAmount, paymentMode, transactionRef, remarks }) {
    const inv = this.data.invoices.find(i => i.id === id);
    if (!inv) return null;

    const addedPayment = Number(paidAmount) || 0;
    inv.paidAmount = Number((inv.paidAmount + addedPayment).toFixed(2));
    inv.balanceDue = Math.max(0, Number((inv.grandTotal - inv.paidAmount).toFixed(2)));
    if (inv.balanceDue === 0) {
      inv.paymentStatus = 'PAID';
    } else {
      inv.paymentStatus = 'PARTIAL';
    }
    if (paymentMode) inv.paymentMode = paymentMode;
    if (transactionRef) inv.transactionRef = transactionRef;
    if (remarks) inv.remarks = (inv.remarks ? `${inv.remarks} | ` : '') + remarks;

    // Update patient balance
    if (inv.patientId) {
      const p = this.data.patients.find(pt => pt.id === inv.patientId);
      if (p) {
        p.totalPaid = Number((p.totalPaid + addedPayment).toFixed(2));
        p.balanceDue = Math.max(0, Number((p.balanceDue - addedPayment).toFixed(2)));
        if (isConnectedToMongo) {
          PatientModel.findOneAndUpdate({ id: p.id }, p).catch(console.error);
        }
      }
    }

    this.save();

    if (isConnectedToMongo) {
      InvoiceModel.findOneAndUpdate({ id }, inv).catch(console.error);
    }

    return inv;
  }

  // Diagnostics Master
  getDiagnostics() {
    return this.data.diagnostics;
  }

  createDiagnostic(diag) {
    const item = {
      id: `diag-${Date.now()}`,
      code: diag.code || `LAB-${Math.floor(100 + Math.random() * 900)}`,
      name: diag.name,
      category: diag.category || 'General',
      sampleType: diag.sampleType || 'Blood',
      turnaroundTime: diag.turnaroundTime || '4 Hours',
      price: Number(diag.price) || 0,
      gstPercent: Number(diag.gstPercent) || 0,
      normalRange: diag.normalRange || 'Normal'
    };
    this.data.diagnostics.push(item);
    this.save();

    if (isConnectedToMongo) {
      DiagnosticModel.create(item).catch(console.error);
    }

    return item;
  }

  // Pharmacy Master
  getPharmacy() {
    return this.data.pharmacy;
  }

  createPharmacyItem(item) {
    const med = {
      id: `ph-${Date.now()}`,
      code: item.code || `MED-${Math.floor(100 + Math.random() * 900)}`,
      brandName: item.brandName,
      genericName: item.genericName || '',
      category: item.category || 'Tablet',
      batchNo: item.batchNo || `BT-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: item.expiryDate || '2028-12',
      stock: Number(item.stock) || 0,
      reorderLevel: Number(item.reorderLevel) || 20,
      unitPrice: Number(item.unitPrice) || 0,
      gstPercent: Number(item.gstPercent) || 12,
      manufacturer: item.manufacturer || 'Standard Pharma'
    };
    this.data.pharmacy.push(med);
    this.save();

    if (isConnectedToMongo) {
      PharmacyModel.create(med).catch(console.error);
    }

    return med;
  }

  updatePharmacyStock(id, newStock) {
    const med = this.data.pharmacy.find(p => p.id === id);
    if (!med) return null;
    med.stock = Number(newStock) || 0;
    this.save();

    if (isConnectedToMongo) {
      PharmacyModel.findOneAndUpdate({ id }, { stock: med.stock }).catch(console.error);
    }

    return med;
  }

  // Tariffs Master
  getTariffs() {
    return this.data.tariffs;
  }

  createTariff(tariff) {
    const item = {
      id: `trf-${Date.now()}`,
      code: tariff.code || `SRV-${Math.floor(100 + Math.random() * 900)}`,
      name: tariff.name,
      category: tariff.category || 'General Service',
      standardRate: Number(tariff.standardRate) || 0,
      gstPercent: Number(tariff.gstPercent) || 0,
      unit: tariff.unit || 'Per Service'
    };
    this.data.tariffs.push(item);
    this.save();

    if (isConnectedToMongo) {
      TariffModel.create(item).catch(console.error);
    }

    return item;
  }

  // Insurance Claims
  getClaims() {
    return this.data.insuranceClaims;
  }

  createClaim(claim) {
    const nextSeq = this.data.insuranceClaims.length + 44;
    const newClaim = {
      id: `clm-${Date.now()}`,
      claimNumber: `CLM-2026-00${nextSeq}`,
      invoiceNumber: claim.invoiceNumber || 'INV-2026-PENDING',
      patientId: claim.patientId,
      uhid: claim.uhid,
      patientName: claim.patientName,
      tpaName: claim.tpaName,
      policyNo: claim.policyNo || '',
      treatmentType: claim.treatmentType || 'Medical Treatment',
      requestedAmount: Number(claim.requestedAmount) || 0,
      approvedAmount: Number(claim.approvedAmount) || 0,
      coPayAmount: Number(claim.coPayAmount) || 0,
      deductible: Number(claim.deductible) || 0,
      claimStatus: claim.claimStatus || 'Submitted',
      submissionDate: new Date().toISOString(),
      approvalDate: claim.claimStatus === 'Approved' ? new Date().toISOString() : null,
      settlementDate: null,
      notes: claim.notes || ''
    };
    this.data.insuranceClaims.unshift(newClaim);
    this.save();

    if (isConnectedToMongo) {
      InsuranceClaimModel.create(newClaim).catch(console.error);
    }

    return newClaim;
  }

  updateClaim(id, updates) {
    const claim = this.data.insuranceClaims.find(c => c.id === id);
    if (!claim) return null;
    Object.assign(claim, updates);
    if (updates.claimStatus === 'Approved' && !claim.approvalDate) {
      claim.approvalDate = new Date().toISOString();
    }
    if (updates.claimStatus === 'Settled' && !claim.settlementDate) {
      claim.settlementDate = new Date().toISOString();
    }
    this.save();

    if (isConnectedToMongo) {
      InsuranceClaimModel.findOneAndUpdate({ id }, claim).catch(console.error);
    }

    return claim;
  }

  // Settings
  getSettings() {
    return this.data.settings;
  }

  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();

    if (isConnectedToMongo) {
      SettingsModel.findOneAndUpdate({}, this.data.settings, { upsert: true }).catch(console.error);
    }

    return this.data.settings;
  }

  // Analytics & Summary Metrics
  getDashboardStats() {
    const invoices = this.data.invoices;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const pendingDues = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

    const opdRevenue = invoices
      .filter(i => i.invoiceType === 'OPD_CONSULTATION')
      .reduce((sum, i) => sum + (i.paidAmount || 0), 0);

    const ipdRevenue = invoices
      .filter(i => i.invoiceType && i.invoiceType.startsWith('IPD'))
      .reduce((sum, i) => sum + (i.paidAmount || 0), 0);

    const pharmacyRevenue = invoices
      .filter(i => i.invoiceType === 'PHARMACY')
      .reduce((sum, i) => sum + (i.paidAmount || 0), 0);

    const diagnosticRevenue = invoices
      .filter(i => i.invoiceType === 'DIAGNOSTIC')
      .reduce((sum, i) => sum + (i.paidAmount || 0), 0);

    const beds = this.data.beds;
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
    const availableBeds = beds.filter(b => b.status === 'Available').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const patients = this.data.patients;
    const totalPatients = patients.length;
    const activeIpdCount = patients.filter(p => p.patientType === 'IPD' && p.status === 'Admitted').length;
    const activeOpdCount = patients.filter(p => p.patientType === 'OPD').length;

    // Claims metrics
    const claims = this.data.insuranceClaims;
    const totalClaims = claims.length;
    const approvedClaimsAmount = claims
      .filter(c => c.claimStatus === 'Approved' || c.claimStatus === 'Settled')
      .reduce((sum, c) => sum + (c.approvedAmount || 0), 0);

    // Payment mode breakdown
    const paymentModes = invoices.reduce((acc, inv) => {
      const mode = inv.paymentMode || 'CASH';
      acc[mode] = (acc[mode] || 0) + (inv.paidAmount || 0);
      return acc;
    }, {});

    return {
      revenue: {
        totalRevenue,
        totalBilled,
        pendingDues,
        opdRevenue,
        ipdRevenue,
        pharmacyRevenue,
        diagnosticRevenue
      },
      beds: {
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate
      },
      patients: {
        totalPatients,
        activeIpdCount,
        activeOpdCount
      },
      claims: {
        totalClaims,
        approvedClaimsAmount
      },
      paymentModes,
      recentInvoices: invoices.slice(0, 6)
    };
  }
}

export const store = new Store();
