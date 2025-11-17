import React from 'react';
import { SettingsData } from '../types';

interface SettingsFormProps {
  data: SettingsData;
  onDataChange: (field: keyof SettingsData, value: string | number) => void;
  onLogoChange: (file: File) => void;
}

const InputField: React.FC<{
  label: string;
  id: keyof SettingsData;
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
    />
  </div>
);

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);

const SettingsForm: React.FC<SettingsFormProps> = ({ data, onDataChange, onLogoChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onDataChange(name as keyof SettingsData, value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onLogoChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <FormSection title="Standard Zahlungsempfänger (Ihre Firma)">
        <InputField label="IBAN" id="creditorIban" value={data.creditorIban} onChange={handleChange} className="col-span-2" />
        <InputField label="Name" id="creditorName" value={data.creditorName} onChange={handleChange} className="col-span-2" />
        <InputField label="Strasse" id="creditorStreet" value={data.creditorStreet} onChange={handleChange} />
        <InputField label="Nr." id="creditorHouseNr" value={data.creditorHouseNr} onChange={handleChange} />
        <InputField label="PLZ" id="creditorZip" value={data.creditorZip} onChange={handleChange} />
        <InputField label="Ort" id="creditorCity" value={data.creditorCity} onChange={handleChange} />
        <InputField label="Land" id="creditorCountry" value={data.creditorCountry} onChange={handleChange} className="col-span-2" />
      </FormSection>
      
       <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2 mb-4">Firmenlogo</h3>
          <p className="text-sm text-gray-400 mb-2">Dieses Logo wird standardmässig auf neuen Rechnungen verwendet.</p>
          <div className="flex items-center gap-4">
             {data.logoSrc && <img src={data.logoSrc} alt="Firmenlogo Vorschau" className="h-16 w-auto bg-white p-1 rounded-md" />}
            <input
                type="file"
                id="logo"
                accept="image/png, image/jpeg, image/svg+xml"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600"
            />
          </div>
      </div>

    </div>
  );
};

export default SettingsForm;
