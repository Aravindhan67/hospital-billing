import express from 'express';
import { store } from '../config/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const patients = store.getPatients(req.query);
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const patient = store.getPatientById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    if (!req.body.name || !req.body.phone) {
      return res.status(400).json({ success: false, error: 'Patient name and phone are required' });
    }
    const patient = store.createPatient(req.body);
    res.status(201).json({ success: true, data: patient, message: 'Patient registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const patient = store.updatePatient(req.params.id, req.body);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
    res.json({ success: true, data: patient, message: 'Patient updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
