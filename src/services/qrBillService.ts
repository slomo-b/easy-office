

import { InvoiceData } from "../types";
import { SwissQRBill } from 'swissqrbill/svg';
import { QR } from 'swissqrbill/qr';

export interface QrBillComponentData {
    qrCodeImage: string;
    amountFormatted: string;
    currency: string;
    additionalInformation: string;
    reference: string;
    creditor: {
        name: string;
        account: string;
        addressLine1: string;
        addressLine2: string;
    },
    debtor: {
        name: string;
        addressLine1: string;
        addressLine2: string;
    },
    referenceBlockReceipt: string;
    referenceBlockPayment: string;
    alternativeSchemes: string;
}

const createEmptyQrData = (): QrBillComponentData => ({
    qrCodeImage: `<div style="width: 46mm; height: 46mm; display: flex; align-items: center; justify-content: center; background-color: #f3f4f6; border: 1px dashed #d1d5db; text-align: center; font-size: 6pt; color: #6b7280; padding: 2mm;">QR-Code wird generiert, wenn ein Betrag > 0 eingegeben wird.</div>`,
    amountFormatted: '____________',
    currency: '',
    additionalInformation: '',
    reference: '',
    creditor: { name: '', account: '', addressLine1: '', addressLine2: '' },
    debtor: { name: '', addressLine1: '', addressLine2: '' },
    referenceBlockReceipt: '',
    referenceBlockPayment: '',
    alternativeSchemes: '',
});

export function generateQrBillComponentData(data: InvoiceData): QrBillComponentData {
    if (!data || !data.total || Number(data.total) <= 0) {
        return createEmptyQrData();
    }
    
    const billData = {
        currency: data.currency,
        amount: Number(data.total),
        reference: data.reference.replace(/\s/g, ''),
        additionalInformation: data.unstructuredMessage,
        creditor: {
            name: data.creditorName,
            address: data.creditorStreet,
            houseNo: data.creditorHouseNr,
            zip: data.creditorZip,
            city: data.creditorCity,
            account: data.creditorIban.replace(/\s/g, ''),
            country: data.creditorCountry,
        },
        debtor: {
            name: data.debtorName,
            address: data.debtorStreet,
            houseNo: data.debtorHouseNr,
            zip: data.debtorZip,
            city: data.debtorCity,
            country: data.debtorCountry,
        }
    };

    try {
        const bill = new SwissQRBill(billData);
        const qr = new QR(billData);
        const serializer = new XMLSerializer();

        const referenceBlock = (isPaymentPart: boolean) => {
            const title = '<p style="font-size: 6pt; font-weight: bold; margin-bottom: 1mm;">Referenz</p>';
            if(data.reference){
                 return `${title}<p>${bill.reference}</p>`;
            }
            if(isPaymentPart) return '';
            return `${title}<p>_________________________</p><p>_________________________</p>`;
        };

        return {
            qrCodeImage: serializer.serializeToString(qr.element),
            amountFormatted: Number(data.total).toFixed(2),
            currency: data.currency,
            additionalInformation: data.unstructuredMessage,
            reference: bill.reference,
            creditor: {
                name: data.creditorName,
                account: bill.creditor.account,
                addressLine1: `${data.creditorStreet} ${data.creditorHouseNr}`,
                addressLine2: `${data.creditorZip} ${data.creditorCity}`,
            },
            debtor: {
                name: data.debtorName,
                addressLine1: `${data.debtorStreet} ${data.debtorHouseNr}`,
                addressLine2: `${data.debtorZip} ${data.debtorCity}`,
            },
            referenceBlockReceipt: referenceBlock(false),
            referenceBlockPayment: referenceBlock(true),
            alternativeSchemes: bill.alternativeSchemes.map(scheme => `<p>${scheme}</p>`).join('')
        };

    } catch (error) {
        console.error("Swiss QR Bill data generation failed:", error);
        return createEmptyQrData();
    }
}