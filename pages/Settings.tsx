import React, { useState, useEffect, useCallback } from 'react';
import { SettingsData } from '../types';
import { getSettings, saveSettings } from '../services/settingsService';
import SettingsForm from '../components/SettingsForm';

const Settings = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const currentSettings = await getSettings();
      setSettings(currentSettings);
    };
    loadSettings();
  }, []);

  const handleDataChange = (field: keyof SettingsData, value: string | number) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleLogoChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
         setSettings(prev => prev ? { ...prev, logoSrc: e.target?.result as string } : null);
      };
      reader.readAsDataURL(file);
    } else {
       setSettings(prev => prev ? { ...prev, logoSrc: '' } : null);
    }
  };

  const handleSave = async () => {
    if (settings) {
      setIsSaving(true);
      setSaveMessage('');
      await saveSettings(settings);
      setIsSaving(false);
      setSaveMessage('Einstellungen erfolgreich gespeichert!');
      setTimeout(() => setSaveMessage(''), 3000); // Hide message after 3 seconds
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
       {saveMessage && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <span className="block sm:inline">{saveMessage}</span>
          </div>
        )}
      <SettingsForm
        data={settings}
        onDataChange={handleDataChange}
        onLogoChange={handleLogoChange}
      />
    </div>
  );
};

export default Settings;
