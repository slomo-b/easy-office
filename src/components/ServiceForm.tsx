import React from 'react';
import { ServiceData } from '../types';
import { ChevronDown } from 'lucide-react';

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

const ServiceForm: React.FC<ServiceFormProps> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    onDataChange(name as keyof ServiceData, type === 'number' ? parseFloat(value) || '' : value);
  };

  return (
    <div className="space-y-6 bg-content1 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <InputField label="Name der Leistung" id="name" value={data.name} onChange={handleChange} className="col-span-2"/>
             
             <InputField label="Preis" id="price" value={data.price} onChange={handleChange} type="number" />
             <div className="flex flex-col">
                <label htmlFor="unit" className="mb-1 text-sm font-medium text-default-500">
                    Einheit
                </label>
                <div className="relative">
                  <select
                      id="unit"
                      name="unit"
                      value={data.unit}
                      onChange={handleChange}
                      className="w-full appearance-none bg-content2 border border-divider rounded-md px-3 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                      <option value="Stunden">Stunden</option>
                      <option value="Tage">Tage</option>
                      <option value="Pauschal">Pauschal</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-default-500">
                      <ChevronDown size={20} />
                  </div>
                </div>
            </div>
             <div className="flex flex-col col-span-2">
                <InputField label="Standard MwSt.-Satz (%)" id="vatRate" value={data.vatRate} onChange={handleChange} type="number" />
            </div>
            <div className="flex flex-col col-span-2">
                 <label htmlFor="description" className="mb-1 text-sm font-medium text-default-500">
                    Beschreibung (optional)
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={data.description}
                    onChange={handleChange}
                    rows={3}
                    className="bg-content2 border border-divider rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
            </div>
        </div>
    </div>
  );
};

export default ServiceForm;
