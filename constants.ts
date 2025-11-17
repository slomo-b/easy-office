import { InvoiceData, ExpenseData } from './types';

export const DEFAULT_HTML_TEMPLATE = `
<div id="print-area" class="bg-white text-black p-10" style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5;">
    <!-- Header: Logo and Sender Address -->
    <header class="flex justify-between items-start mb-16">
        <div class="w-1/2">
            {{logoImage}}
        </div>
        <div class="w-1/2 text-right text-xs">
            <p class="font-bold text-base">{{creditorName}}</p>
            <p>{{creditorStreet}} {{creditorHouseNr}}</p>
            <p>{{creditorZip}} {{creditorCity}}</p>
        </div>
    </header>

    <!-- Recipient Address and Invoice Meta -->
    <section class="flex justify-between mb-12">
        <div class="w-2/3">
             <p class="text-xs text-gray-500">Zahlungspflichtig:</p>
            <p class="font-bold">{{debtorName}}</p>
            <p>{{debtorStreet}} {{debtorHouseNr}}</p>
            <p>{{debtorZip}} {{debtorCity}}</p>
        </div>
        <div class="w-1/3 text-right">
            <h1 class="text-3xl font-bold mb-2">RECHNUNG</h1>
            <p class="text-sm"><span class="font-semibold">Datum:</span> ${new Date().toLocaleDateString('de-CH')}</p>
            <p class="text-sm"><span class="font-semibold">Rechnungs-Nr:</span> {{unstructuredMessage}}</p>
        </div>
    </section>

    <!-- Invoice Items Table -->
    <section class="mb-12">
        <table class="w-full text-sm">
            <thead class="border-b-2 border-black">
                <tr>
                    <th class="text-left font-bold py-2 px-1">Beschreibung</th>
                    <th class="text-right font-bold py-2 px-1">Betrag</th>
                </tr>
            </thead>
            <tbody>
                <tr class="border-b border-gray-200">
                    <td class="py-3 px-1">Pauschale gemäss Vereinbarung</td>
                    <td class="text-right py-3 px-1">{{currency}} {{amount}}</td>
                </tr>
            </tbody>
        </table>
    </section>
    
    <!-- Totals -->
    <section class="flex justify-end mb-16">
        <div class="w-1/3">
            <div class="flex justify-between py-2 border-t-2 border-black">
                <span class="font-bold">Total</span>
                <span class="font-bold">{{currency}} {{amount}}</span>
            </div>
        </div>
    </section>

    <hr class="border-dashed border-gray-400 my-8 -ml-10 -mr-10"/>

    <!-- Swiss QR Bill Section -->
    <div class="grid grid-cols-3 gap-4">
        <div class="col-span-1">
            <h2 class="font-bold mb-2">Zahlteil</h2>
            {{qrCodeImage}}
        </div>
        <div class="col-span-2 text-sm pl-4">
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                    <p class="font-bold">Konto / Zahlbar an</p>
                    <p>{{creditorIban}}</p>
                    <p>{{creditorName}}</p>
                    <p>{{creditorStreet}} {{creditorHouseNr}}</p>
                    <p>{{creditorZip}} {{creditorCity}}</p>
                </div>
                <div>
                    <p class="font-bold">Referenz</p>
                    <p>{{reference}}</p>
                </div>
                <div>
                    <p class="font-bold">Zahlbar durch</p>
                    <p>{{debtorName}}</p>
                    <p>{{debtorStreet}} {{debtorHouseNr}}</p>
                    <p>{{debtorZip}} {{debtorCity}}</p>
                </div>
                <div>
                    <p class="font-bold">Währung</p>
                    <p>{{currency}}</p>
                    <p class="font-bold mt-2">Betrag</p>
                    <p>{{amount}}</p>
                </div>
            </div>
        </div>
    </div>
</div>
`;

export const DEFAULT_INVOICE_DATA: Omit<InvoiceData, 'id'> = {
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
  
  amount: 199.95,
  currency: 'CHF',
  reference: '210000000003139471430009017',
  unstructuredMessage: '2024-001',
  logoSrc: '',
  htmlTemplate: DEFAULT_HTML_TEMPLATE,
};

export const DEFAULT_EXPENSE_DATA: Omit<ExpenseData, 'id'> = {
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    vendor: '',
    description: '',
    amount: '',
    currency: 'CHF',
    category: 'Software'
};