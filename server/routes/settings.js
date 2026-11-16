import express from 'express';
import { store } from '../config/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const settings = store.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', (req, res) => {
  try {
    const settings = store.updateSettings(req.body);
    res.json({ success: true, data: settings, message: 'Hospital settings updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
