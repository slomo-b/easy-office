import { InvoiceData } from "../types";
import { SwissQRBill } from 'swissqrbill/svg';

export async function generateQrCode(data: InvoiceData): Promise<string> {
  if (!data || !data.total || Number(data.total) <= 0) {
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
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(bill.element);

    // Convert SVG string to a PNG data URL using canvas for better PDF compatibility
    return new Promise((resolve) => {
      const img = new Image();
      // Use unescaped SVG string for blob creation
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Render at 300 DPI for high quality print
        // 210mm is ~8.27 inches. 8.27 * 300 = 2481px
        // 105mm is ~4.13 inches. 4.13 * 300 = 1239px
        const canvas = document.createElement('canvas');
        canvas.width = 2481;
        canvas.height = 1239;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Fill background with white, otherwise it will be transparent
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
        resolve(''); // On error, resolve with an empty string
      };

      img.src = url;
    });

  } catch (error) {
    console.error("Swiss QR Bill generation failed:", error);
    return Promise.resolve('');
  }
}
