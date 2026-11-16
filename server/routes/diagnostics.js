import express from 'express';
import { store } from '../config/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const list = store.getDiagnostics();
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ success: false, error: 'Test name and price are required' });
    }
    const item = store.createDiagnostic(req.body);
    res.status(201).json({ success: true, data: item, message: 'Diagnostic test created' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
