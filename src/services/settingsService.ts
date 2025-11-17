import { SettingsData } from '../types';
import * as fileSystem from './fileSystem';

const SETTINGS_FILE = 'settings.json';

export const DEFAULT_SETTINGS_DATA: SettingsData = {
  creditorIban: 'CH4431999123000889012',
  creditorName: 'Max Muster AG',
  creditorStreet: 'Musterstrasse',
  creditorHouseNr: '123a',
  creditorZip: '8000',
  creditorCity: 'Zürich',
  creditorCountry: 'CH',
  logoSrc: '',
  isVatEnabled: false,
  vatRate: 8.1,
};

export const getSettings = async (): Promise<SettingsData> => {
  try {
    const settings = await fileSystem.readFile<SettingsData>(SETTINGS_FILE);
    // Backward compatibility: Add new fields if they don't exist
    return {
      ...DEFAULT_SETTINGS_DATA,
      ...settings,
    };
  } catch (error) {
    // If settings file doesn't exist, return default settings
    console.info('Settings file not found, using default settings.');
    return DEFAULT_SETTINGS_DATA;
  }
};

export const saveSettings = async (settings: SettingsData): Promise<void> => {
  try {
    await fileSystem.writeFile(SETTINGS_FILE, settings);
  } catch (error) {
    console.error('Error saving settings to file system', error);
    throw error;
  }
};
