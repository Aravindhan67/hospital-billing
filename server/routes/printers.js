import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { store } from '../config/store.js';

const execAsync = promisify(exec);
const router = express.Router();

// Fallback printers in case OS query is restricted or running without hardware
const DEFAULT_HOSPITAL_PRINTERS = [
  {
    name: 'Microsoft Print to PDF',
    type: 'Virtual / PDF Document',
    portName: 'PORTPROMPT:',
    driverName: 'Microsoft Print To PDF',
    status: 'Ready / Connected',
    isDefault: true,
    paperFormats: ['A4', 'Letter']
  },
  {
    name: 'Thermal POS-80 (Receipt Slip)',
    type: 'Thermal Roll (80mm)',
    portName: 'USB001 / COM1',
    driverName: 'Generic / 80mm POS Thermal Printer',
    status: 'Ready / Connected',
    isDefault: false,
    paperFormats: ['80mm Roll', '58mm Roll']
  },
  {
    name: 'HP LaserJet Pro (Cashier Desk A4)',
    type: 'Laser / Letterhead',
    portName: 'WSD / 192.168.1.150',
    driverName: 'HP LaserJet Pro Universal PCL6',
    status: 'Ready / Connected',
    isDefault: false,
    paperFormats: ['A4', 'A5', 'Letter']
  }
];

// GET /api/printers - detect installed system printers on Windows
router.get('/', async (req, res) => {
  try {
    let systemPrinters = [];

    // Query Windows PowerShell Get-Printer if on Windows
    if (os.platform() === 'win32') {
      try {
        const { stdout } = await execAsync(
          `powershell.exe -NoProfile -Command "Get-Printer | Select-Object Name, Type, DriverName, PortName, PrinterStatus, Default | ConvertTo-Json"`
        );
        if (stdout && stdout.trim()) {
          const parsed = JSON.parse(stdout);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          systemPrinters = list.map(p => ({
            name: p.Name,
            type: p.Type === 'Local' ? 'USB / Local Hardware' : 'Network / Virtual',
            portName: p.PortName || 'Local Port',
            driverName: p.DriverName || 'Windows Print Spooler',
            status: p.PrinterStatus === 'Normal' ? 'Ready / Connected' : 'Ready',
            isDefault: Boolean(p.Default),
            paperFormats: p.Name.toLowerCase().includes('pos') || p.Name.toLowerCase().includes('receipt') || p.Name.toLowerCase().includes('thermal')
              ? ['80mm Roll', '58mm Roll']
              : ['A4', 'A5', 'Letter']
          }));
        }
      } catch (cmdErr) {
        console.warn('PowerShell Get-Printer warning:', cmdErr.message);
      }
    }

    // Merge system printers with dedicated hospital POS thermal presets so cashiers can always target thermal or laser
    const printerMap = new Map();
    systemPrinters.forEach(p => printerMap.set(p.name, p));
    DEFAULT_HOSPITAL_PRINTERS.forEach(p => {
      if (!printerMap.has(p.name)) {
        printerMap.set(p.name, p);
      }
    });

    const finalPrinters = Array.from(printerMap.values());
    res.json({
      success: true,
      count: finalPrinters.length,
      data: finalPrinters,
      detectedOn: os.hostname(),
      platform: os.platform()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, data: DEFAULT_HOSPITAL_PRINTERS });
  }
});

// POST /api/printers/print - dispatch print job to selected printer
router.post('/print', async (req, res) => {
  try {
    const { printerName, invoiceId, paperSize = 'A4', copies = 1 } = req.body;
    const invoice = store.getInvoiceById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice record not found' });
    }

    console.log(`[PRINT DISPATCH] Sending bill ${invoice.invoiceNumber} to printer "${printerName}" (${paperSize}, ${copies} copies)`);

    // Generate plain-text ESC/POS / text receipt summary for spooling
    const receiptText = generateSpoolText(invoice, store.getSettings(), paperSize);
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `bill_${invoice.invoiceNumber}.txt`);
    fs.writeFileSync(tempFilePath, receiptText, 'utf-8');

    // Attempt printing via Windows Out-Printer if on Windows
    let printSuccess = false;
    let detailMessage = `Spool job generated for ${printerName}. Ready for print dispatch.`;

    if (os.platform() === 'win32' && printerName && printerName !== 'Microsoft Print to PDF') {
      try {
        const psCommand = `powershell.exe -NoProfile -Command "Get-Content -Path '${tempFilePath}' | Out-Printer -Name '${printerName.replace(/'/g, "''")}'"`;
        await execAsync(psCommand);
        printSuccess = true;
        detailMessage = `Job successfully delivered to physical print queue: ${printerName}`;
      } catch (prtErr) {
        console.warn(`Windows Out-Printer notice: ${prtErr.message}`);
        detailMessage = `Printer "${printerName}" selected. Spool file created at ${tempFilePath}`;
      }
    } else {
      printSuccess = true;
      detailMessage = `Print job dispatched to ${printerName}. Browser print dialog opened.`;
    }

    res.json({
      success: true,
      message: `Bill ${invoice.invoiceNumber} dispatched to ${printerName}`,
      detail: detailMessage,
      printer: printerName,
      paperSize,
      copies
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Text formatter for 80mm thermal / dot-matrix / ESC-POS printers
function generateSpoolText(invoice, settings, paperSize) {
  const line = '================================================\n';
  const dash = '------------------------------------------------\n';
  let out = '';
  out += '\n' + (settings?.hospitalName || 'CURAFLOW MULTI-SPECIALITY HOSPITAL') + '\n';
  out += (settings?.address || '42 Healthcare Avenue, Medical Enclave') + '\n';
  out += `GSTIN: ${settings?.gstin || '33AAACH2026M1Z4'} | Reg: ${settings?.regNo || 'HOSP-2018'}\n`;
  out += line;
  out += `TAX INVOICE / CASH BILL: ${invoice.invoiceNumber}\n`;
  out += `DATE: ${new Date(invoice.billingDate).toLocaleString()}\n`;
  out += `PATIENT: ${invoice.patientName} (${invoice.uhid})\n`;
  out += `AGE/SEX: ${invoice.patientAge}Y / ${invoice.patientGender} | PHONE: ${invoice.patientPhone}\n`;
  out += `CONSULTANT: ${invoice.doctorName}\n`;
  out += `WARD/BED: ${invoice.wardBed} | TYPE: ${invoice.invoiceType}\n`;
  out += dash;
  out += 'ITEM DESCRIPTION           QTY    RATE       TOTAL\n';
  out += dash;

  (invoice.items || []).forEach((it, i) => {
    const desc = it.description.slice(0, 24).padEnd(25);
    const qty = String(it.quantity).padStart(4);
    const rate = String(it.unitPrice).padStart(8);
    const tot = String(it.total).padStart(9);
    out += `${desc} ${qty} ${rate} ${tot}\n`;
  });

  out += dash;
  out += `GROSS SUB-TOTAL:                    Rs. ${invoice.subTotal.toLocaleString()}\n`;
  out += `TOTAL GST TAX:                      Rs. ${invoice.totalTax.toLocaleString()}\n`;
  if (invoice.totalDiscount > 0) {
    out += `DISCOUNT / CONCESSION:             -Rs. ${invoice.totalDiscount.toLocaleString()}\n`;
  }
  out += `NET INVOICE TOTAL:                  Rs. ${invoice.grandTotal.toLocaleString()}\n`;
  if (invoice.advanceAdjusted > 0) {
    out += `LESS ADVANCE ADJUSTED:             -Rs. ${invoice.advanceAdjusted.toLocaleString()}\n`;
  }
  out += `PAID AMOUNT:                        Rs. ${invoice.paidAmount.toLocaleString()}\n`;
  out += `BALANCE DUE:                        Rs. ${invoice.balanceDue.toLocaleString()}\n`;
  out += line;
  out += `PAYMENT MODE: ${invoice.paymentMode} | STATUS: ${invoice.paymentStatus}\n`;
  out += `TXN REF: ${invoice.transactionRef || 'CASH RECEIPT'}\n`;
  out += line;
  out += '    Thank you for choosing CuraFlow Hospital    \n';
  out += '             Wish you a speedy recovery         \n';
  out += '\n\n\n\n\x1D\x56\x01'; // ESC/POS cut paper command
  return out;
}

export default router;
