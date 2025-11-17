
import { InvoiceData } from "../types";
import { SwissQRBill } from 'swissqrbill/svg';

function createBill(data: InvoiceData) {
    if (!data || !data.total || Number(data.total) <= 0) {
        return null;
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
        return new SwissQRBill(billData);
    } catch (error) {
        console.error("Swiss QR Bill instantiation failed:", error);
        return null;
    }
}

export function generateQrBillSvg(data: InvoiceData): string {
    const bill = createBill(data);
    if (!bill) return '';
    
    const serializer = new XMLSerializer();
    return serializer.serializeToString(bill.element);
}
