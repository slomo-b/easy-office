import { InvoiceData } from "../types";

// QR code generation is handled by a global swissqrbill object from the CDN script
declare const swissqrbill: any;

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
    // By removing the size option and the regex, we get a clean, full SVG of the payment part.
    const bill = new swissqrbill.Generator(billData);
    const svg = bill.getSVG();
    return svg;

  } catch (error) {
    console.error("Swiss QR Bill generation failed:", error);
    throw error;
  }
}