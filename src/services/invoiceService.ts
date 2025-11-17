

import { InvoiceData, InvoiceItem, ProjectData, CustomerData, ServiceData, ExpenseData, SettingsData } from '../types';
import { DEFAULT_INVOICE_DATA, DEFAULT_HTML_TEMPLATE } from '../constants';
import * as fileSystem from './fileSystem';

const INVOICES_DIR = 'invoices';

export const calculateInvoiceTotals = (items: InvoiceItem[], vatEnabled: boolean): { subtotal: number, vatAmount: number, total: number } => {
    let subtotal = 0;
    let vatAmount = 0;

    for (const item of items) {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const itemTotal = quantity * price;
        subtotal += itemTotal;
        
        if (vatEnabled) {
            const rate = Number(item.vatRate) || 0;
            vatAmount += itemTotal * (rate / 100);
        }
    }
    
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
}

export const getInvoices = async (): Promise<InvoiceData[]> => {
  try {
    const fileNames = await fileSystem.readDirectory(INVOICES_DIR);
    const invoices = await Promise.all(
      fileNames.map(async (fileName) => {
        const invoice = await fileSystem.readFile<InvoiceData>(`${INVOICES_DIR}/${fileName}`);
        // Ensure backward compatibility for invoices without a template
        if (!invoice.htmlTemplate) {
          invoice.htmlTemplate = DEFAULT_HTML_TEMPLATE;
        }
        return invoice;
      })
    );
    // Fallback for sorting older invoices without createdAt
    return invoices.sort((a, b) => (b.createdAt || b.id.split('_')[1] || '').localeCompare(a.createdAt || a.id.split('_')[1] || ''));
  } catch (error) {
    console.error('Error reading invoices from file system', error);
    return [];
  }
};

export const getInvoiceById = async (id: string): Promise<InvoiceData | undefined> => {
  try {
    const invoice = await fileSystem.readFile<InvoiceData>(`${INVOICES_DIR}/${id}.json`);
    // Ensure backward compatibility for invoices without a template
    if (invoice && !invoice.htmlTemplate) {
        invoice.htmlTemplate = DEFAULT_HTML_TEMPLATE;
    }
    return invoice;
  } catch (error) {
    console.error(`Error reading invoice ${id} from file system`, error);
    return undefined;
  }
};

export const saveInvoice = async (invoice: InvoiceData): Promise<InvoiceData> => {
   // Ensure totals are correctly calculated before saving
   const { subtotal, vatAmount, total } = calculateInvoiceTotals(invoice.items, invoice.vatEnabled);
   
   const invoiceToSave: InvoiceData = { 
       ...invoice, 
       subtotal,
       vatAmount,
       total 
    };

   try {
    await fileSystem.writeFile(`${INVOICES_DIR}/${invoiceToSave.id}.json`, invoiceToSave);
  } catch (error) {
    console.error('Error saving invoice to file system', error);
    throw error;
  }
  return invoiceToSave;
};

export const createNewInvoice = async (settings: SettingsData): Promise<InvoiceData> => {
  // Generate sequential invoice number
  const allInvoices = await getInvoices();
  const currentYear = new Date().getFullYear();
  
  const yearInvoices = allInvoices.filter(inv => {
      const yearFromMsg = parseInt(inv.unstructuredMessage.split('-')[0], 10);
      return yearFromMsg === currentYear;
  });

  const lastInvoiceNumberInYear = yearInvoices.reduce((max, inv) => {
      const numberPart = parseInt(inv.unstructuredMessage.split('-')[1], 10);
      return isNaN(numberPart) ? max : Math.max(max, numberPart);
  }, 0);

  const newInvoiceSequentialNumber = lastInvoiceNumberInYear + 1;
  const newInvoiceNumber = `${currentYear}-${newInvoiceSequentialNumber.toString().padStart(4, '0')}`;
  
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

  const newItems: InvoiceItem[] = [{
      description: '',
      quantity: 1,
      unit: 'Stunden',
      price: '',
      vatRate: settings.isVatEnabled ? settings.vatRate : ''
  }];

  const { subtotal, vatAmount, total } = calculateInvoiceTotals(newItems, settings.isVatEnabled);

  return {
    id: `inv_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    ...DEFAULT_INVOICE_DATA,
    ...creditorData,
    createdAt: new Date().toISOString(),
    unstructuredMessage: newInvoiceNumber,
    reference: newInvoiceNumber,
    items: newItems,
    vatEnabled: settings.isVatEnabled,
    subtotal,
    vatAmount,
    total,
    htmlTemplate: DEFAULT_HTML_TEMPLATE,
    status: 'open',
    paidAt: null,
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
    expenses: ExpenseData[],
    settings: SettingsData
): Promise<InvoiceData> => {
    const newInvoice = await createNewInvoice(settings);

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
        const description = `${service?.name || 'Unbekannte Leistung'}\n- ${data.taskTitles.join('\n- ')}`;
        
        return {
            description,
            quantity: Number(data.totalHours.toFixed(4)),
            unit: service?.unit || 'Stunden',
            price: Number(service?.price) || 0,
            vatRate: newInvoice.vatEnabled ? (service?.vatRate || settings.vatRate) : '',
        };
    });

    // Create items from expenses
    const expenseItems: InvoiceItem[] = expenses.map(expense => {
        return {
            description: `Weiterverrechnung: ${expense.vendor} - ${expense.description}`,
            quantity: 1,
            unit: 'Pauschal',
            price: Number(expense.amount) || 0,
            vatRate: newInvoice.vatEnabled ? settings.vatRate : '', // Apply default VAT rate to pass-through expenses
        };
    });

    newInvoice.items = [...timeItems, ...expenseItems];
    
    // Manually calculate totals before saving to ensure QR code generation works.
    const { subtotal, vatAmount, total } = calculateInvoiceTotals(newInvoice.items, newInvoice.vatEnabled);
    newInvoice.subtotal = subtotal;
    newInvoice.vatAmount = vatAmount;
    newInvoice.total = total;

    // Save (which also calculates total) and return the new invoice
    return saveInvoice(newInvoice);
};