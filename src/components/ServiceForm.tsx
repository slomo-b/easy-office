import React from 'react';
import { ServiceData } from '../types';

interface ServiceFormProps {
  data: ServiceData;
  onDataChange: (field: keyof ServiceData, value: string | number) => void;
}

const InputField: React.FC<{
  label: string;
  id: keyof ServiceData;
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

const ServiceForm: React.FC<ServiceFormProps> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    onDataChange(name as keyof ServiceData, type === 'number' ? parseFloat(value) || '' : value);
  };

  return (
    <div className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <InputField label="Name der Leistung" id="name" value={data.name} onChange={handleChange} className="col-span-2"/>
             
             <InputField label="Preis" id="price" value={data.price} onChange={handleChange} type="number" />
             <div className="flex flex-col">
                <label htmlFor="unit" className="mb-1 text-sm font-medium text-gray-400">
                    Einheit
                </label>
                <select
                    id="unit"
                    name="unit"
                    value={data.unit}
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                    <option value="Stunde">Stunde</option>
                    <option value="Tag">Tag</option>
                    <option value="Pauschal">Pauschal</option>
                </select>
            </div>
            <div className="flex flex-col col-span-2">
                 <label htmlFor="description" className="mb-1 text-sm font-medium text-gray-400">
                    Beschreibung (optional)
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={data.description}
                    onChange={handleChange}
                    rows={3}
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
            </div>
        </div>
    </div>
  );
};

export default ServiceForm;
