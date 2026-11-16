import express from 'express';
import { store } from '../config/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const beds = store.getBeds();
    res.json({ success: true, count: beds.length, data: beds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id/status', (req, res) => {
  try {
    const { status, patientId, patientName } = req.body;
    const bed = store.updateBedStatus(req.params.id, status, patientId, patientName);
    if (!bed) return res.status(404).json({ success: false, error: 'Bed not found' });
    res.json({ success: true, data: bed, message: 'Bed status updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
