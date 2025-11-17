
import React from 'react';
import { ExpenseData } from '../types';

interface ExpenseFormProps {
  data: ExpenseData;
  onDataChange: (field: keyof ExpenseData, value: string | number) => void;
}

const InputField: React.FC<{
  label: string;
  id: keyof ExpenseData;
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

const ExpenseForm: React.FC<ExpenseFormProps> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    onDataChange(name as keyof ExpenseData, type === 'number' ? parseFloat(value) || '' : value);
  };

  return (
    <div className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <InputField label="Fälligkeitsdatum" id="date" value={data.date} onChange={handleChange} type="date" className="col-span-2" />
             <InputField label="Anbieter / Verkäufer" id="vendor" value={data.vendor} onChange={handleChange} className="col-span-2"/>
             <InputField label="Beschreibung" id="description" value={data.description} onChange={handleChange} className="col-span-2" />
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
             <InputField label="Kategorie" id="category" value={data.category} onChange={handleChange} className="col-span-2"/>
        </div>
    </div>
  );
};

export default ExpenseForm;