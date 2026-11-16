import express from 'express';
import { store } from '../config/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const doctors = store.getDoctors();
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    if (!req.body.name || !req.body.department) {
      return res.status(400).json({ success: false, error: 'Doctor name and department are required' });
    }
    const doc = store.createDoctor(req.body);
    res.status(201).json({ success: true, data: doc, message: 'Doctor added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
