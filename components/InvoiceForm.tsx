
import React from 'react';
import { InvoiceData, CustomerData } from '../types';

interface InvoiceFormProps {
  data: InvoiceData;
  customers: CustomerData[];
  onDataChange: (field: keyof InvoiceData, value: string | number) => void;
}

const InputField: React.FC<{
  label: string;
  id: keyof InvoiceData;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
}> = ({ label, id, value, onChange, type = 'text', className = '' }) => (
  <div className={`flex flex-col ${className}`}>
    <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-400">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
      step={type === 'number' ? '0.01' : undefined}
    />
  </div>
);

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);

const InvoiceForm: React.FC<InvoiceFormProps> = ({ data, customers, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    onDataChange(name as keyof InvoiceData, type === 'number' ? parseFloat(value) || '' : value);
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
        onDataChange('debtorName', selectedCustomer.name);
        onDataChange('debtorStreet', selectedCustomer.street);
        onDataChange('debtorHouseNr', selectedCustomer.houseNr);
        onDataChange('debtorZip', selectedCustomer.zip);
        onDataChange('debtorCity', selectedCustomer.city);
        onDataChange('debtorCountry', selectedCustomer.country);
    }
  };

  return (
    <div className="space-y-6">
      <FormSection title="Zahlungsempfänger (Kreditor)">
        <InputField label="IBAN" id="creditorIban" value={data.creditorIban} onChange={handleChange} className="col-span-2" />
        <InputField label="Name" id="creditorName" value={data.creditorName} onChange={handleChange} className="col-span-2" />
        <InputField label="Strasse" id="creditorStreet" value={data.creditorStreet} onChange={handleChange} />
        <InputField label="Nr." id="creditorHouseNr" value={data.creditorHouseNr} onChange={handleChange} />
        <InputField label="PLZ" id="creditorZip" value={data.creditorZip} onChange={handleChange} />
        <InputField label="Ort" id="creditorCity" value={data.creditorCity} onChange={handleChange} />
        <InputField label="Land" id="creditorCountry" value={data.creditorCountry} onChange={handleChange} className="col-span-2" />
      </FormSection>

      <FormSection title="Zahler (Debitor)">
         <div className="flex flex-col col-span-2">
            <label htmlFor="customer-select" className="mb-1 text-sm font-medium text-gray-400">
                Kunde auswählen (optional)
            </label>
            <select
                id="customer-select"
                onChange={handleCustomerSelect}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
                <option value="">-- Manuelle Eingabe --</option>
                {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
            </select>
        </div>
        <InputField label="Name" id="debtorName" value={data.debtorName} onChange={handleChange} className="col-span-2" />
        <InputField label="Strasse" id="debtorStreet" value={data.debtorStreet} onChange={handleChange} />
        <InputField label="Nr." id="debtorHouseNr" value={data.debtorHouseNr} onChange={handleChange} />
        <InputField label="PLZ" id="debtorZip" value={data.debtorZip} onChange={handleChange} />
        <InputField label="Ort" id="debtorCity" value={data.debtorCity} onChange={handleChange} />
        <InputField label="Land" id="debtorCountry" value={data.debtorCountry} onChange={handleChange} className="col-span-2" />
      </FormSection>

      <FormSection title="Zahlungsdetails">
        <InputField label="Betrag" id="amount" value={data.amount} onChange={handleChange} type="number" />
        <div className="flex flex-col">
            <label htmlFor="currency" className="mb-1 text-sm font-medium text-gray-400">
                Währung
            </label>
            <select
                id="currency"
                name="currency"
                value={data.currency}
                onChange={handleChange}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
                <option value="CHF">CHF</option>
                <option value="EUR">EUR</option>
            </select>
        </div>
        <InputField label="Referenznummer (QR-R)" id="reference" value={data.reference} onChange={handleChange} className="col-span-2" />
        <InputField label="Zusätzliche Infos" id="unstructuredMessage" value={data.unstructuredMessage} onChange={handleChange} className="col-span-2" />
      </FormSection>
    </div>
  );
};

export default InvoiceForm;