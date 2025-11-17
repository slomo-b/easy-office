
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

export function convertSvgToPngDataUrl(svgString: string): Promise<string> {
    if (!svgString) {
        return Promise.resolve('');
    }
    return new Promise((resolve) => {
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const dpi = 300;
            const canvasWidth = (210 / 25.4) * dpi;
            const canvasHeight = (105 / 25.4) * dpi;

            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
        };
        
        img.onerror = (err) => {
            console.error("Failed to load SVG into image for PNG conversion:", err);
            URL.revokeObjectURL(url);
            resolve('');
        };

        img.src = url;
    });
}