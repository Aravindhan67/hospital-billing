import express from 'express';
import { store } from '../config/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const list = store.getPharmacy();
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    if (!req.body.brandName || !req.body.unitPrice) {
      return res.status(400).json({ success: false, error: 'Brand name and unit price are required' });
    }
    const item = store.createPharmacyItem(req.body);
    res.status(201).json({ success: true, data: item, message: 'Medicine added to inventory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id/stock', (req, res) => {
  try {
    const item = store.updatePharmacyStock(req.params.id, req.body.stock);
    if (!item) return res.status(404).json({ success: false, error: 'Medicine not found' });
    res.json({ success: true, data: item, message: 'Stock updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
