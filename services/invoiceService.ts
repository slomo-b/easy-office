import { InvoiceData } from '../types';
import { DEFAULT_INVOICE_DATA, DEFAULT_HTML_TEMPLATE } from '../constants';
import * as fileSystem from './fileSystemService';

const INVOICES_DIR = 'invoices';

export const getInvoices = async (): Promise<InvoiceData[]> => {
  try {
    const fileNames = await fileSystem.readDirectory(INVOICES_DIR);
    const invoices = await Promise.all(
      fileNames.map(fileName => fileSystem.readFile<InvoiceData>(`${INVOICES_DIR}/${fileName}`))
    );
    return invoices.sort((a, b) => b.id.localeCompare(a.id));
  } catch (error) {
    console.error('Error reading invoices from file system', error);
    return [];
  }
};

export const getInvoiceById = async (id: string): Promise<InvoiceData | undefined> => {
  try {
    return await fileSystem.readFile<InvoiceData>(`${INVOICES_DIR}/${id}.json`);
  } catch (error) {
    console.error(`Error reading invoice ${id} from file system`, error);
    return undefined;
  }
};

export const saveInvoice = async (invoice: InvoiceData): Promise<InvoiceData> => {
   try {
    await fileSystem.writeFile(`${INVOICES_DIR}/${invoice.id}.json`, invoice);
  } catch (error) {
    console.error('Error saving invoice to file system', error);
    throw error;
  }
  return invoice;
};

export const createNewInvoice = (): InvoiceData => {
  return {
    id: `inv_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    ...DEFAULT_INVOICE_DATA,
    htmlTemplate: DEFAULT_HTML_TEMPLATE,
  };
};

export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    await fileSystem.deleteFile(`${INVOICES_DIR}/${id}.json`);
  } catch (error) {
    console.error('Error deleting invoice from file system', error);
    throw error;
  }
};