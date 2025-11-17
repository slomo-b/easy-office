import { InvoiceData } from "../types";
// Use the explicit browser entry point provided by the package.
// This is the correct way to import it, as its package.json is missing the default "." export specifier.
import { Generator } from 'swissqrbill/browser';

export async function generateQrCode(data: InvoiceData): Promise<string> {
  if (!data || !data.total || Number(data.total) <= 0) {
    throw new Error('Amount must be greater than zero to generate a QR code.');
  }

  const billData = {
      currency: data.currency,
      amount: Number(data.total),
      reference: data.reference.replace(/\s/g, ''),
      additionalInformation: data.unstructuredMessage,
      creditor: {
          name: data.creditorName,
          address: `${data.creditorStreet} ${data.creditorHouseNr}`,
          zip: data.creditorZip,
          city: data.creditorCity,
          account: data.creditorIban.replace(/\s/g, ''),
          country: data.creditorCountry,
      },
      debtor: {
          name: data.debtorName,
          address: `${data.debtorStreet} ${data.debtorHouseNr}`,
          zip: data.debtorZip,
          city: data.debtorCity,
          country: data.debtorCountry,
      }
  };

  try {
    // The library's default size is the payment part (210x105mm), which is exactly what we want.
    const bill = new Generator(billData);
    const svg = bill.getSVG();
    return svg;

  } catch (error) {
    console.error("Swiss QR Bill generation failed:", error);
    throw error;
  }
}
