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
  projectName?: string; // Optional project name
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

// New Types for Task Management
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface TaskTimeLog {
  startTime: string; // ISO String
  endTime: string | null; // ISO String or null if timer is running
}

export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  serviceId: string; // Links to a ServiceData
  timeLogs: TaskTimeLog[];
}

// Updated Type for Projects
export interface ProjectData {
  id: string;
  name: string;
  description: string;
  customerId: string; 
  status: 'open' | 'in-progress' | 'done';
  tasks: TaskData[];
  createdAt: string; // ISO String
}

// New Interface for abstracting file system operations
export interface IFileSystemService {
  initialize: () => Promise<void>;
  writeFile: (path: string, content: object) => Promise<void>;
  readFile: <T>(path: string) => Promise<T>;
  readDirectory: (path: string) => Promise<string[]>;
  deleteFile: (path: string) => Promise<void>;
  isSupported: () => boolean;
  exportAllData: () => Promise<void>;
  importAllData: (file: File) => Promise<void>;
}
