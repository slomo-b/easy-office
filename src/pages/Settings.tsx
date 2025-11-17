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
        <h2 className="text-3xl font-bold text-white">Einstellungen</h2>
        <div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500"
          >
            {isSaving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>
       {message && (
          <div className={`${message.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-red-500/20 border-red-500 text-red-300'} px-4 py-3 rounded-lg relative mb-4`} role="alert">
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
          <div className="bg-gray-800 p-6 rounded-lg shadow-md h-fit">
               <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2 mb-4">Datenverwaltung</h3>
               <p className="text-sm text-gray-400 mb-4">Erstellen Sie ein Backup all Ihrer Daten oder spielen Sie ein bestehendes Backup wieder ein.</p>
               <div className="space-y-3">
                   <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500"
                    >
                        <Download size={16} />
                        {isExporting ? 'Exportiere...' : 'Daten exportieren (ZIP)'}
                    </button>
                    <button
                        onClick={handleImportClick}
                        disabled={isImporting}
                        className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500"
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
