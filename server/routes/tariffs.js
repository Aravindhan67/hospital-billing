import express from 'express';
import { store } from '../config/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const list = store.getTariffs();
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    if (!req.body.name || !req.body.standardRate) {
      return res.status(400).json({ success: false, error: 'Service name and standard rate are required' });
    }
    const item = store.createTariff(req.body);
    res.status(201).json({ success: true, data: item, message: 'Tariff service added' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
