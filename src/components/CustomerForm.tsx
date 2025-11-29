import React from 'react';
import { CustomerData } from '../types';
import { Input } from '@heroui/react';

interface CustomerFormProps {
  data: CustomerData;
  onDataChange: (field: keyof CustomerData, value: string) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ data, onDataChange }) => {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Name"
            value={data.name}
            onChange={(e) => onDataChange('name', e.target.value)}
            className="col-span-2"
            placeholder="Gebe Kundennamen ein"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
          />

          <Input
            label="Straße"
            value={data.street}
            onChange={(e) => onDataChange('street', e.target.value)}
            placeholder="Gebe Straßename ein"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
          />

          <Input
            label="Nr."
            value={data.houseNr}
            onChange={(e) => onDataChange('houseNr', e.target.value)}
            placeholder="Gebe Hausnummer ein"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
          />

          <Input
            label="PLZ"
            value={data.zip}
            onChange={(e) => onDataChange('zip', e.target.value)}
            placeholder="Gebe Postleitzahl ein"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
          />

          <Input
            label="Ort"
            value={data.city}
            onChange={(e) => onDataChange('city', e.target.value)}
            placeholder="Gebe Ort ein"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
          />

          <Input
            label="Land"
            value={data.country}
            onChange={(e) => onDataChange('country', e.target.value)}
            className="col-span-2"
            placeholder="Gebe Land ein"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
          />
        </div>
    </div>
  );
};

export default CustomerForm;
