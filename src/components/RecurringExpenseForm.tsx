import React from 'react';
import { RecurringExpenseData } from '../types';
import { Input, Select, SelectItem } from '@heroui/react';

interface RecurringExpenseFormProps {
  data: RecurringExpenseData;
  onDataChange: (field: keyof RecurringExpenseData, value: string | number) => void;
}

const RecurringExpenseForm: React.FC<RecurringExpenseFormProps> = ({ data, onDataChange }) => {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Anbieter / Verkäufer"
            value={data.vendor}
            onChange={(e) => onDataChange('vendor', e.target.value)}
            className="col-span-2"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
            placeholder="Gebe Anbieter / Verkäufer ein"
          />

          <Input
            label="Beschreibung"
            value={data.description}
            onChange={(e) => onDataChange('description', e.target.value)}
            className="col-span-2"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
            placeholder="Gebe Beschreibung ein"
          />

          <Input
            label="Betrag"
            type="number"
            value={data.amount ? data.amount.toString() : ''}
            onChange={(e) => onDataChange('amount', parseFloat(e.target.value) || 0)}
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
            placeholder="Gebe Betrag ein"
            step="0.01"
          />

          <Select
            label="Währung"
            selectedKeys={[data.currency]}
            onSelectionChange={(keys) => {
              const selectedValue = Array.from(keys)[0] as string;
              onDataChange('currency', selectedValue);
            }}
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              trigger: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70 text-[#E2E8F0]",
            }}
          >
            <SelectItem key="CHF">CHF</SelectItem>
            <SelectItem key="EUR">EUR</SelectItem>
            <SelectItem key="USD">USD</SelectItem>
            <SelectItem key="GBP">GBP</SelectItem>
          </Select>

          <Input
            label="Kategorie"
            value={data.category}
            onChange={(e) => onDataChange('category', e.target.value)}
            className="col-span-2"
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0] placeholder-[#64748B]",
            }}
            placeholder="Gebe Kategorie ein"
          />

          <Select
            label="Intervall"
            selectedKeys={[data.interval]}
            onSelectionChange={(keys) => {
              const selectedValue = Array.from(keys)[0] as string;
              onDataChange('interval', selectedValue);
            }}
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              trigger: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70 text-[#E2E8F0]",
            }}
          >
            <SelectItem key="monthly">Monatlich</SelectItem>
            <SelectItem key="quarterly">Quartalsweise</SelectItem>
            <SelectItem key="yearly">Jährlich</SelectItem>
          </Select>

          <Input
            label="Start-Datum"
            type="date"
            value={data.startDate}
            onChange={(e) => onDataChange('startDate', e.target.value)}
            classNames={{
              label: "text-[#94A3B8] font-semibold mb-2 text-sm",
              inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
              input: "text-[#E2E8F0]",
            }}
          />
        </div>
    </div>
  );
};

export default RecurringExpenseForm;
