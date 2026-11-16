import express from 'express';
import { store } from '../config/store.js';

const router = express.Router();

router.get('/dashboard', (req, res) => {
  try {
    const stats = store.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/revenue-trend', (req, res) => {
  try {
    // Generate departmental and daily distribution
    const invoices = store.getInvoices();
    const stats = store.getDashboardStats();
    res.json({
      success: true,
      data: {
        summary: stats.revenue,
        paymentModes: stats.paymentModes,
        totalInvoices: invoices.length,
        invoices: invoices
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
