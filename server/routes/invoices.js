import express from 'express';
import { store } from '../config/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const invoices = store.getInvoices(req.query);
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const invoice = store.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    if (!req.body.items || req.body.items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one billing line item is required' });
    }
    const invoice = store.createInvoice(req.body);
    res.status(201).json({ success: true, data: invoice, message: 'Invoice created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id/payment', (req, res) => {
  try {
    const invoice = store.updateInvoicePayment(req.params.id, req.body);
    if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
    res.json({ success: true, data: invoice, message: 'Payment recorded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
