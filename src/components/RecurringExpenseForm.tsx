import React from 'react';
import { RecurringExpenseData } from '../types';
import { ChevronDown } from 'lucide-react';

interface RecurringExpenseFormProps {
  data: RecurringExpenseData;
  onDataChange: (field: keyof RecurringExpenseData, value: string | number) => void;
}

const InputField: React.FC<{
  label: string;
  id: keyof RecurringExpenseData;
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

const RecurringExpenseForm: React.FC<RecurringExpenseFormProps> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    onDataChange(name as keyof RecurringExpenseData, type === 'number' ? parseFloat(value) || '' : value);
  };

  return (
    <div className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <InputField label="Anbieter / Verkäufer" id="vendor" value={data.vendor} onChange={handleChange} className="col-span-2"/>
             <InputField label="Beschreibung" id="description" value={data.description} onChange={handleChange} className="col-span-2" />
             <InputField label="Betrag" id="amount" value={data.amount} onChange={handleChange} type="number" />
             <div className="flex flex-col">
                <label htmlFor="currency" className="mb-1 text-sm font-medium text-gray-400">
                    Währung
                </label>
                <div className="relative">
                  <select
                      id="currency"
                      name="currency"
                      value={data.currency}
                      onChange={handleChange}
                      className="w-full appearance-none bg-gray-700 border border-gray-600 rounded-md px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  >
                      <option value="CHF">CHF</option>
                      <option value="EUR">EUR</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <ChevronDown size={20} />
                  </div>
                </div>
            </div>
             <InputField label="Kategorie" id="category" value={data.category} onChange={handleChange} className="col-span-2"/>
             <div className="flex flex-col">
                <label htmlFor="interval" className="mb-1 text-sm font-medium text-gray-400">
                    Intervall
                </label>
                <div className="relative">
                  <select
                      id="interval"
                      name="interval"
                      value={data.interval}
                      onChange={handleChange}
                      className="w-full appearance-none bg-gray-700 border border-gray-600 rounded-md px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  >
                      <option value="monthly">Monatlich</option>
                      <option value="quarterly">Quartalsweise</option>
                      <option value="yearly">Jährlich</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <ChevronDown size={20} />
                  </div>
                </div>
            </div>
            <InputField label="Start-Datum" id="startDate" value={data.startDate} onChange={handleChange} type="date" />
        </div>
    </div>
  );
};

export default RecurringExpenseForm;
