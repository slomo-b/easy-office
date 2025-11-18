
import { InvoiceData } from "../types";
import { SwissQRBill } from 'swissqrbill/svg';

export async function generateQrCode(data: InvoiceData): Promise<string> {
  if (!data || !data.total || Number(data.total) <= 0) {
    // The preview component handles an empty string gracefully.
    return '';
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
    const bill = new SwissQRBill(billData);
    // According to the library's documentation, the instance has an `element` property (an SVGElement).
    // We serialize it to a string to be used in the HTML template.
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(bill.element);
    return svgString;

  } catch (error) {
    console.error("Swiss QR Bill generation failed:", error);
    // The preview component handles an empty string gracefully.
    return '';
  }
}