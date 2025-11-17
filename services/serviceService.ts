
import { ServiceData } from '../types';
import * as fileSystem from './fileSystem';

const SERVICES_DIR = 'services';

export const DEFAULT_SERVICE_DATA: Omit<ServiceData, 'id'> = {
  name: '',
  description: '',
  unit: 'Stunden',
  price: '',
  vatRate: '',
};

export const getServices = async (): Promise<ServiceData[]> => {
  try {
    const fileNames = await fileSystem.readDirectory(SERVICES_DIR);
    const services = await Promise.all(
      fileNames.map(fileName => fileSystem.readFile<ServiceData>(`${SERVICES_DIR}/${fileName}`))
    );
    return services.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error reading services from file system', error);
    return [];
  }
};

export const getServiceById = async (id: string): Promise<ServiceData | undefined> => {
  try {
    return await fileSystem.readFile<ServiceData>(`${SERVICES_DIR}/${id}.json`);
  } catch (error) {
    console.error(`Error reading service ${id} from file system`, error);
    return undefined;
  }
};

export const saveService = async (service: ServiceData): Promise<ServiceData> => {
   try {
    await fileSystem.writeFile(`${SERVICES_DIR}/${service.id}.json`, service);
  } catch (error) {
    console.error('Error saving service to file system', error);
    throw error;
  }
  return service;
};

export const createNewService = (): ServiceData => {
  return {
    id: `serv_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    ...DEFAULT_SERVICE_DATA,
  };
};

export const deleteService = async (id: string): Promise<void> => {
  try {
    await fileSystem.deleteFile(`${SERVICES_DIR}/${id}.json`);
  } catch (error) {
    console.error('Error deleting service from file system', error);
    throw error;
  }
};