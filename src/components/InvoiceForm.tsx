
import React from 'react';
import { InvoiceData, CustomerData, InvoiceItem } from '../types';
import { Trash2, ChevronDown } from 'lucide-react';

interface InvoiceFormProps {
  data: InvoiceData;
  customers: CustomerData[];
  onDataChange: (field: keyof InvoiceData, value: any) => void;
  defaultVatRate: number;
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

const InvoiceForm: React.FC<InvoiceFormProps> = ({ data, customers, onDataChange, defaultVatRate }) => {
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

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...data.items];
    const item = { ...newItems[index], [field]: value };
    // Ensure numeric fields are numbers
    if (field === 'quantity' || field === 'price' || field === 'vatRate') {
        item[field] = value === '' ? '' : Number(value);
    }
    newItems[index] = item;
    onDataChange('items', newItems);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = { 
        description: '', 
        quantity: 1, 
        unit: 'Stunden', 
        price: '',
        vatRate: data.vatEnabled ? defaultVatRate : ''
    };
    onDataChange('items', [...data.items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    onDataChange('items', newItems);
  };

  return (
    <div className="space-y-6">
       <FormSection title="Rechnungspositionen">
            <div className="col-span-2">
                 <label htmlFor="vat-toggle" className="flex items-center cursor-pointer">
                    <span className="mr-3 text-gray-300">Mehrwertsteuer (MwSt.) aktivieren</span>
                    <div className="relative">
                        <input
                        type="checkbox"
                        id="vat-toggle"
                        className="sr-only peer"
                        checked={data.vatEnabled}
                        onChange={(e) => onDataChange('vatEnabled', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </div>
                </label>
            </div>
            <div className="col-span-2 space-y-2">
                {data.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-900/50 p-2 rounded-md">
                        <input type="text" placeholder="Beschreibung" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className={`bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm ${data.vatEnabled ? 'col-span-12 md:col-span-4' : 'col-span-12 md:col-span-5'}`}/>
                        <input type="number" placeholder="Menge" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="col-span-4 md:col-span-2 bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm"/>
                        <input type="text" placeholder="Einheit" value={item.unit} onChange={e => handleItemChange(index, 'unit', e.target.value)} className="col-span-4 md:col-span-2 bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm"/>
                        <input type="number" placeholder="Preis" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} className="col-span-4 md:col-span-2 bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm"/>
                        {data.vatEnabled && (
                            <input type="number" placeholder="MwSt. %" value={item.vatRate} onChange={e => handleItemChange(index, 'vatRate', e.target.value)} className="col-span-4 md:col-span-1 bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm"/>
                        )}
                        <button onClick={() => handleRemoveItem(index)} className="col-span-12 md:col-span-1 text-red-500 hover:text-red-400 flex justify-center items-center"><Trash2 size={16}/></button>
                    </div>
                ))}
                <button onClick={handleAddItem} className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold py-1">+ Position hinzufügen</button>
            </div>
            <div className="col-span-2 text-right mt-4 border-t border-gray-700 pt-4 space-y-2 text-sm">
                {data.vatEnabled && (
                  <>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Zwischentotal (Netto):</span>
                        <span className="text-white font-medium ml-2">{data.currency} {Number(data.subtotal).toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-400">MwSt.:</span>
                        <span className="text-white font-medium ml-2">{data.currency} {Number(data.vatAmount).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-white ml-2">{data.currency} {Number(data.total).toFixed(2)}</span>
                </div>
            </div>
      </FormSection>

      <FormSection title="Zahler (Debitor)">
         <div className="flex flex-col col-span-2">
            <label htmlFor="customer-select" className="mb-1 text-sm font-medium text-gray-400">
                Kunde auswählen (optional)
            </label>
            <div className="relative">
              <select
                  id="customer-select"
                  onChange={handleCustomerSelect}
                  className="w-full appearance-none bg-gray-700 border border-gray-600 rounded-md px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              >
                  <option value="">-- Manuelle Eingabe --</option>
                  {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDown size={20} />
              </div>
            </div>
        </div>
        <InputField label="Name" id="debtorName" value={data.debtorName} onChange={handleChange} className="col-span-2" />
        <InputField label="Strasse" id="debtorStreet" value={data.debtorStreet} onChange={handleChange} />
        <InputField label="Nr." id="debtorHouseNr" value={data.debtorHouseNr} onChange={handleChange} />
        <InputField label="PLZ" id="debtorZip" value={data.debtorZip} onChange={handleChange} />
        <InputField label="Ort" id="debtorCity" value={data.debtorCity} onChange={handleChange} />
        <InputField label="Land" id="debtorCountry" value={data.debtorCountry} onChange={handleChange} className="col-span-2" />
      </FormSection>

      <FormSection title="Zahlungsdetails">
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
        <div></div>
        <InputField label="Referenznummer (QR-R)" id="reference" value={data.reference} onChange={handleChange} className="col-span-2" />
        <InputField label="Zusätzliche Infos (z.B. Rechnungs-Nr)" id="unstructuredMessage" value={data.unstructuredMessage} onChange={handleChange} className="col-span-2" />
      </FormSection>
    </div>
  );
};

export default InvoiceForm;