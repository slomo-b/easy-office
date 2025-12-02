import React from 'react';
import { Button, Select, SelectItem } from '@heroui/react';
import { InvoiceData, CustomerData, InvoiceItem } from '../types';
import { Trash2 } from 'lucide-react';

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

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-content1 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-primary border-b border-divider pb-2 mb-4">{title}</h3>
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

  const handleCustomerSelect = (keys: any) => {
    const customerId = Array.from(keys)[0] as string;
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
                    <span className="mr-3 text-foreground">Mehrwertsteuer (MwSt.) aktivieren</span>
                    <div className="relative">
                        <input
                        type="checkbox"
                        id="vat-toggle"
                        className="sr-only peer"
                        checked={data.vatEnabled}
                        onChange={(e) => onDataChange('vatEnabled', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-content3 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                </label>
            </div>
            <div className="col-span-2 space-y-2">
                {data.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-background/50 p-2 rounded-md">
                        <input type="text" placeholder="Beschreibung" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className={`bg-content2 border-divider rounded px-2 py-1 text-sm text-foreground ${data.vatEnabled ? 'col-span-12 md:col-span-4' : 'col-span-12 md:col-span-5'}`}/>
                        <input type="number" placeholder="Menge" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="col-span-4 md:col-span-2 bg-content2 border-divider rounded px-2 py-1 text-sm text-foreground"/>
                        <input type="text" placeholder="Einheit" value={item.unit} onChange={e => handleItemChange(index, 'unit', e.target.value)} className="col-span-4 md:col-span-2 bg-content2 border-divider rounded px-2 py-1 text-sm text-foreground"/>
                        <input type="number" placeholder="Preis" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} className="col-span-4 md:col-span-2 bg-content2 border-divider rounded px-2 py-1 text-sm text-foreground"/>
                        {data.vatEnabled && (
                            <input type="number" placeholder="MwSt. %" value={item.vatRate} onChange={e => handleItemChange(index, 'vatRate', e.target.value)} className="col-span-4 md:col-span-1 bg-content2 border-divider rounded px-2 py-1 text-sm text-foreground"/>
                        )}
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            color="danger"
                            onClick={() => handleRemoveItem(index)}
                            className="min-w-0"
                        >
                            <Trash2 size={16}/>
                        </Button>
                    </div>
                ))}
                <Button
                    variant="light"
                    color="primary"
                    size="sm"
                    onClick={handleAddItem}
                >
                    + Position hinzufügen
                </Button>
            </div>
            <div className="col-span-2 text-right mt-4 border-t border-divider pt-4 space-y-2 text-sm">
                {data.vatEnabled && (
                  <>
                    <div className="flex justify-between">
                        <span className="text-default-500">Zwischentotal (Netto):</span>
                        <span className="text-foreground font-medium ml-2">{data.currency} {Number(data.subtotal).toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-default-500">MwSt.:</span>
                        <span className="text-foreground font-medium ml-2">{data.currency} {Number(data.vatAmount).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold text-lg">
                    <span className="text-foreground">Total:</span>
                    <span className="text-foreground ml-2">{data.currency} {Number(data.total).toFixed(2)}</span>
                </div>
            </div>
      </FormSection>

      <FormSection title="Zahler (Debitor)">
         <div className="flex flex-col col-span-2">
            <Select
                label="Kunde auswählen (optional)"
                placeholder="-- Manuelle Eingabe --"
                onSelectionChange={handleCustomerSelect}
                className="w-full"
                classNames={{
                    label: "mb-1 text-sm font-medium text-default-500",
                    trigger: "bg-content2 border border-divider rounded-md text-foreground shadow-none",
                    value: "text-foreground",
                    popoverContent: "bg-content2 border border-divider text-foreground"
                }}
                labelPlacement="outside"
            >
                {customers.map(customer => (
                    <SelectItem key={customer.id} textValue={customer.name} classNames={{base: "text-foreground data-[hover=true]:bg-content3"}}>{customer.name}</SelectItem>
                ))}
            </Select>
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
            <Select
                label="Währung"
                selectedKeys={[data.currency]}
                onSelectionChange={(keys) => onDataChange('currency', Array.from(keys)[0] as string)}
                className="w-full"
                classNames={{
                    label: "mb-1 text-sm font-medium text-default-500",
                    trigger: "bg-content2 border border-divider rounded-md text-foreground shadow-none",
                    value: "text-foreground",
                    popoverContent: "bg-content2 border border-divider text-foreground"
                }}
                labelPlacement="outside"
                disallowEmptySelection
            >
                <SelectItem key="CHF" classNames={{base: "text-foreground data-[hover=true]:bg-content3"}}>CHF</SelectItem>
                <SelectItem key="EUR" classNames={{base: "text-foreground data-[hover=true]:bg-content3"}}>EUR</SelectItem>
            </Select>
        </div>
        <div></div>
        <InputField label="Referenznummer (QR-R)" id="reference" value={data.reference} onChange={handleChange} className="col-span-2" />
        <InputField label="Zusätzliche Infos (z.B. Rechnungs-Nr)" id="unstructuredMessage" value={data.unstructuredMessage} onChange={handleChange} className="col-span-2" />
      </FormSection>
    </div>
  );
};

export default InvoiceForm;
