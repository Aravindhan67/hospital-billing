import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  QrCode,
  ShieldCheck,
  Check,
  RotateCw,
  HardDrive,
  Sliders,
  Scissors
} from 'lucide-react';
import { numberToWords } from '../utils/numberToWords';
import { api } from '../services/api';

export default function InvoiceModal({ invoice, settings, onClose, onPayBalance }) {
  if (!invoice) return null;

  // Printer Management State
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('Microsoft Print to PDF');
  const [paperFormat, setPaperFormat] = useState('A4'); // 'A4', 'THERMAL_80', 'A5'
  const [copies, setCopies] = useState(1);
  const [loadingPrinters, setLoadingPrinters] = useState(true);
  const [printingStatus, setPrintingStatus] = useState(''); // '', 'sending', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch detected printers from Windows OS / Backend
  const loadPrinters = () => {
    setLoadingPrinters(true);
    api.getPrinters().then(res => {
      if (res.data && res.data.length > 0) {
        setPrinters(res.data);
        const def = res.data.find(p => p.isDefault) || res.data[0];
        if (def && !selectedPrinter) {
          setSelectedPrinter(def.name);
        }
      }
    }).catch(err => {
      console.warn('Printer discovery notice:', err.message);
    }).finally(() => setLoadingPrinters(false));
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  // When printer changes, auto-suggest best paper format
  const handlePrinterChange = (printerName) => {
    setSelectedPrinter(printerName);
    const p = printers.find(item => item.name === printerName);
    if (p) {
      if (p.name.toLowerCase().includes('pos') || p.name.toLowerCase().includes('thermal') || p.name.toLowerCase().includes('receipt')) {
        setPaperFormat('THERMAL_80');
      } else {
        setPaperFormat('A4');
      }
    }
  };

  // Direct dispatch to printer hardware via backend spooler
  const handleDirectPrint = async () => {
    try {
      setPrintingStatus('sending');
      setStatusMessage(`Transmitting print job to "${selectedPrinter}" (${paperFormat})...`);

      const res = await api.sendPrintJob({
        printerName: selectedPrinter,
        invoiceId: invoice.id,
        paperSize: paperFormat,
        copies: Number(copies) || 1
      });

      if (res.success) {
        setPrintingStatus('success');
        setStatusMessage(res.detail || `Print job successfully dispatched to ${selectedPrinter}!`);
        setTimeout(() => {
          setPrintingStatus('');
          setStatusMessage('');
        }, 4000);

        // Also trigger browser print if virtual/system destination
        if (selectedPrinter === 'Microsoft Print to PDF') {
          setTimeout(() => window.print(), 300);
        }
      } else {
        setPrintingStatus('error');
        setStatusMessage(res.error || 'Failed to dispatch print job');
      }
    } catch (err) {
      setPrintingStatus('error');
      setStatusMessage(err.message);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const isPaid = invoice.paymentStatus === 'PAID';
  const isPartial = invoice.paymentStatus === 'PARTIAL';
  const grandTotalRounded = Math.round(invoice.grandTotal || 0);
  const activePrinterObj = printers.find(p => p.name === selectedPrinter);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-soft-lg w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden border border-slate-300">
        
        {/* Top Control Bar with Connected Printer Setup (Hidden on print) */}
        <div className="no-print bg-slate-100 border-b border-slate-300 p-3 space-y-2.5">
          
          {/* Row 1: Printer Hardware Dropdown & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            
            {/* Left: Printer Selector */}
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded bg-blue-900 text-white flex items-center justify-center font-bold">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-800 uppercase tracking-tight">Connected Printer:</span>
                  <select
                    value={selectedPrinter}
                    onChange={(e) => handlePrinterChange(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded font-bold text-slate-900 font-mono text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    {printers.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name} ({p.type})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={loadPrinters}
                    title="Rescan connected printers"
                    className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {activePrinterObj && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    Port: <strong className="text-slate-700">{activePrinterObj.portName}</strong> • Driver: {activePrinterObj.driverName} • <span className="text-emerald-700 font-bold">● {activePrinterObj.status}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right: Close and Settle Actions */}
            <div className="flex items-center space-x-2">
              {invoice.balanceDue > 0 && onPayBalance && (
                <button
                  onClick={() => onPayBalance(invoice)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded shadow-sm transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Settle Due (₹{invoice.balanceDue.toLocaleString()})</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 transition-colors"
                title="Close bill preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Row 2: Paper Format Options + Print Triggers */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            
            {/* Paper Format Switcher */}
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">Paper Format:</span>
              
              <button
                type="button"
                onClick={() => setPaperFormat('A4')}
                className={`px-3 py-1 rounded font-bold text-xs transition-all border ${
                  paperFormat === 'A4'
                    ? 'bg-[#1e40af] text-white border-blue-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                📄 A4 Letterhead (Full Tax Bill)
              </button>

              <button
                type="button"
                onClick={() => setPaperFormat('THERMAL_80')}
                className={`px-3 py-1 rounded font-bold text-xs transition-all border ${
                  paperFormat === 'THERMAL_80'
                    ? 'bg-[#1e40af] text-white border-blue-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                🧾 80mm Thermal Slip (POS Receipt)
              </button>

              <button
                type="button"
                onClick={() => setPaperFormat('A5')}
                className={`px-3 py-1 rounded font-bold text-xs transition-all border ${
                  paperFormat === 'A5'
                    ? 'bg-[#1e40af] text-white border-blue-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                📋 A5 Half-Page Voucher
              </button>

              {/* Copies */}
              <div className="flex items-center space-x-1 pl-2">
                <span className="text-[11px] text-slate-500">Copies:</span>
                <select
                  value={copies}
                  onChange={(e) => setCopies(Number(e.target.value))}
                  className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold font-mono text-xs"
                >
                  <option value="1">1</option>
                  <option value="2">2 (Pt + Hosp)</option>
                  <option value="3">3 (Pt + Hosp + TPA)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Direct Print to Hardware Button */}
              <button
                onClick={handleDirectPrint}
                disabled={printingStatus === 'sending'}
                className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded shadow-sm transition-all disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>
                  {printingStatus === 'sending' ? 'Transmitting Job...' : `Print via ${selectedPrinter.slice(0, 18)}`}
                </span>
              </button>

              {/* Browser Print Dialog Button */}
              <button
                onClick={handleBrowserPrint}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded transition-colors"
                title="Open browser system print preview dialog (Ctrl+P)"
              >
                <span>System Dialog</span>
              </button>
            </div>
          </div>

          {/* Feedback Status Alert */}
          {statusMessage && (
            <div className={`p-2 rounded text-xs flex items-center space-x-2 font-medium ${
              printingStatus === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : printingStatus === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {printingStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : printingStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <RotateCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

        </div>

        {/* Printable Bill Area - Dynamic Layout based on Paper Format */}
        <div
          className={`flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 ${
            paperFormat === 'THERMAL_80' ? 'paper-thermal' : 'paper-a4'
          }`}
          id="printable-invoice"
        >
          
          {/* ========================================================= */}
          {/* VIEW A: 80mm THERMAL POS SLIP FORMAT (FOR THERMAL PRINTERS) */}
          {/* ========================================================= */}
          {paperFormat === 'THERMAL_80' ? (
            <div className="max-w-[340px] mx-auto text-slate-950 font-mono text-xs leading-tight">
              
              {/* Thermal Header */}
              <div className="text-center pb-2 border-b-2 border-dashed border-slate-900">
                <p className="font-extrabold text-sm uppercase">{settings?.hospitalName || 'CURAFLOW HOSPITAL'}</p>
                <p className="text-[10px] mt-0.5">{settings?.address || '42 Healthcare Avenue, Medical Enclave'}</p>
                <p className="text-[10px]">Tel: {settings?.phone || '+91 044 2890 4400'} | Emg: {settings?.emergency || '1066'}</p>
                <p className="text-[10px] mt-0.5">GSTIN: {settings?.gstin || '33AAACH2026M1Z4'} | Reg: {settings?.regNo || 'HOSP-2018'}</p>
              </div>

              {/* Thermal Bill Meta */}
              <div className="py-2 border-b border-dashed border-slate-900 space-y-0.5 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>BILL NO: {invoice.invoiceNumber}</span>
                  <span>{new Date(invoice.billingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>TIME: {new Date(invoice.billingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>TYPE: {invoice.invoiceType}</span>
                </div>
                <div className="pt-1">
                  <p><strong>PATIENT:</strong> {invoice.patientName}</p>
                  <p><strong>UHID:</strong> {invoice.uhid} | <strong>AGE/SEX:</strong> {invoice.patientAge}Y/{invoice.patientGender}</p>
                  <p><strong>DOCTOR:</strong> {invoice.doctorName}</p>
                  <p><strong>COUNTER:</strong> {invoice.wardBed}</p>
                </div>
              </div>

              {/* Thermal Line Items Table */}
              <div className="py-2 border-b border-dashed border-slate-900">
                <div className="flex justify-between font-bold border-b border-dashed border-slate-400 pb-1 mb-1 text-[10px]">
                  <span>ITEM / PARTICULARS</span>
                  <div className="flex space-x-3">
                    <span>QTY</span>
                    <span>RATE</span>
                    <span>AMOUNT</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  {(invoice.items || []).map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <div className="truncate max-w-[170px]">
                        <p className="font-bold">{idx + 1}. {it.description}</p>
                        <p className="text-[9px] text-slate-600">[{it.category}]</p>
                      </div>
                      <div className="flex space-x-3 text-right font-bold">
                        <span className="w-5 text-center">{it.quantity}</span>
                        <span className="w-12">₹{it.unitPrice}</span>
                        <span className="w-14">₹{it.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thermal Totals */}
              <div className="py-2 border-b-2 border-dashed border-slate-900 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Gross Charges:</span>
                  <span>₹{(invoice.subTotal || 0).toFixed(2)}</span>
                </div>
                {invoice.totalTax > 0 && (
                  <div className="flex justify-between">
                    <span>Output Taxes (GST):</span>
                    <span>+ ₹{(invoice.totalTax || 0).toFixed(2)}</span>
                  </div>
                )}
                {invoice.totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount / Concession:</span>
                    <span>- ₹{(invoice.totalDiscount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm border-t border-dashed border-slate-900 pt-1">
                  <span>NET TOTAL:</span>
                  <span>₹{(invoice.grandTotal || 0).toFixed(2)}</span>
                </div>
                {invoice.advanceAdjusted > 0 && (
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Advance Adjusted:</span>
                    <span>- ₹{invoice.advanceAdjusted.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>PAID AMOUNT:</span>
                  <span>₹{(invoice.paidAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-xs pt-0.5 border-t border-dashed border-slate-400">
                  <span>BALANCE DUE:</span>
                  <span>₹{(invoice.balanceDue || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Thermal Payment & Words */}
              <div className="py-2 text-[10px] space-y-1">
                <p><strong>PAY MODE:</strong> {invoice.paymentMode} ({invoice.paymentStatus})</p>
                <p><strong>TXN REF:</strong> {invoice.transactionRef || 'DIRECT CASH RECEIPT'}</p>
                <p className="italic"><strong>IN WORDS:</strong> {numberToWords(grandTotalRounded)}</p>
              </div>

              {/* Barcode Simulation & Cut Line */}
              <div className="text-center pt-2 space-y-1 border-t border-dashed border-slate-400">
                <div className="font-mono tracking-widest text-[9px] bg-slate-100 py-1 border border-slate-300">
                  ||||| | |||| |||||| | ||||| |||| |||||
                </div>
                <p className="text-[9px] text-slate-500 font-mono">*{invoice.invoiceNumber}*</p>
                <p className="text-[9px] italic mt-1">{settings?.footerDisclaimer || 'Thank you for choosing CuraFlow Hospital. Wish you a speedy recovery.'}</p>
                
                {/* Simulated Paper Tear Indicator */}
                <div className="pt-2 flex items-center justify-center space-x-2 text-[9px] text-slate-400">
                  <Scissors className="w-3 h-3" />
                  <span>- - - - - - - - - - TEAR HERE - - - - - - - - - -</span>
                </div>
              </div>

            </div>
          ) : (
            /* ========================================================= */
            /* VIEW B: STANDARD A4 TRADITIONAL HOSPITAL LETTERHEAD BILL */
            /* ========================================================= */
            <div>
              {/* Traditional Hospital Bill Header with Double Line */}
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 border-2 border-slate-900 flex items-center justify-center font-bold text-base bg-slate-50 text-slate-900 shrink-0">
                        ✚
                      </div>
                      <div>
                        <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-950 font-serif">
                          {settings?.hospitalName || 'CURAFLOW MULTI-SPECIALITY HOSPITAL & RESEARCH CENTER'}
                        </h1>
                        <p className="text-[11px] font-semibold text-slate-700 italic">
                          {settings?.tagline || 'Excellence in Clinical Care & Patient Healing • NABH Accredited'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 mt-1 max-w-xl">
                      {settings?.address || '42 Healthcare Avenue, Medical Enclave, Metro City - 600028'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 mt-1 font-mono">
                      <span>Tel: {settings?.phone || '+91 (044) 2890-4400'}</span>
                      <span>•</span>
                      <span>Emergency: <strong className="text-rose-700">{settings?.emergency || '1066'}</strong></span>
                      <span>•</span>
                      <span>Email: {settings?.email || 'billing@curaflowhospital.org'}</span>
                    </div>
                  </div>

                  {/* Tax & Registration Meta Box */}
                  <div className="border border-slate-900 p-2.5 text-left sm:text-right text-[11px] font-mono space-y-0.5 bg-slate-50/60 min-w-[210px] w-full sm:w-auto">
                    <p className="font-bold text-center border-b border-slate-400 pb-1 uppercase tracking-wider text-slate-900 text-[10px]">
                      TAX INVOICE / CASH BILL
                    </p>
                    <p><span className="text-slate-500">GSTIN:</span> <strong>{settings?.gstin || '33AAACH2026M1Z4'}</strong></p>
                    <p><span className="text-slate-500">REG NO:</span> {settings?.regNo || 'HOSP-MED-2018-9844'}</p>
                    <p><span className="text-slate-500">PAN:</span> {settings?.panNo || 'AAACH2026M'}</p>
                    <p className="text-[10px] text-slate-500 italic pt-0.5">ORIGINAL FOR RECIPIENT</p>
                  </div>
                </div>
              </div>

              {/* Patient & Voucher Meta Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-900 divide-y md:divide-y-0 md:divide-x divide-slate-900 text-xs my-4 font-mono">
                {/* Left: Patient Particulars */}
                <div className="p-3 space-y-1">
                  <p className="font-bold uppercase text-[10px] text-slate-500 border-b border-slate-300 pb-0.5 mb-1 font-sans">
                    PATIENT INFORMATION
                  </p>
                  <p className="text-sm font-extrabold text-slate-950 font-sans">{invoice.patientName}</p>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-800">
                    <p><span className="text-slate-500">UHID:</span> <strong>{invoice.uhid}</strong></p>
                    <p><span className="text-slate-500">AGE/SEX:</span> {invoice.patientAge || 'N/A'}Y / {invoice.patientGender || 'N/A'}</p>
                    <p><span className="text-slate-500">CONTACT:</span> {invoice.patientPhone || 'N/A'}</p>
                    <p><span className="text-slate-500">WARD/BED:</span> {invoice.wardBed || 'OPD Desk'}</p>
                  </div>
                </div>

                {/* Right: Invoice & Consultant Details */}
                <div className="p-3 space-y-1">
                  <p className="font-bold uppercase text-[10px] text-slate-500 border-b border-slate-300 pb-0.5 mb-1 font-sans">
                    BILLING / VOUCHER PARTICULARS
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-800">
                    <p><span className="text-slate-500">INVOICE NO:</span> <strong className="text-blue-900">{invoice.invoiceNumber}</strong></p>
                    <p><span className="text-slate-500">BILL DATE:</span> {new Date(invoice.billingDate).toLocaleDateString()} {new Date(invoice.billingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><span className="text-slate-500">BILL TYPE:</span> <strong>{invoice.invoiceType}</strong></p>
                    <p><span className="text-slate-500">PAY MODE:</span> <strong>{invoice.paymentMode}</strong></p>
                    <p className="col-span-2"><span className="text-slate-500">CONSULTANT:</span> {invoice.doctorName || 'Duty Medical Officer'}</p>
                    <p className="col-span-2"><span className="text-slate-500">DEPT:</span> {invoice.department || 'General Medicine'}</p>
                  </div>
                </div>
              </div>

              {/* Traditional Itemized Ledger Table */}
              <div className="my-4 overflow-x-auto">
                <table className="w-full min-w-[580px] text-left text-xs border border-slate-900">
                  <thead className="bg-slate-100 text-slate-900 uppercase text-[10px] font-bold border-b border-slate-900 font-mono">
                    <tr className="divide-x divide-slate-900">
                      <th className="py-2 px-2.5 w-10 text-center">S.N.</th>
                      <th className="py-2 px-3">Description of Medical Services / Consumables</th>
                      <th className="py-2 px-2.5 w-24 text-center">HSN/SAC</th>
                      <th className="py-2 px-2 w-14 text-center">Qty</th>
                      <th className="py-2 px-2.5 w-20 text-right">Rate (₹)</th>
                      <th className="py-2 px-2 w-16 text-center">GST %</th>
                      <th className="py-2 px-2.5 w-20 text-right">Tax (₹)</th>
                      <th className="py-2 px-3 w-28 text-right font-extrabold">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-slate-800 font-mono text-[11px]">
                    {(invoice.items || []).map((item, idx) => (
                      <tr key={idx} className="divide-x divide-slate-300 hover:bg-slate-50/50">
                        <td className="py-2 px-2.5 text-center text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-950">
                          <div>{item.description}</div>
                          {item.category && <span className="text-[10px] text-slate-500 font-mono">[{item.category}]</span>}
                        </td>
                        <td className="py-2 px-2.5 text-center text-slate-600">
                          {item.category === 'Pharmacy' ? '3004' : '999312'}
                        </td>
                        <td className="py-2 px-2 text-center font-bold">{item.quantity}</td>
                        <td className="py-2 px-2.5 text-right">₹{item.unitPrice.toLocaleString()}</td>
                        <td className="py-2 px-2 text-center">{item.gstPercent}%</td>
                        <td className="py-2 px-2.5 text-right">₹{(item.taxAmount || 0).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-950">
                          ₹{item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Amount in Words */}
              <div className="p-2.5 bg-slate-50 border border-slate-900 my-3 text-xs flex items-center justify-between font-mono">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] mr-2">Amount in Words:</span>
                  <strong className="text-slate-950 font-serif italic text-sm">{numberToWords(grandTotalRounded)}</strong>
                </div>
                <div className="text-[11px] font-bold text-slate-600">
                  E. & O.E.
                </div>
              </div>

              {/* Traditional Accounting Math & Settlement Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4 text-xs font-mono">
                {/* Left: Bank / Payment Particulars */}
                <div className="col-span-1 md:col-span-7 border border-slate-900 p-3 space-y-2 bg-slate-50/40">
                  <p className="font-bold text-slate-900 uppercase text-[10px] border-b border-slate-300 pb-1">
                    TRANSACTION & SETTLEMENT RECEIPT
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-slate-700 text-[11px]">
                    <p><span className="text-slate-500">PAYMENT MODE:</span> <strong className="text-slate-950">{invoice.paymentMode}</strong></p>
                    <p><span className="text-slate-500">PAY STATUS:</span> <strong className={isPaid ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>{invoice.paymentStatus}</strong></p>
                    <p className="col-span-2"><span className="text-slate-500">TXN / UTR REF:</span> {invoice.transactionRef || 'CASH DIRECT COUNTER RECEIPT'}</p>
                    {invoice.remarks && (
                      <p className="col-span-2 text-slate-600 italic border-t border-slate-200 pt-1">
                        Note: {invoice.remarks}
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-300 leading-snug">
                    <p className="font-bold text-slate-700">Hospital Disclaimer & Terms:</p>
                    <p>{settings?.invoiceNotes || '1. Cheques subject to realization. 2. Retain this invoice for insurance reimbursement. 3. Medicines once sold cannot be returned without original batch.'}</p>
                  </div>
                </div>

                {/* Right: Calculations Box */}
                <div className="col-span-1 md:col-span-5 border-2 border-slate-900 p-3.5 space-y-1.5 bg-slate-100/50 text-[11px]">
                  <div className="flex justify-between text-slate-700">
                    <span>Total Gross Charges:</span>
                    <span>₹{(invoice.subTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Output CGST + SGST:</span>
                    <span>+ ₹{(invoice.totalTax || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span>Less Concession / Disc:</span>
                    <span>- ₹{(invoice.totalDiscount || 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between font-extrabold text-xs text-slate-950 border-t border-slate-900 pt-1.5">
                    <span>Net Invoice Total:</span>
                    <span>₹{(invoice.grandTotal || 0).toLocaleString()}</span>
                  </div>

                  {invoice.advanceAdjusted > 0 && (
                    <div className="flex justify-between text-blue-900 font-semibold">
                      <span>Less Advance Adjusted:</span>
                      <span>- ₹{invoice.advanceAdjusted.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-900 font-bold">
                    <span>Amount Paid:</span>
                    <span className="text-emerald-800">₹{(invoice.paidAmount || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between font-extrabold text-sm text-slate-950 border-t-2 border-slate-900 pt-1.5">
                    <span>Balance Due:</span>
                    <span className={invoice.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                      ₹{(invoice.balanceDue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature Block */}
              <div className="mt-8 pt-4 border-t-2 border-slate-900 flex justify-between items-end text-xs text-slate-600 font-mono">
                <div className="space-y-0.5 text-[10px]">
                  <p>Operator: <strong>{invoice.createdBy || 'Billing Specialist / Cashier'}</strong></p>
                  <p>Printed on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                  <p className="italic">Computer Generated Hospital Invoice • Valid without alterations</p>
                </div>

                <div className="text-center space-y-6">
                  <div className="h-6"></div>
                  <div className="border-t border-slate-900 pt-1 w-52 text-[11px] font-bold text-slate-900">
                    For {settings?.hospitalName || 'CuraFlow Hospital'}<br/>
                    <span className="text-[10px] font-normal text-slate-600 font-mono">Authorized Signatory / Cashier</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
