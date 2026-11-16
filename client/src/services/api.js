const API_BASE = '/api';

export const api = {
  // Health
  checkHealth: () => fetch(`${API_BASE}/health`).then(r => r.json()),

  // Dashboard & Reports
  getDashboardStats: () => fetch(`${API_BASE}/reports/dashboard`).then(r => r.json()),
  getRevenueReports: () => fetch(`${API_BASE}/reports/revenue-trend`).then(r => r.json()),

  // Patients
  getPatients: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/patients${qs ? '?' + qs : ''}`).then(r => r.json());
  },
  getPatientById: (id) => fetch(`${API_BASE}/patients/${id}`).then(r => r.json()),
  createPatient: (data) => fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  updatePatient: (id, data) => fetch(`${API_BASE}/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Invoices
  getInvoices: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/invoices${qs ? '?' + qs : ''}`).then(r => r.json());
  },
  getInvoiceById: (id) => fetch(`${API_BASE}/invoices/${id}`).then(r => r.json()),
  createInvoice: (data) => fetch(`${API_BASE}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  recordPayment: (id, data) => fetch(`${API_BASE}/invoices/${id}/payment`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Doctors
  getDoctors: () => fetch(`${API_BASE}/doctors`).then(r => r.json()),
  createDoctor: (data) => fetch(`${API_BASE}/doctors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Beds
  getBeds: () => fetch(`${API_BASE}/beds`).then(r => r.json()),
  updateBedStatus: (id, data) => fetch(`${API_BASE}/beds/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Pharmacy
  getPharmacy: () => fetch(`${API_BASE}/pharmacy`).then(r => r.json()),
  createPharmacyItem: (data) => fetch(`${API_BASE}/pharmacy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  updatePharmacyStock: (id, stock) => fetch(`${API_BASE}/pharmacy/${id}/stock`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock })
  }).then(r => r.json()),

  // Diagnostics
  getDiagnostics: () => fetch(`${API_BASE}/diagnostics`).then(r => r.json()),
  createDiagnostic: (data) => fetch(`${API_BASE}/diagnostics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Tariffs
  getTariffs: () => fetch(`${API_BASE}/tariffs`).then(r => r.json()),
  createTariff: (data) => fetch(`${API_BASE}/tariffs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Insurance
  getClaims: () => fetch(`${API_BASE}/insurance/claims`).then(r => r.json()),
  createClaim: (data) => fetch(`${API_BASE}/insurance/claims`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  updateClaim: (id, data) => fetch(`${API_BASE}/insurance/claims/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Settings
  getSettings: () => fetch(`${API_BASE}/settings`).then(r => r.json()),
  updateSettings: (data) => fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Printers & Hardware Print Spooler
  getPrinters: () => fetch(`${API_BASE}/printers`).then(r => r.json()),
  sendPrintJob: (data) => fetch(`${API_BASE}/printers/print`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
};
