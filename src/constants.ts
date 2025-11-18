

import { InvoiceData, ExpenseData } from './types';

export const DEFAULT_HTML_TEMPLATE = `
<div id="print-area" class="bg-white text-gray-800" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 10pt; line-height: 1.6; width: 210mm; min-height: 297mm; margin: auto; display: flex; flex-direction: column;">

    <!-- Main content area. flex-grow allows it to expand and push the QR bill to the bottom of the page. -->
    <div style="flex-grow: 1;">
        <!-- Main invoice content with padding -->
        <div class="p-12">
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
                    <p><span class="font-semibold text-gray-600">Datum:</span> {{date}}</p>
                    <p><span class="font-semibold text-gray-600">Rechnungs-Nr:</span> {{unstructuredMessage}}</p>
                    {{projectLine}}
                </div>
            </section>

            <!-- Items Table -->
            <section class="mb-12">
                <div class="rounded-md overflow-hidden border border-gray-200">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-800 text-white">
                            <tr>
                                <th class="text-left font-semibold py-2 px-4 w-3/5">Beschreibung</th>
                                <th class="text-right font-semibold py-2 px-4">Menge</th>
                                <th class="text-right font-semibold py-2 px-4">Preis</th>
                                <th class="text-right font-semibold py-2 px-4">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {{invoiceItems}}
                        </tbody>
                    </table>
                </div>
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
        </div>
    </div>


    <!-- QR Bill Section - Rebuilt with HTML elements for better control -->
    <div style="width: 210mm; height: 105mm; page-break-inside: avoid; flex-shrink: 0; display: flex; font-family: 'Helvetica', Arial, sans-serif; color: #000;">
        
        <!-- Scissors line top -->
        <div style="position: absolute; top: 0; left: 5mm; right: 5mm; height: 0.5mm; border-top: 1px dashed #000;"></div>
        
        <!-- Left Part (Receipt) -->
        <div style="width: 62mm; padding: 5mm; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <h2 style="font-size: 11pt; font-weight: bold; margin-bottom: 2mm;">Empfangsschein</h2>
                <div style="font-size: 8pt; line-height: 1.2;">
                    <p style="font-size: 6pt; font-weight: bold; margin-bottom: 1mm;">Konto / Zahlbar an</p>
                    <p>{{qrBill.creditor.account}}</p>
                    <p>{{qrBill.creditor.name}}</p>
                    <p>{{qrBill.creditor.addressLine1}}</p>
                    <p>{{qrBill.creditor.addressLine2}}</p>
                </div>
                <div style="font-size: 8pt; line-height: 1.2; margin-top: 2mm;">
                    {{qrBill.referenceBlockReceipt}}
                </div>
                <div style="font-size: 8pt; line-height: 1.2; margin-top: 2mm;">
                    <p style="font-size: 6pt; font-weight: bold; margin-bottom: 1mm;">Zahlbar durch</p>
                    <p>{{qrBill.debtor.name}}</p>
                    <p>{{qrBill.debtor.addressLine1}}</p>
                    <p>{{qrBill.debtor.addressLine2}}</p>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <div style="font-size: 8pt; line-height: 1.2;">
                    <p style="font-size: 6pt; font-weight: bold;">Währung</p>
                    <p>{{qrBill.currency}}</p>
                </div>
                <div style="font-size: 8pt; line-height: 1.2;">
                    <p style="font-size: 6pt; font-weight: bold;">Betrag</p>
                    <p>{{qrBill.amountFormatted}}</p>
                </div>
            </div>
             <div style="font-size: 8pt; text-align: right;">
                 <p style="font-size: 6pt; font-weight: bold; margin-bottom: 1mm;">Annahmestelle</p>
            </div>
        </div>

        <!-- Scissors line middle -->
        <div style="height: 105mm; width: 0.5mm; border-left: 1px dashed #000; position: absolute; left: 62mm; top: 0;"></div>

        <!-- Right Part (Payment) -->
        <div style="width: 148mm; padding: 5mm; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between;">
                <div style="width: 55mm;">
                     <h2 style="font-size: 11pt; font-weight: bold; margin-bottom: 2mm;">Zahlteil</h2>
                     <div style="width: 46mm; height: 46mm; margin: 5mm 0;">
                        {{qrBill.qrCodeImage}}
                     </div>
                </div>
                <div style="font-size: 8pt; line-height: 1.2; width: 80mm;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10mm;">
                        <div>
                            <p style="font-size: 6pt; font-weight: bold;">Währung</p>
                            <p>{{qrBill.currency}}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 6pt; font-weight: bold;">Betrag</p>
                             <p>{{qrBill.amountFormatted}}</p>
                        </div>
                    </div>
                    {{qrBill.alternativeSchemes}}
                </div>
            </div>
            <div style="font-size: 8pt; line-height: 1.2; display: flex; justify-content: space-between;">
                <div style="width: 55mm;">
                    <p style="font-size: 6pt; font-weight: bold; margin-bottom: 1mm;">Konto / Zahlbar an</p>
                    <p>{{qrBill.creditor.account}}</p>
                    <p>{{qrBill.creditor.name}}</p>
                    <p>{{qrBill.creditor.addressLine1}}</p>
                    <p>{{qrBill.creditor.addressLine2}}</p>
                </div>
                <div style="width: 80mm;">
                    {{qrBill.referenceBlockPayment}}
                    <div style="margin-top: 2mm;">
                        <p style="font-size: 6pt; font-weight: bold; margin-bottom: 1mm;">Zusätzliche Informationen</p>
                        <p>{{qrBill.additionalInformation}}</p>
                    </div>
                </div>
            </div>
             <div style="font-size: 8pt; line-height: 1.2;">
                <p style="font-size: 6pt; font-weight: bold; margin-bottom: 1mm;">Zahlbar durch</p>
                <p>{{qrBill.debtor.name}}</p>
                <p>{{qrBill.debtor.addressLine1}}</p>
                <p>{{qrBill.debtor.addressLine2}}</p>
            </div>
        </div>
    </div>
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