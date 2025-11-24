import React from 'react';
import { ExpenseData } from '../types';
import { ChevronDown } from 'lucide-react';

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
    <label htmlFor={id} className="mb-1 text-sm font-medium text-default-500">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="bg-content2 border border-divider rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
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
    <div className="space-y-6 bg-content1 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <InputField label="Fälligkeitsdatum" id="date" value={data.date} onChange={handleChange} type="date" className="col-span-2" />
             <InputField label="Anbieter / Verkäufer" id="vendor" value={data.vendor} onChange={handleChange} className="col-span-2"/>
             <InputField label="Beschreibung" id="description" value={data.description} onChange={handleChange} className="col-span-2" />
             <InputField label="Betrag" id="amount" value={data.amount} onChange={handleChange} type="number" />
             <div className="flex flex-col">
                <label htmlFor="currency" className="mb-1 text-sm font-medium text-default-500">
                    Währung
                </label>
                <div className="relative">
                  <select
                      id="currency"
                      name="currency"
                      value={data.currency}
                      onChange={handleChange}
                      className="w-full appearance-none bg-content2 border border-divider rounded-md px-3 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                      <option value="CHF">CHF</option>
                      <option value="EUR">EUR</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-default-500">
                      <ChevronDown size={20} />
                  </div>
                </div>
            </div>
             <InputField label="Kategorie" id="category" value={data.category} onChange={handleChange} className="col-span-2"/>
        </div>
    </div>
  );
};

export default ExpenseForm;
