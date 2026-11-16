import React, { useState, useEffect } from 'react';
import {
  TestTube2,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Printer,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function DiagnosticBilling({ onViewInvoice }) {
  const [diagnostics, setDiagnostics] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Cart
  const [cart, setCart] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [uhid, setUhid] = useState('');
  const [phone, setPhone] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Priya Sundaram (Referral)');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [loading, setLoading] = useState(false);

  // New test modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTest, setNewTest] = useState({
    code: '',
    name: '',
    category: 'Biochemistry',
    sampleType: 'Serum',
    turnaroundTime: '2 Hours',
    price: 500,
    gstPercent: 0,
    normalRange: 'Normal'
  });

  const loadData = () => {
    Promise.all([api.getDiagnostics(), api.getPatients()])
      .then(([dRes, pRes]) => {
        if (dRes.data) setDiagnostics(dRes.data);
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
      setPatientName(pat.name);
      setUhid(pat.uhid);
      setPhone(pat.phone);
      if (pat.attendingDoctorName) setDoctorName(pat.attendingDoctorName);
    } else {
      setPatientName('');
      setUhid('');
      setPhone('');
    }
  };

  const handleAddToCart = (test) => {
    const exists = cart.find(i => i.id === test.id);
    if (exists) {
      setCart(cart.map(i => i.id === test.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } : i));
    } else {
      setCart([
        ...cart,
        {
          id: test.id,
          category: 'Diagnostics',
          code: test.code,
          description: test.name,
          quantity: 1,
          unitPrice: test.price,
          gstPercent: test.gstPercent || 0,
          discount: 0,
          total: test.price
        }
      ]);
    }
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const subTotal = cart.reduce((s, it) => s + it.total, 0);

  const handleCheckoutRequisition = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Cart is empty. Please add diagnostic tests.');
      return;
    }
    if (!patientName.trim()) {
      alert('Please enter or select a patient name.');
      return;
    }

    try {
      setLoading(true);
      const invoicePayload = {
        patientId: selectedPatientId || null,
        uhid: uhid || 'CF-WALKIN',
        patientName,
        patientPhone: phone,
        doctorName,
        department: 'Diagnostic & Imaging Sciences',
        wardBed: 'Pathology & Radiology Desk',
        invoiceType: 'DIAGNOSTIC',
        items: cart,
        subTotal,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: subTotal,
        advanceAdjusted: 0,
        netPayable: subTotal,
        paidAmount: subTotal,
        paymentStatus: 'PAID',
        paymentMode,
        remarks: 'Lab Requisition Order & Specimen Receipt'
      };

      const res = await api.createInvoice(invoicePayload);
      if (res.success) {
        setCart([]);
        setPatientName('');
        setUhid('');
        setPhone('');
        onViewInvoice(res.data);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewTest = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createDiagnostic(newTest);
      if (res.success) {
        setShowAddModal(false);
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const categories = ['ALL', ...new Set(diagnostics.map(d => d.category))];

  const filteredTests = diagnostics.filter(d => {
    const matchesCat = categoryFilter === 'ALL' || d.category === categoryFilter;
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Diagnostic, Laboratory & Radiology Requisitions</h2>
          <p className="text-xs text-slate-400">Pathology investigations, specimen tracking, and diagnostic test invoice generation</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-soft-sm transition-all self-start"
        >
          <Plus className="w-3.5 h-3.5 text-brand-600" />
          <span>Add New Test to Catalog</span>
        </button>
      </div>

      {/* Main Grid: Test Catalog + Order Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Test Catalog & Search (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search investigation by name (e.g. CBC, MRI, Troponin, Ultrasound)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? 'bg-brand-600 text-white shadow-soft-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTests.map(test => (
              <div
                key={test.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm hover:shadow-soft transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-brand-700 font-bold uppercase tracking-wider block">
                        {test.code}
                      </span>
                      <h4 className="font-bold text-slate-800 text-xs mt-0.5 leading-snug">
                        {test.name}
                      </h4>
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-800 bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md border border-teal-100">
                      ₹{test.price}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                    <p>Sample: <strong className="text-slate-700">{test.sampleType}</strong></p>
                    <p className="flex items-center text-slate-400">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" /> Turnaround: {test.turnaroundTime}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    {test.category}
                  </span>
                  <button
                    onClick={() => handleAddToCart(test)}
                    className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Select Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right: Diagnostic Requisition Basket (4-5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm h-fit sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-slate-800 text-sm">Requisition Basket</h3>
            </div>
            <span className="font-mono font-bold text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full">
              {cart.length} Tests
            </span>
          </div>

          <form onSubmit={handleCheckoutRequisition} className="mt-4 space-y-3.5 text-xs">
            {/* Patient Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              >
                <option value="">-- Direct Lab Walk-in --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} [{p.uhid}]</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient Name *</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient Full Name"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CASH">Cash Counter</option>
                  <option value="CARD">Card POS</option>
                </select>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="border border-slate-200 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1.5">
              {cart.length === 0 ? (
                <p className="text-slate-400 text-center py-4 text-xs italic">
                  No tests added yet. Select tests from the left catalog.
                </p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <div className="max-w-[180px]">
                      <p className="font-bold text-slate-800 truncate">{item.description}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.code}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-800">₹{item.total}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-slate-300 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Math */}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-mono">
              <span className="font-bold text-slate-700">Total Payable:</span>
              <span className="text-lg font-extrabold text-teal-800">₹{subTotal.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-soft disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{loading ? 'Processing...' : `Issue Order & Print Bill (₹${subTotal})`}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Add Test Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-soft-lg w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Add Diagnostic Investigation</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateNewTest} className="p-6 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test Name *</label>
                <input
                  type="text"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                  placeholder="e.g. Serum Ferritin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Test Code</label>
                  <input
                    type="text"
                    value={newTest.code}
                    onChange={(e) => setNewTest({ ...newTest, code: e.target.value })}
                    placeholder="LAB-FERR"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newTest.category}
                    onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Endocrinology">Endocrinology</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={newTest.price}
                    onChange={(e) => setNewTest({ ...newTest, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Turnaround Time</label>
                  <input
                    type="text"
                    value={newTest.turnaroundTime}
                    onChange={(e) => setNewTest({ ...newTest, turnaroundTime: e.target.value })}
                    placeholder="e.g. 3 Hours"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
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
                  Save Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
