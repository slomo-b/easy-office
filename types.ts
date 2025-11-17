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
  amount: number | '';
  currency: 'CHF' | 'EUR';
  reference: string;
  unstructuredMessage: string;

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
