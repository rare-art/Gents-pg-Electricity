import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { BillModal } from './components/BillModal';
import { ResidentModal } from './components/ResidentModal';
import { MeterModal } from './components/MeterModal';
import { WhatsAppModal } from './components/WhatsAppModal';

import { Dashboard } from './pages/Dashboard';
import { Residents } from './pages/Residents';
import { Meters } from './pages/Meters';
import { Bills } from './pages/Bills';
import { Reports } from './pages/Reports';

import { api } from './api';

function MainApp() {
  const { openLoginModal } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // App Data States
  const [stats, setStats] = useState(null);
  const [residents, setResidents] = useState([]);
  const [meters, setMeters] = useState([]);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);

  // Modal States
  const [showBillModal, setShowBillModal] = useState(false);
  const [showResidentModal, setShowResidentModal] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [editingMeter, setEditingMeter] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsData, resData, metersData, billsData, paymentsData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getResidents().catch(() => []),
        api.getMeters().catch(() => []),
        api.getBills().catch(() => []),
        api.getPayments().catch(() => [])
      ]);

      if (statsData) setStats(statsData);
      if (resData) setResidents(resData);
      if (metersData) setMeters(metersData);
      if (billsData) setBills(billsData);
      if (paymentsData) setPayments(paymentsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await api.updatePaymentStatus(paymentId, { status: newStatus });
      fetchAllData();
    } catch (err) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  const handleOpenEditResident = (resident) => {
    setEditingResident(resident);
    setShowResidentModal(true);
  };

  const handleOpenAddResident = () => {
    setEditingResident(null);
    setShowResidentModal(true);
  };

  const handleOpenEditMeter = (meter) => {
    setEditingMeter(meter);
    setShowMeterModal(true);
  };

  const handleOpenAddMeter = () => {
    setEditingMeter(null);
    setShowMeterModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              loading={loading}
              meters={meters}
              residents={residents}
              bills={bills}
              payments={payments}
              onNavigate={setActiveTab}
              onOpenNewBill={() => setShowBillModal(true)}
              onOpenWhatsApp={() => setShowWhatsAppModal(true)}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
            />
          )}

          {activeTab === 'residents' && (
            <Residents
              residents={residents}
              onRefresh={fetchAllData}
              onOpenAddResident={handleOpenAddResident}
              onEditResident={handleOpenEditResident}
            />
          )}

          {activeTab === 'meters' && (
            <Meters
              meters={meters}
              onRefresh={fetchAllData}
              onOpenAddMeter={handleOpenAddMeter}
              onEditMeter={handleOpenEditMeter}
            />
          )}

          {activeTab === 'bills' && (
            <Bills
              bills={bills}
              meters={meters}
              payments={payments}
              onRefresh={fetchAllData}
              onOpenNewBill={() => setShowBillModal(true)}
              onOpenWhatsApp={() => setShowWhatsAppModal(true)}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
            />
          )}

          {activeTab === 'payments' && (
            <Reports
              payments={payments}
              residents={residents}
              bills={bills}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
            />
          )}
        </main>
      </div>

      <Footer onOpenLogin={openLoginModal} />

      {/* Global Modals */}
      <LoginModal />

      <BillModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        onSuccess={fetchAllData}
        meters={meters}
        residents={residents}
      />

      <ResidentModal
        isOpen={showResidentModal}
        onClose={() => setShowResidentModal(false)}
        onSuccess={fetchAllData}
        resident={editingResident}
      />

      <MeterModal
        isOpen={showMeterModal}
        onClose={() => setShowMeterModal(false)}
        onSuccess={fetchAllData}
        meter={editingMeter}
      />

      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        bills={bills}
        payments={payments}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
