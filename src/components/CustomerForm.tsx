import React from 'react';
import { CustomerData } from '../types';

interface CustomerFormProps {
  data: CustomerData;
  onDataChange: (field: keyof CustomerData, value: string) => void;
}

const InputField: React.FC<{
  label: string;
  id: keyof CustomerData;
  value: string;
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
    />
  </div>
);

const CustomerForm: React.FC<CustomerFormProps> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    onDataChange(name as keyof CustomerData, value);
  };

  return (
    <div className="space-y-4 bg-content1 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <InputField label="Name" id="name" value={data.name} onChange={handleChange} className="col-span-2"/>
             <InputField label="Strasse" id="street" value={data.street} onChange={handleChange} />
             <InputField label="Nr." id="houseNr" value={data.houseNr} onChange={handleChange} />
             <InputField label="PLZ" id="zip" value={data.zip} onChange={handleChange} />
             <InputField label="Ort" id="city" value={data.city} onChange={handleChange} />
             <InputField label="Land" id="country" value={data.country} onChange={handleChange} className="col-span-2" />
        </div>
    </div>
  );
};

export default CustomerForm;
