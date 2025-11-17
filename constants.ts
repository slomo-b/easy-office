import { InvoiceData, ExpenseData } from './types';

export const DEFAULT_HTML_TEMPLATE = `
<div id="print-area" class="bg-white text-black font-sans p-8" style="font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.4;">
    <!-- Recipient and Logo Section -->
    <div class="grid grid-cols-2 gap-8 mb-16">
        <div>
            <!-- Your Logo Placeholder -->
            {{logoImage}}
        </div>
        <div class="text-sm">
            <p>{{creditorName}}</p>
            <p>{{creditorStreet}} {{creditorHouseNr}}</p>
            <p>{{creditorZip}} {{creditorCity}}</p>
            <br/>
            <p><strong>{{debtorName}}</strong></p>
            <p>{{debtorStreet}} {{debtorHouseNr}}</p>
            <p>{{debtorZip}} {{debtorCity}}</p>
        </div>
    </div>

    <!-- Invoice Details -->
    <div class="mb-16">
        <h1 class="text-3xl font-bold mb-2">Rechnung</h1>
        <p class="text-sm">{{unstructuredMessage}}</p>
        <p class="text-sm">Datum: ${new Date().toLocaleDateString('de-CH')}</p>
    </div>

    <!-- Invoice Table (Example) -->
    <table class="w-full text-sm mb-16 border-collapse">
        <thead>
            <tr class="border-b-2 border-black">
                <th class="text-left font-bold p-2">Position</th>
                <th class="text-right font-bold p-2">Betrag</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="p-2">Dienstleistung gemäss Offerte</td>
                <td class="text-right p-2">{{currency}} {{amount}}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr class="border-t-2 border-black font-bold">
                <td class="text-left p-2">Total</td>
                <td class="text-right p-2">{{currency}} {{amount}}</td>
            </tr>
        </tfoot>
    </table>

    <hr class="border-dashed border-gray-400 my-8 -ml-8 -mr-8"/>

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
  unstructuredMessage: 'Rechnung Nr. 12345',
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