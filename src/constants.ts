
import { InvoiceData, ExpenseData } from './types';

export const DEFAULT_INVOICE_DATA: Omit<InvoiceData, 'id'> = {
  createdAt: new Date().toISOString(),
  creditorIban: 'CH4431999123000889012',
  creditorName: 'Max Muster AG',
  creditorStreet: 'Musterstrasse',
  creditorHouseNr: '123a',
  creditorZip: '8000',
  creditorCity: 'Zürich',
  creditorCountry: 'CH',

  debtorName: 'Peter Pinsel',
  debtorStreet: 'Beispielweg',
  debtorHouseNr: '42',
  debtorZip: '3000',
  debtorCity: 'Bern',
  debtorCountry: 'CH',
  
  total: 0,
  subtotal: 0,
  vatAmount: 0,
  vatEnabled: false,
  currency: 'CHF',
  reference: '',
  unstructuredMessage: '',
  projectName: '',
  items: [],
  status: 'open',
  paidAt: null,
  logoSrc: '',
};

export const DEFAULT_EXPENSE_DATA: Omit<ExpenseData, 'id'> = {
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    vendor: '',
    description: '',
    amount: '',
    currency: 'CHF',
    category: 'Software',
    status: 'due',
    paidAt: null,
};