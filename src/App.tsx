
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
// FIX: Corrected import path for Invoices component
import Invoices from './pages/Dashboard';
import InvoiceEditor from './pages/InvoiceEditor';
import Expenses from './pages/Expenses';
import ExpenseEditor from './pages/ExpenseEditor';
import Settings from './pages/Settings';
import Customers from './pages/Customers';
import CustomerEditor from './pages/CustomerEditor';
import RecurringExpenseEditor from './pages/RecurringExpenseEditor';
import Projects from './pages/Projects';
import ProjectEditor from './pages/ProjectEditor';
import Services from './pages/Services';
import ServiceEditor from './pages/ServiceEditor';
import WindowControls from './components/WindowControls';
import { useFileSystem } from './context/FileSystemContext';

function App() {
  const { isReady, error } = useFileSystem();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <WindowControls />
        <div className="text-center bg-gray-800 p-10 rounded-lg shadow-2xl max-w-lg mx-auto relative">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Fehler</h1>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
         <WindowControls />
        <div className="flex flex-col items-center">
          <p>Initialisiere Dateisystem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen text-gray-200 font-sans relative">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-900 rounded-r-2xl relative">
        {/* === START: Robuster Titelleisten-Container === */}
        <div className="w-full h-12 flex justify-between items-center flex-shrink-0">
          {/* 1. Die Drag-Fläche: wächst, um den gesamten freien Platz zu füllen. */}
          <div className="flex-grow h-full titlebar-drag-region" />

          {/* 2. Die Buttons: haben eine feste Größe und werden an den rechten Rand geschoben. */}
          <WindowControls />
        </div>
        {/* === END: Robuster Titelleisten-Container === */}

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoice/new" element={<InvoiceEditor />} />
            <Route path="/invoice/edit/:id" element={<InvoiceEditor />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expense/new" element={<ExpenseEditor />} />
            <Route path="/expense/edit/:id" element={<ExpenseEditor />} />
            <Route path="/recurring-expense/new" element={<RecurringExpenseEditor />} />
            <Route path="/recurring-expense/edit/:id" element={<RecurringExpenseEditor />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customer/new" element={<CustomerEditor />} />
            <Route path="/customer/edit/:id" element={<CustomerEditor />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/new" element={<ProjectEditor />} />
            <Route path="/project/edit/:id" element={<ProjectEditor />} />
            <Route path="/services" element={<Services />} />
            <Route path="/service/new" element={<ServiceEditor />} />
            <Route path="/service/edit/:id" element={<ServiceEditor />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;