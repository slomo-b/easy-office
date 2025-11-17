import { InvoiceData, InvoiceItem, ProjectData, CustomerData, ServiceData, ExpenseData } from '../types';
import { DEFAULT_INVOICE_DATA, DEFAULT_HTML_TEMPLATE } from '../constants';
import * as fileSystem from './fileSystemService';
import { getSettings } from './settingsService';

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
   // Ensure total amount is correctly calculated before saving
   const totalAmount = invoice.items.reduce((sum, item) => {
       const quantity = Number(item.quantity) || 0;
       const price = Number(item.price) || 0;
       return sum + (quantity * price);
   }, 0);
   
   const invoiceToSave = { ...invoice, amount: totalAmount };

   try {
    await fileSystem.writeFile(`${INVOICES_DIR}/${invoiceToSave.id}.json`, invoiceToSave);
  } catch (error) {
    console.error('Error saving invoice to file system', error);
    throw error;
  }
  return invoiceToSave;
};

export const createNewInvoice = async (): Promise<InvoiceData> => {
  const settings = await getSettings();
  
  const creditorData = {
    creditorIban: settings.creditorIban,
    creditorName: settings.creditorName,
    creditorStreet: settings.creditorStreet,
    creditorHouseNr: settings.creditorHouseNr,
    creditorZip: settings.creditorZip,
    creditorCity: settings.creditorCity,
    creditorCountry: settings.creditorCountry,
    logoSrc: settings.logoSrc,
  };

  return {
    id: `inv_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    ...DEFAULT_INVOICE_DATA,
    ...creditorData,
    items: [],
    amount: 0,
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

export const createInvoiceFromProject = async (
    project: ProjectData, 
    customer: CustomerData, 
    services: ServiceData[], 
    expenses: ExpenseData[]
): Promise<InvoiceData> => {
    const newInvoice = await createNewInvoice();

    // Set customer as debtor
    newInvoice.debtorName = customer.name;
    newInvoice.debtorStreet = customer.street;
    newInvoice.debtorHouseNr = customer.houseNr;
    newInvoice.debtorZip = customer.zip;
    newInvoice.debtorCity = customer.city;
    newInvoice.debtorCountry = customer.country;
    
    // Set project name for display on invoice
    newInvoice.projectName = project.name;

    // Group task durations by service
    const timeItemsByService = new Map<string, { totalHours: number; taskTitles: string[] }>();

    project.tasks.forEach(task => {
        if (task.serviceId) {
            const taskTotalMilliseconds = task.timeLogs.reduce((sum, log) => {
                if (log.endTime) {
                    return sum + (new Date(log.endTime).getTime() - new Date(log.startTime).getTime());
                }
                return sum;
            }, 0);
            
            if (taskTotalMilliseconds > 0) {
                const taskTotalHours = taskTotalMilliseconds / (1000 * 60 * 60);
                const existing = timeItemsByService.get(task.serviceId) || { totalHours: 0, taskTitles: [] };
                
                existing.totalHours += taskTotalHours;
                existing.taskTitles.push(task.title);
                timeItemsByService.set(task.serviceId, existing);
            }
        }
    });

    const timeItems: InvoiceItem[] = Array.from(timeItemsByService.entries()).map(([serviceId, data]) => {
        const service = services.find(s => s.id === serviceId);
        // Using newline character for separation, relying on CSS white-space property for rendering.
        const description = `${service?.name || 'Unbekannte Leistung'}\n- ${data.taskTitles.join('\n- ')}`;
        
        return {
            description,
            quantity: Number(data.totalHours.toFixed(4)), // Use more precision for quantity
            unit: service?.unit || 'Stunde',
            price: Number(service?.price) || 0,
        };
    });

    // Create items from expenses
    const expenseItems: InvoiceItem[] = expenses.map(expense => {
        return {
            description: `Weiterverrechnung: ${expense.vendor} - ${expense.description}`,
            quantity: 1,
            unit: 'Pauschal',
            price: Number(expense.amount) || 0,
        };
    });

    newInvoice.items = [...timeItems, ...expenseItems];
    
    // Save (which also calculates total) and return the new invoice
    return saveInvoice(newInvoice);
};