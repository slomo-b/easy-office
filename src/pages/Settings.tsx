import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SettingsData } from '../types';
import { getSettings, saveSettings } from '../services/settingsService';
import { exportAllData, importAllData } from '../services/fileSystem';
import SettingsForm from '../components/SettingsForm';
import { Download, Upload } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


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
      
      if (!window.confirm("Bestehende Daten werden überschrieben. Sind Sie sicher, dass Sie die Daten importieren möchten?")) {
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

  if (!settings) {
    return <div className="text-center p-10">Lade Einstellungen...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Einstellungen</h2>
          <p className="text-default-500">Verwalte deine App-Einstellungen und Daten</p>
        </div>
        <div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:opacity-80 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>
       {message && (
          <div className={`${message.type === 'success' ? 'bg-success/20 border-success text-success' : 'bg-danger/20 border-danger text-danger'} px-4 py-3 rounded-lg relative mb-4 border`} role="alert">
            <span className="block sm:inline">{message.text}</span>
          </div>
        )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SettingsForm
                data={settings}
                onDataChange={handleDataChange}
                onLogoChange={handleLogoChange}
            />
          </div>
          <div className="bg-content1 p-6 rounded-lg shadow-md h-fit">
               <h3 className="text-lg font-semibold text-primary border-b border-divider pb-2 mb-4">Datenverwaltung</h3>
               <p className="text-sm text-default-500 mb-4">Erstellen Sie ein Backup all Ihrer Daten oder spielen Sie ein bestehendes Backup wieder ein.</p>
               <div className="space-y-3">
                   <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-80 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={16} />
                        {isExporting ? 'Exportiere...' : 'Daten exportieren (ZIP)'}
                    </button>
                    <button
                        onClick={handleImportClick}
                        disabled={isImporting}
                        className="w-full flex items-center justify-center gap-2 bg-content2 hover:bg-content3 text-foreground font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload size={16} />
                        {isImporting ? 'Importiere...' : 'Daten importieren (ZIP)'}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".zip"
                        className="hidden"
                    />
               </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;
