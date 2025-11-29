import React from 'react';
import { SettingsData } from '../types';
import { Input, Card, CardBody, Switch } from '@heroui/react';
import { Building2, Receipt } from 'lucide-react';

interface SettingsFormProps {
  data: SettingsData;
  onDataChange: (field: keyof SettingsData, value: string | number | boolean) => void;
  onLogoChange: (file: File | null) => void;
}

const FormSection: React.FC<{
  title: string;
  icon?: 'Building2' | 'Receipt';
  children: React.ReactNode
}> = ({ title, icon, children }) => (
  <Card className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl shadow-2xl border border-[#1E2A36]">
    <CardBody className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
          {icon === 'Building2' && <Building2 className="h-5 w-5 text-[#00E5FF]" />}
          {icon === 'Receipt' && <Receipt className="h-5 w-5 text-[#00E5FF]" />}
          {!icon && <div className="w-5 h-5 bg-[#00E5FF] rounded-full"></div>}
        </div>
        <h3 className="text-xl font-bold text-[#E2E8F0]">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </CardBody>
  </Card>
);

const SettingsForm: React.FC<SettingsFormProps> = ({ data, onDataChange, onLogoChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    if (type === 'checkbox') {
        onDataChange(name as keyof SettingsData, target.checked);
    } else {
        onDataChange(name as keyof SettingsData, type === 'number' ? parseFloat(value) || 0 : value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLogoChange(e.target.files?.[0] || null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <FormSection title="Standard Zahlungsempfänger (Ihre Firma)" icon="Building2">
        <Input
          label="IBAN"
          value={data.creditorIban}
          onChange={(e) => onDataChange('creditorIban', e.target.value)}
          className="col-span-2"
          placeholder="Gebe IBAN ein"
          classNames={{
            label: "text-[#94A3B8] font-semibold mb-2 text-sm",
            inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
            input: "text-[#E2E8F0] placeholder-[#64748B]",
          }}
        />

        <Input
          label="Name"
          value={data.creditorName}
          onChange={(e) => onDataChange('creditorName', e.target.value)}
          className="col-span-2"
          placeholder="Gebe Firmenname ein"
          classNames={{
            label: "text-[#94A3B8] font-semibold mb-2 text-sm",
            inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
            input: "text-[#E2E8F0] placeholder-[#64748B]",
          }}
        />

        <Input
          label="Straße"
          value={data.creditorStreet}
          onChange={(e) => onDataChange('creditorStreet', e.target.value)}
          placeholder="Gebe Straße ein"
          classNames={{
            label: "text-[#94A3B8] font-semibold mb-2 text-sm",
            inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
            input: "text-[#E2E8F0] placeholder-[#64748B]",
          }}
        />

        <Input
          label="Nr."
          value={data.creditorHouseNr}
          onChange={(e) => onDataChange('creditorHouseNr', e.target.value)}
          placeholder="Gebe Nr. ein"
          classNames={{
            label: "text-[#94A3B8] font-semibold mb-2 text-sm",
            inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
            input: "text-[#E2E8F0] placeholder-[#64748B]",
          }}
        />

        <Input
          label="PLZ"
          value={data.creditorZip}
          onChange={(e) => onDataChange('creditorZip', e.target.value)}
          placeholder="Gebe PLZ ein"
          classNames={{
            label: "text-[#94A3B8] font-semibold mb-2 text-sm",
            inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
            input: "text-[#E2E8F0] placeholder-[#64748B]",
          }}
        />

        <Input
          label="Ort"
          value={data.creditorCity}
          onChange={(e) => onDataChange('creditorCity', e.target.value)}
          placeholder="Gebe Ort ein"
          classNames={{
            label: "text-[#94A3B8] font-semibold mb-2 text-sm",
            inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
            input: "text-[#E2E8F0] placeholder-[#64748B]",
          }}
        />

        <Input
          label="Land"
          value={data.creditorCountry}
          onChange={(e) => onDataChange('creditorCountry', e.target.value)}
          className="col-span-2"
          placeholder="Gebe Land ein"
          classNames={{
            label: "text-[#94A3B8] font-semibold mb-2 text-sm",
            inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
            input: "text-[#E2E8F0] placeholder-[#64748B]",
          }}
        />
      </FormSection>

      <FormSection title="Rechnungs-Einstellungen" icon="Receipt">
        <div className="col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <Switch
              isSelected={data.isVatEnabled}
              onValueChange={(value) => onDataChange('isVatEnabled', value)}
              size="lg"
              color="primary"
              classNames={{
                thumb: "bg-[#00E5FF] group-data-[selected=true]:bg-[#34F0B1]"
              }}
            />
            <div>
              <p className="text-[#E2E8F0] font-medium">Mehrwertsteuer (MwSt.) aktivieren</p>
              <p className="text-[#94A3B8] text-sm">MwSt. standardmäßig auf neuen Rechnungen aktivieren</p>
            </div>
          </div>

          {data.isVatEnabled && (
            <div className="max-w-xs">
              <Input
                label="Standard MwSt.-Satz (%)"
                type="number"
                value={data.vatRate.toString()}
                onChange={(e) => onDataChange('vatRate', parseFloat(e.target.value) || 0)}
                step="0.01"
                placeholder="Gebe MwSt.-Satz ein"
                classNames={{
                  label: "text-[#94A3B8] font-semibold mb-2 text-sm",
                  inputWrapper: "bg-[#16232B] border border-[#64748B]/30 focus-within:border-[#00E5FF]/70",
                  input: "text-[#E2E8F0] placeholder-[#64748B]",
                }}
              />
            </div>
          )}
        </div>
      </FormSection>

      <Card className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl shadow-2xl border border-[#1E2A36]">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
              <div className="w-4 h-4 bg-[#00E5FF] rounded-full"></div>
            </div>
            <h3 className="text-xl font-bold text-[#E2E8F0]">Firmenlogo</h3>
          </div>

          <p className="text-[#94A3B8] text-sm mb-6">
            Dieses Logo wird standardmässig auf neuen Rechnungen verwendet.
          </p>

          <div className="flex items-center gap-4">
            {data.logoSrc && (
              <div className="p-3 bg-white/10 rounded-lg border border-[#64748B]/30">
                <img src={data.logoSrc} alt="Firmenlogo Vorschau" className="h-12 w-auto rounded" />
              </div>
            )}

            <div className="flex-1">
              <input
                type="file"
                id="logo"
                accept="image/png, image/jpeg, image/svg+xml"
                onChange={handleFileChange}
                className="block w-full text-sm text-[#94A3B8] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#00E5FF] file:to-[#34F0B1] file:text-white hover:file:opacity-80"
              />
            </div>

            {data.logoSrc && (
              <button
                type="button"
                onClick={() => onDataChange('logoSrc', '')}
                className="px-4 py-2 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Löschen
              </button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SettingsForm;
