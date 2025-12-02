import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SettingsData } from '../types';
import { getSettings, saveSettings } from '../services/settingsService';
import { exportAllData, importAllData } from '../services/fileSystem';
import { seedMockData } from '../utils/seedData';
import SettingsForm from '../components/SettingsForm';
import { Download, Upload, Settings as SettingsIcon, Database, Save } from 'lucide-react';
import { Button, Card, CardBody, Alert } from '@heroui/react';
import { useConfirm } from '../context/ConfirmContext';
import PageHeader from '../components/PageHeader';

const Settings = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm } = useConfirm();


  useEffect(() => {
    const loadSettings = async () => {
      const currentSettings = await getSettings();
      setSettings(currentSettings);
    };
    loadSettings();
  }, []);
  
  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null), 4000);
  };

  const handleDataChange = (field: keyof SettingsData, value: string | number | boolean) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleLogoChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
         setSettings(prev => prev ? { ...prev, logoSrc: e.target?.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (settings) {
      setIsSaving(true);
      await saveSettings(settings);
      setIsSaving(false);
      showMessage('Einstellungen erfolgreich gespeichert!');
    }
  };
  
  const handleExport = async () => {
      setIsExporting(true);
      try {
          await exportAllData();
          showMessage('Daten erfolgreich exportiert.');
      } catch (error) {
          console.error("Export failed:", error);
          showMessage('Daten-Export fehlgeschlagen.', 'error');
      } finally {
          setIsExporting(false);
      }
  };
  
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };
  
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      if (!await confirm({
          title: "Daten importieren",
          message: "Bestehende Daten werden überschrieben. Sind Sie sicher, dass Sie die Daten importieren möchten?",
          confirmText: "Importieren",
          type: "warning"
      })) {
          // Reset file input
          event.target.value = '';
          return;
      }

      setIsImporting(true);
      try {
          await importAllData(file);
          showMessage('Daten erfolgreich importiert. Die Seite wird neu geladen, um die Änderungen zu übernehmen.');
          setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
          console.error("Import failed:", error);
          showMessage('Daten-Import fehlgeschlagen. Stellen Sie sicher, dass es eine gültige ZIP-Datei ist.', 'error');
      } finally {
          setIsImporting(false);
          // Reset file input
          event.target.value = '';
      }
  };

  const handleSeed = async () => {
      if (await confirm({
          title: "Demo-Daten generieren",
          message: "Möchten Sie Demo-Daten generieren? Dies fügt Beispiel-Kunden, Rechnungen und Projekte hinzu.",
          confirmText: "Generieren",
          type: "info"
      })) {
          setIsSeeding(true);
          try {
              await seedMockData();
              showMessage('Demo-Daten erfolgreich generiert. Seite wird neu geladen.');
              setTimeout(() => window.location.reload(), 1500);
          } catch (error) {
              console.error("Seed failed:", error);
              showMessage('Fehler beim Generieren der Daten.', 'error');
          } finally {
              setIsSeeding(false);
          }
      }
  };

  if (!settings) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1E2A36] rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-10 w-64 bg-[#16232B] rounded-xl animate-pulse" />
              <div className="h-5 w-72 bg-[#64748B]/30 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-[#16232B] rounded-2xl animate-pulse" />
            <div className="h-80 bg-[#16232B] rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Einstellungen"
        icon={<SettingsIcon className="h-6 w-6" />}
        actions={
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium"
            startContent={!isSaving && <Save size={18} />}
          >
            {!isSaving && "Speichern"}
          </Button>
        }
      />

      {message && (
        <Alert
          color={message.type === 'success' ? 'success' : 'danger'}
          variant="flat"
          classNames={{
            base: "mb-6 border-2 backdrop-blur-xl shadow-xl",
            title: "font-semibold",
            description: "text-sm"
          }}
          title={message.text}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <SettingsForm
              data={settings}
              onDataChange={handleDataChange}
              onLogoChange={handleLogoChange}
            />
        </div>

        <Card className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl shadow-2xl border border-[#1E2A36] h-fit">
          <CardBody className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                <Download className="h-5 w-5 text-[#00E5FF]" />
              </div>
              <h3 className="text-2xl font-bold text-[#E2E8F0]">Datenverwaltung</h3>
            </div>

            <div className="h-px bg-gradient-to-r from-[#00E5FF]/30 to-transparent mb-6" />

            <p className="text-[#94A3B8] text-sm mb-6">
              Erstelle ein Backup all deiner Daten oder importiere ein bestehendes Backup.
            </p>

            <div className="space-y-4">
              <Button
                onClick={handleExport}
                isLoading={isExporting}
                variant="solid"
                className="w-full bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] border-2 border-[#00E5FF]/20 shadow-lg text-white hover:shadow-xl"
                size="lg"
                startContent={!isExporting && <Download className="h-5 w-5" />}
              >
                {!isExporting && "Daten exportieren (ZIP)"}
              </Button>

              <Button
                onClick={handleImportClick}
                isLoading={isImporting}
                variant="bordered"
                className="w-full border-2 border-[#64748B]/30 hover:border-[#00E5FF]/40 text-[#E2E8F0] hover:bg-[#00E5FF]/10 hover:text-[#E2E8F0]"
                size="lg"
                startContent={!isImporting && <Upload className="h-5 w-5" />}
              >
                {!isImporting && "Daten importieren (ZIP)"}
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".zip"
                className="hidden"
              />

              <div className="h-px bg-gradient-to-r from-[#00E5FF]/30 to-transparent my-6" />
              
              <Button
                  onClick={handleSeed}
                  isLoading={isSeeding}
                  variant="flat"
                  className="w-full bg-[#1E2A36] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#2A3C4D] hover:border-[#00E5FF]/40"
                  size="lg"
                  startContent={!isSeeding && <Database className="h-5 w-5" />}
              >
                  {!isSeeding && "Demo-Daten generieren"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
