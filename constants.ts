
import { InvoiceData, ExpenseData } from './types';

export const DEFAULT_HTML_TEMPLATE = `
<div id="print-area" class="bg-white text-gray-800 p-12" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 10pt; line-height: 1.6;">
    <!-- Header -->
    <header class="flex justify-between items-start mb-16">
        <div class="w-1/2">
            {{logoImage}}
        </div>
        <div class="w-1/2 text-right text-sm">
            <p class="font-bold text-base text-gray-900">{{creditorName}}</p>
            <p>{{creditorStreet}} {{creditorHouseNr}}</p>
            <p>{{creditorZip}} {{creditorCity}}</p>
        </div>
    </header>

    <!-- Recipient & Meta -->
    <section class="flex justify-between mb-12">
        <div class="w-2/3">
             <p class="text-xs text-gray-500 mb-1">Zahlungspflichtig</p>
            <p class="font-bold text-gray-900">{{debtorName}}</p>
            <p>{{debtorStreet}} {{debtorHouseNr}}</p>
            <p>{{debtorZip}} {{debtorCity}}</p>
        </div>
        <div class="w-1/3 text-right">
            <h1 class="text-3xl font-bold text-emerald-600 mb-2 tracking-tight">RECHNUNG</h1>
            <p><span class="font-semibold text-gray-600">Datum:</span> ${new Date().toLocaleDateString('de-CH')}</p>
            <p><span class="font-semibold text-gray-600">Rechnungs-Nr:</span> {{unstructuredMessage}}</p>
            {{projectLine}}
        </div>
    </section>

    <!-- Items Table -->
    <section class="mb-12">
        <table class="w-full text-sm">
            <thead class="bg-gray-800 text-white">
                <tr>
                    <th class="text-left font-semibold py-2 px-4 w-3/5 rounded-l-md">Beschreibung</th>
                    <th class="text-right font-semibold py-2 px-4">Menge</th>
                    <th class="text-right font-semibold py-2 px-4">Preis</th>
                    <th class="text-right font-semibold py-2 px-4 rounded-r-md">Total</th>
                </tr>
            </thead>
            <tbody>
                {{invoiceItems}}
            </tbody>
        </table>
    </section>
    
    <!-- Totals -->
    <section class="flex justify-end mb-16">
        <div class="w-2/5">
            <div class="bg-gray-100 p-4 rounded-lg">
                 {{totalsBlock}}
            </div>
        </div>
    </section>
    
    <!-- Footer -->
    <footer class="text-center text-xs text-gray-500 border-t pt-4">
        <p>Vielen Dank für Ihren Auftrag. Bitte begleichen Sie den Betrag innert 30 Tagen.</p>
        <p>{{creditorName}} - {{creditorIban}}</p>
    </footer>

    <!-- QR Bill Section -->
    <div class="border-t-2 border-dashed border-gray-400 my-8 -ml-12 -mr-12"></div>
    
    {{qrBillSvg}}
</div>
`;

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
  htmlTemplate: DEFAULT_HTML_TEMPLATE,
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