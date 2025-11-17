export interface InvoiceItem {
  description: string;
  quantity: number | '';
  unit: string;
  price: number | '';
}

export interface InvoiceData {
  id: string;
  // Creditor
  creditorIban: string;
  creditorName: string;
  creditorStreet: string;
  creditorHouseNr: string;
  creditorZip: string;
  creditorCity: string;
  creditorCountry: string;

  // Debtor
  debtorName: string;
  debtorStreet: string;
  debtorHouseNr: string;
  debtorZip: string;
  debtorCity: string;
  debtorCountry: string;

  // Payment
  amount: number | ''; // Will be the calculated total
  currency: 'CHF' | 'EUR';
  reference: string;
  unstructuredMessage: string;
  items: InvoiceItem[];

  // Customization
  htmlTemplate: string;
  logoSrc: string;
}

export interface ExpenseData {
  id: string;
  date: string; // YYYY-MM-DD
  vendor: string;
  description: string;
  amount: number | '';
  currency: 'CHF' | 'EUR';
  category: string;
  projectId?: string; // Optional link to a Project
}

export interface RecurringExpenseData {
  id: string;
  vendor: string;
  description: string;
  amount: number | '';
  currency: 'CHF' | 'EUR';
  category: string;
  interval: 'monthly' | 'quarterly' | 'yearly';
  startDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
}

export interface SettingsData {
  // Creditor / Company Details
  creditorIban: string;
  creditorName: string;
  creditorStreet: string;
  creditorHouseNr: string;
  creditorZip: string;
  creditorCity: string;
  creditorCountry: string;

  // Customization
  logoSrc: string;
}

export interface CustomerData {
  id: string;
  name: string;
  street: string;
  houseNr: string;
  zip: string;
  city: string;
  country: string;
}

// New Type for Services/Cost Centers
export interface ServiceData {
  id: string;
  name: string;
  description: string;
  unit: 'Stunde' | 'Tag' | 'Pauschal';
  price: number | '';
}

// New Type for individual Time Entries
export interface TimeEntryData {
    id: string;
    serviceId: string; // Links to a ServiceData
    description: string;
    date: string; // YYYY-MM-DD
    duration: number | ''; // in hours, e.g., 1.5 for 1h 30m
}

// New Type for Projects
export interface ProjectData {
  id: string;
  name: string;
  description: string;
  customerId: string; 
  status: 'open' | 'in-progress' | 'done';
  timeEntries: TimeEntryData[];
  createdAt: string; // ISO String
}