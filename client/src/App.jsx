import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import InvoiceModal from './components/InvoiceModal';
import PaymentModal from './components/PaymentModal';
import NewInvoiceModal from './components/NewInvoiceModal';
import NewPatientModal from './components/NewPatientModal';

// Pages
import Dashboard from './pages/Dashboard';
import OPDBilling from './pages/OPDBilling';
import IPDBilling from './pages/IPDBilling';
import BedManagement from './pages/BedManagement';
import DiagnosticBilling from './pages/DiagnosticBilling';
import PharmacyBilling from './pages/PharmacyBilling';
import InsuranceClaims from './pages/InsuranceClaims';
import InvoicesList from './pages/InvoicesList';
import PatientsList from './pages/PatientsList';
import DoctorsList from './pages/DoctorsList';
import TariffMaster from './pages/TariffMaster';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('curaflow_theme') || 'traditional');
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newInvoiceType, setNewInvoiceType] = useState('OPD_CONSULTATION');
  const [preSelectedPatient, setPreSelectedPatient] = useState(null);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatientType, setNewPatientType] = useState('OPD');

  const refreshAll = () => {
    Promise.all([
      api.getDashboardStats(),
      api.getSettings()
    ]).then(([statRes, setRes]) => {
      if (statRes.data) setStats(statRes.data);
      if (setRes.data) setSettings(setRes.data);
    }).catch(console.error);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    localStorage.setItem('curaflow_theme', theme);
  }, [theme]);

  // Fast Traditional Keyboard Shortcuts (F1 - F9)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          setSelectedInvoice(null);
          setPayingInvoice(null);
          setShowNewInvoice(false);
          setShowNewPatient(false);
        }
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        handleOpenQuickBill('OPD_CONSULTATION');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('opd-billing');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('ipd-billing');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('beds');
      } else if (e.key === 'F5') {
        e.preventDefault();
        setActiveTab('diagnostics');
      } else if (e.key === 'F6') {
        e.preventDefault();
        setActiveTab('pharmacy');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setActiveTab('insurance');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setActiveTab('invoices');
      } else if (e.key === 'F9') {
        e.preventDefault();
        setActiveTab('reports');
      } else if (e.key === 'Escape') {
        setSelectedInvoice(null);
        setPayingInvoice(null);
        setShowNewInvoice(false);
        setShowNewPatient(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGlobalSearch = (query) => {
    setGlobalSearch(query);
    if (query && activeTab !== 'invoices' && activeTab !== 'patients') {
      setActiveTab('invoices');
    }
  };

  const handleOpenQuickBill = (type = 'OPD_CONSULTATION', patient = null) => {
    setNewInvoiceType(type);
    setPreSelectedPatient(patient);
    setShowNewInvoice(true);
  };

  const handleOpenNewPatient = (type = 'OPD') => {
    setNewPatientType(type);
    setShowNewPatient(true);
  };

  const handleInvoiceCreated = (invoice) => {
    setShowNewInvoice(false);
    setPreSelectedPatient(null);
    refreshAll();
    setSelectedInvoice(invoice);
  };

  const handlePatientCreated = (patient) => {
    setShowNewPatient(false);
    refreshAll();
    if (patient.patientType === 'IPD') {
      setActiveTab('ipd-billing');
    } else {
      handleOpenQuickBill('OPD_CONSULTATION', patient);
    }
  };

  const handlePaymentSuccess = (updatedInvoice) => {
    setPayingInvoice(null);
    refreshAll();
    setSelectedInvoice(updatedInvoice);
  };

  const isTrad = theme === 'traditional';

  return (
    <div className={`flex h-screen overflow-hidden selection:bg-blue-100 selection:text-blue-900 ${
      isTrad ? 'theme-traditional bg-[#f1f5f9] text-slate-900' : 'bg-[#f8fafc] text-slate-700'
    }`}>
      
      {/* Left Sidebar (Responsive Drawer on mobile/tablet, Persistent on desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        theme={theme}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <Navbar
          onOpenNewInvoice={() => handleOpenQuickBill('OPD_CONSULTATION')}
          onOpenNewPatient={() => handleOpenNewPatient('OPD')}
          onSearch={handleGlobalSearch}
          onRefresh={refreshAll}
          hospitalName={settings?.hospitalName}
          theme={theme}
          setTheme={setTheme}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Dynamic Page Body */}
        <main className={`flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-7 ${
          isTrad ? 'bg-slate-100/90' : 'bg-[#f8fafc]'
        }`}>
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              onViewInvoice={(inv) => setSelectedInvoice(inv)}
              onQuickBill={handleOpenQuickBill}
              onAdmitPatient={() => handleOpenNewPatient('IPD')}
              setActiveTab={setActiveTab}
              theme={theme}
            />
          )}

          {activeTab === 'opd-billing' && (
            <OPDBilling
              onViewInvoice={(inv) => setSelectedInvoice(inv)}
              theme={theme}
            />
          )}

          {activeTab === 'ipd-billing' && (
            <IPDBilling
              onViewInvoice={(inv) => setSelectedInvoice(inv)}
              onOpenNewInvoice={handleOpenQuickBill}
              onAdmitPatient={() => handleOpenNewPatient('IPD')}
              theme={theme}
            />
          )}

          {activeTab === 'beds' && (
            <BedManagement
              onAdmitPatient={() => handleOpenNewPatient('IPD')}
              theme={theme}
            />
          )}

          {activeTab === 'diagnostics' && (
            <DiagnosticBilling
              onViewInvoice={(inv) => setSelectedInvoice(inv)}
              theme={theme}
            />
          )}

          {activeTab === 'pharmacy' && (
            <PharmacyBilling
              onViewInvoice={(inv) => setSelectedInvoice(inv)}
              theme={theme}
            />
          )}

          {activeTab === 'insurance' && (
            <InsuranceClaims
              theme={theme}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesList
              onViewInvoice={(inv) => setSelectedInvoice(inv)}
              onPayBalance={(inv) => setPayingInvoice(inv)}
              onOpenNewInvoice={handleOpenQuickBill}
              searchQuery={globalSearch}
              theme={theme}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsList
              onOpenNewPatient={() => handleOpenNewPatient('OPD')}
              onOpenBillForPatient={(p) => handleOpenQuickBill('OPD_CONSULTATION', p)}
              theme={theme}
            />
          )}

          {activeTab === 'doctors' && (
            <DoctorsList
              theme={theme}
            />
          )}

          {activeTab === 'tariffs' && (
            <TariffMaster
              theme={theme}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              theme={theme}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              onSettingsUpdated={(newSettings) => setSettings(newSettings)}
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* Printable Traditional Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          settings={settings}
          onClose={() => setSelectedInvoice(null)}
          onPayBalance={(inv) => {
            setSelectedInvoice(null);
            setPayingInvoice(inv);
          }}
        />
      )}

      {/* Record Payment Due Modal */}
      {payingInvoice && (
        <PaymentModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* New Invoice Generator Modal */}
      {showNewInvoice && (
        <NewInvoiceModal
          defaultType={newInvoiceType}
          preSelectedPatient={preSelectedPatient}
          onClose={() => {
            setShowNewInvoice(false);
            setPreSelectedPatient(null);
          }}
          onInvoiceCreated={handleInvoiceCreated}
        />
      )}

      {/* New Patient Registration Modal */}
      {showNewPatient && (
        <NewPatientModal
          defaultType={newPatientType}
          onClose={() => setShowNewPatient(false)}
          onPatientCreated={handlePatientCreated}
        />
      )}

    </div>
  );
}
