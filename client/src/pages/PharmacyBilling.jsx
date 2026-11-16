import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  ShoppingCart,
  Plus,
  Trash2,
  AlertTriangle,
  Printer,
  CheckCircle2,
  Package,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function PharmacyBilling({ onViewInvoice }) {
  const [pharmacy, setPharmacy] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);

  // Checkout State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [uhid, setUhid] = useState('');
  const [doctorName, setDoctorName] = useState('Hospital Attending Consultant');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Add Medicine Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    code: '',
    brandName: '',
    genericName: '',
    category: 'Tablet',
    batchNo: '',
    expiryDate: '2027-12',
    stock: 100,
    reorderLevel: 25,
    unitPrice: 15.00,
    gstPercent: 12,
    manufacturer: ''
  });

  const loadData = () => {
    Promise.all([api.getPharmacy(), api.getPatients()])
      .then(([phRes, pRes]) => {
        if (phRes.data) setPharmacy(phRes.data);
        if (pRes.data) setPatients(pRes.data);
      }).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePatientSelect = (pId) => {
    setSelectedPatientId(pId);
    const pat = patients.find(p => p.id === pId);
    if (pat) {
      setCustomerName(pat.name);
      setUhid(pat.uhid);
      setCustomerPhone(pat.phone);
      if (pat.attendingDoctorName) setDoctorName(pat.attendingDoctorName);
    } else {
      setCustomerName('');
      setUhid('');
      setCustomerPhone('');
    }
  };

  const handleAddToCart = (med) => {
    if (med.stock <= 0) {
      alert('Selected medicine is out of stock!');
      return;
    }
    const exists = cart.find(i => i.id === med.id);
    if (exists) {
      if (exists.quantity >= med.stock) {
        alert('Cannot exceed available inventory stock');
        return;
      }
      setCart(cart.map(i => {
        if (i.id === med.id) {
          const qty = i.quantity + 1;
          const taxable = qty * i.unitPrice;
          const tax = (taxable * i.gstPercent) / 100;
          return { ...i, quantity: qty, total: Number((taxable + tax).toFixed(2)) };
        }
        return i;
      }));
    } else {
      const taxable = med.unitPrice;
      const tax = (taxable * (med.gstPercent || 0)) / 100;
      setCart([
        ...cart,
        {
          id: med.id,
          category: 'Pharmacy',
          code: med.code,
          description: `${med.brandName} (${med.category})`,
          quantity: 1,
          unitPrice: med.unitPrice,
          gstPercent: med.gstPercent || 12,
          discount: 0,
          total: Number((taxable + tax).toFixed(2)),
          maxStock: med.stock
        }
      ]);
    }
  };

  const handleUpdateQty = (id, delta) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, Math.min(i.maxStock, i.quantity + delta));
        const taxable = newQty * i.unitPrice;
        const tax = (taxable * i.gstPercent) / 100;
        return { ...i, quantity: newQty, total: Number((taxable + tax).toFixed(2)) };
      }
      return i;
    }));
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const subTotal = cart.reduce((s, it) => s + (it.quantity * it.unitPrice), 0);
  const totalTax = cart.reduce((s, it) => s + (((it.quantity * it.unitPrice) * it.gstPercent) / 100), 0);
  const grandTotal = Math.max(0, subTotal + totalTax - (Number(discount) || 0));

  const handleCheckoutPharmacy = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Pharmacy cart is empty');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter or select a customer name');
      return;
    }

    try {
      setLoading(true);
      const invoicePayload = {
        patientId: selectedPatientId || null,
        uhid: uhid || 'PHARM-WALKIN',
        patientName: customerName,
        patientPhone: customerPhone,
        doctorName,
        department: 'Hospital Central Pharmacy',
        wardBed: 'Pharmacy POS Counter #01',
        invoiceType: 'PHARMACY',
        items: cart,
        subTotal,
        totalDiscount: Number(discount) || 0,
        totalTax: Number(totalTax.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2)),
        advanceAdjusted: 0,
        netPayable: Number(grandTotal.toFixed(2)),
        paidAmount: Number(grandTotal.toFixed(2)),
        paymentStatus: 'PAID',
        paymentMode,
        remarks: 'Direct Pharmacy Prescription Dispensing'
      };

      const res = await api.createInvoice(invoicePayload);
      if (res.success) {
        setCart([]);
        setCustomerName('');
        setUhid('');
        setCustomerPhone('');
        loadData();
        onViewInvoice(res.data);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createPharmacyItem(newMed);
      if (res.success) {
        setShowAddModal(false);
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredMeds = pharmacy.filter(m =>
    m.brandName.toLowerCase().includes(search.toLowerCase()) ||
    m.genericName.toLowerCase().includes(search.toLowerCase()) ||
    m.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pharmacy & Medical Store POS Desk</h2>
          <p className="text-xs text-slate-400">Inventory dispensing, batch tracking, GST computation, and instant POS billing</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-soft-sm transition-all self-start"
        >
          <Plus className="w-3.5 h-3.5 text-brand-600" />
          <span>New Medicine Stock Entry</span>
        </button>
      </div>

      {/* Main Grid: Medicine Catalog + POS Register */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Inventory Catalog (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Search */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center space-x-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicine by brand (e.g. Augmentin, Pan 40, Dolo) or generic name..."
              className="w-full bg-transparent text-xs text-slate-700 focus:outline-none placeholder-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-slate-400">✕</button>
            )}
          </div>

          {/* Table / Cards of Medicines */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/60 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">Medicine & Generic</th>
                    <th className="py-2.5 px-3.5">Type</th>
                    <th className="py-2.5 px-3.5 font-mono">Batch / Exp</th>
                    <th className="py-2.5 px-3.5 text-right font-mono">Unit MRP</th>
                    <th className="py-2.5 px-3.5 text-center">Stock</th>
                    <th className="py-2.5 px-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredMeds.map(med => {
                    const isLowStock = med.stock <= med.reorderLevel;
                    return (
                      <tr key={med.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3.5">
                          <p className="font-bold text-slate-800">{med.brandName}</p>
                          <p className="text-[10px] text-slate-400">{med.genericName}</p>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                            {med.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[11px]">
                          <div>{med.batchNo}</div>
                          <span className="text-[10px] text-slate-400">Exp: {med.expiryDate}</span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-800">
                          ₹{med.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLowStock ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {med.stock} Left
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <button
                            onClick={() => handleAddToCart(med)}
                            disabled={med.stock <= 0}
                            className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-xs transition-colors disabled:opacity-30"
                          >
                            + Dispense
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right: Point of Sale Checkout (4-5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm h-fit sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-slate-800 text-sm">Dispensary Cart</h3>
            </div>
            <span className="font-mono font-bold text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full">
              {cart.length} Items
            </span>
          </div>

          <form onSubmit={handleCheckoutPharmacy} className="mt-4 space-y-3 text-xs">
            {/* Patient Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Patient (Optional)</label>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              >
                <option value="">-- Direct Retail Customer --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} [{p.uhid}]</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer / Patient Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Name"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="UPI">UPI / QR</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card POS</option>
                </select>
              </div>
            </div>

            {/* Cart Items */}
            <div className="border border-slate-200 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1.5">
              {cart.length === 0 ? (
                <p className="text-slate-400 text-center py-4 text-xs italic">
                  Cart is empty. Select medicines to dispense.
                </p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="p-2 rounded-lg bg-slate-50 flex items-center justify-between">
                    <div className="max-w-[140px]">
                      <p className="font-bold text-slate-800 truncate">{item.description}</p>
                      <p className="text-[10px] text-slate-400 font-mono">₹{item.unitPrice} ea ({item.gstPercent}% GST)</p>
                    </div>

                    {/* Qty Controls */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="w-5 h-5 bg-white border border-slate-300 rounded font-bold text-slate-600 flex items-center justify-center hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold font-mono">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="w-5 h-5 bg-white border border-slate-300 rounded font-bold text-slate-600 flex items-center justify-center hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-slate-800">₹{item.total}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-slate-300 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Math */}
            <div className="pt-2 border-t border-slate-200 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST:</span>
                <span>+ ₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-200 pt-1">
                <span>Total:</span>
                <span className="text-teal-800">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-soft disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{loading ? 'Dispensing...' : `Dispense & Print Bill (₹${grandTotal.toFixed(2)})`}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Add New Pharmaceutical Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddMedicine} className="p-6 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={newMed.brandName}
                  onChange={(e) => setNewMed({ ...newMed, brandName: e.target.value })}
                  placeholder="e.g. Azithral 500"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Generic Chemical Composition</label>
                <input
                  type="text"
                  value={newMed.genericName}
                  onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                  placeholder="e.g. Azithromycin Dihydrate 500mg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dosage Form</label>
                  <select
                    value={newMed.category}
                    onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Syrup">Syrup / Suspension</option>
                    <option value="Injection">Injection / Infusion</option>
                    <option value="Ointment">Ointment / Gel</option>
                    <option value="IV Fluid">IV Fluid Bottle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={newMed.batchNo}
                    onChange={(e) => setNewMed({ ...newMed, batchNo: e.target.value })}
                    placeholder="BT-9921"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMed.unitPrice}
                    onChange={(e) => setNewMed({ ...newMed, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={newMed.stock}
                    onChange={(e) => setNewMed({ ...newMed, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST %</label>
                  <select
                    value={newMed.gstPercent}
                    onChange={(e) => setNewMed({ ...newMed, gstPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-soft"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
