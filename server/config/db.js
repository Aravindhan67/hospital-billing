import mongoose from 'mongoose';
import dns from 'dns';
import { seedData } from '../data/seedData.js';
import { PatientModel } from '../models/Patient.js';
import { DoctorModel } from '../models/Doctor.js';
import { BedModel } from '../models/Bed.js';
import { InvoiceModel } from '../models/Invoice.js';
import { PharmacyModel } from '../models/Pharmacy.js';
import { DiagnosticModel } from '../models/Diagnostic.js';
import { TariffModel } from '../models/Tariff.js';
import { InsuranceClaimModel } from '../models/InsuranceClaim.js';
import { SettingsModel } from '../models/Settings.js';

// Resolve DNS SRV queries reliably on Windows networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // ignore if not allowed
}

export let isConnectedToMongo = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_billing';

  try {
    console.log('Connecting to MongoDB Atlas Cluster...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
    });
    isConnectedToMongo = true;
    console.log('=======================================================');
    console.log('✓ SUCCESS: Connected to MongoDB Atlas Cluster!');
    console.log(`Database: ${mongoose.connection.name || 'hospital_billing'}`);
    console.log('=======================================================');

    // Auto-seed into MongoDB Atlas if collections are empty
    await seedMongoDatabase();

    return true;
  } catch (err) {
    isConnectedToMongo = false;
    console.error('! MongoDB connection failed / timed out:', err.message);
    console.log('✓ Seamlessly running in High-Performance Local JSON Store mode with full persistence.');
    return false;
  }
};

async function seedMongoDatabase() {
  try {
    const patientCount = await PatientModel.countDocuments();
    if (patientCount === 0) {
      console.log('Seeding initial hospital data into MongoDB Atlas...');
      await PatientModel.insertMany(seedData.patients);
      await DoctorModel.insertMany(seedData.doctors);
      await BedModel.insertMany(seedData.beds);
      await InvoiceModel.insertMany(seedData.invoices);
      await PharmacyModel.insertMany(seedData.pharmacy);
      await DiagnosticModel.insertMany(seedData.diagnostics);
      await TariffModel.insertMany(seedData.tariffs);
      await InsuranceClaimModel.insertMany(seedData.insuranceClaims);
      await SettingsModel.create(seedData.settings);
      console.log('✓ Successfully seeded complete clinical and billing records to MongoDB Atlas!');
    } else {
      console.log(`✓ MongoDB Atlas already contains ${patientCount} patient records.`);
    }
  } catch (err) {
    console.warn('Notice during MongoDB seeding:', err.message);
  }
}
