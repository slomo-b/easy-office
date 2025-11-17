import { CustomerData } from '../types';
import * as fileSystem from './fileSystem';

const CUSTOMERS_DIR = 'customers';

export const DEFAULT_CUSTOMER_DATA: Omit<CustomerData, 'id'> = {
  name: '',
  street: '',
  houseNr: '',
  zip: '',
  city: '',
  country: 'CH',
};

export const getCustomers = async (): Promise<CustomerData[]> => {
  try {
    const fileNames = await fileSystem.readDirectory(CUSTOMERS_DIR);
    const customers = await Promise.all(
      fileNames.map(fileName => fileSystem.readFile<CustomerData>(`${CUSTOMERS_DIR}/${fileName}`))
    );
    return customers.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error reading customers from file system', error);
    return [];
  }
};

export const getCustomerById = async (id: string): Promise<CustomerData | undefined> => {
  try {
    return await fileSystem.readFile<CustomerData>(`${CUSTOMERS_DIR}/${id}.json`);
  } catch (error) {
    console.error(`Error reading customer ${id} from file system`, error);
    return undefined;
  }
};

export const saveCustomer = async (customer: CustomerData): Promise<CustomerData> => {
   try {
    await fileSystem.writeFile(`${CUSTOMERS_DIR}/${customer.id}.json`, customer);
  } catch (error) {
    console.error('Error saving customer to file system', error);
    throw error;
  }
  return customer;
};

export const createNewCustomer = (): CustomerData => {
  return {
    id: `cust_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    ...DEFAULT_CUSTOMER_DATA,
  };
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    await fileSystem.deleteFile(`${CUSTOMERS_DIR}/${id}.json`);
  } catch (error) {
    console.error('Error deleting customer from file system', error);
    throw error;
  }
};