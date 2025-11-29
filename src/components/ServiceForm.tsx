import React from 'react';
import { ServiceData } from '../types';
import { Input, Textarea, Select, SelectItem } from '@heroui/react';

interface ServiceFormProps {
  data: ServiceData;
  onDataChange: (field: keyof ServiceData, value: string | number) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ data, onDataChange }) => {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Name der Leistung"
            value={data.name}
            onChange={(e) => onDataChange('name', e.target.value)}
            className="col-span-2"
            placeholder="Gebe Leistungsname ein"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
          />

          <Input
            label="Preis (CHF)"
            type="number"
            value={data.price ? data.price.toString() : ''}
            onChange={(e) => onDataChange('price', parseFloat(e.target.value) || 0)}
            placeholder="Gebe Preis ein"
            step="0.01"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
          />

          <Select
            label="Einheit"
            selectedKeys={[data.unit]}
            onSelectionChange={(keys) => {
              const selectedValue = Array.from(keys)[0] as string;
              onDataChange('unit', selectedValue);
            }}
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              trigger: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70 text-[#E2E8F0]",
            }}
          >
            <SelectItem key="Stunden">Stunden</SelectItem>
            <SelectItem key="Tage">Tage</SelectItem>
            <SelectItem key="Pauschal">Pauschal</SelectItem>
          </Select>

          <Input
            label="Standard MwSt.-Satz (%)"
            type="number"
            value={data.vatRate ? data.vatRate.toString() : ''}
            onChange={(e) => onDataChange('vatRate', parseFloat(e.target.value) || 0)}
            className="col-span-2"
            placeholder="Gebe MwSt.-Satz ein"
            step="0.01"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
          />

          <Textarea
            label="Beschreibung (optional)"
            value={data.description}
            onChange={(e) => onDataChange('description', e.target.value)}
            className="col-span-2"
            placeholder="Gebe Leistungsbeschreibung ein"
            minRows={3}
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

export default ServiceForm;
