import express from 'express';
import { store } from '../config/store.js';

const router = express.Router();

router.get('/claims', (req, res) => {
  try {
    const claims = store.getClaims();
    res.json({ success: true, count: claims.length, data: claims });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/claims', (req, res) => {
  try {
    if (!req.body.patientName || !req.body.tpaName) {
      return res.status(400).json({ success: false, error: 'Patient name and TPA provider are required' });
    }
    const claim = store.createClaim(req.body);
    res.status(201).json({ success: true, data: claim, message: 'Insurance claim initiated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/claims/:id', (req, res) => {
  try {
    const claim = store.updateClaim(req.params.id, req.body);
    if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });
    res.json({ success: true, data: claim, message: 'Claim updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
