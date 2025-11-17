
import { InvoiceData } from "../types";

// QR code generation is handled by a global QRCode object from the CDN script
declare const QRCode: any;

function generateQrCodePayload(data: InvoiceData): string {
  const payload = [
    'SPC', // Swiss Payments Code
    '0200', // Version
    '1', // Coding
    data.creditorIban, // IBAN
    'S', // Address Type: S for Structured
    data.creditorName,
    data.creditorStreet,
    data.creditorHouseNr,
    data.creditorZip,
    data.creditorCity,
    data.creditorCountry,
    '', // Ultimate Creditor Name
    '', // Ultimate Creditor Street
    '', // Ultimate Creditor House Number
    '', // Ultimate Creditor Zip
    '', // Ultimate Creditor City
    '', // Ultimate Creditor Country
    data.amount.toString(), // Amount
    data.currency, // Currency
    'S', // Debtor Address Type
    data.debtorName,
    data.debtorStreet,
    data.debtorHouseNr,
    data.debtorZip,
    data.debtorCity,
    data.debtorCountry,
    'QRR', // Reference Type: QRR for QR-reference
    data.reference, // Reference
    data.unstructuredMessage, // Additional Information
    'EPD', // End of payload
    '', // Optional billing information
    '', // Optional alternative schemes
  ];
  return payload.join('\r\n');
}

export async function generateQrCode(data: InvoiceData): Promise<string> {
  const payload = generateQrCodePayload(data);
  const canvas = document.createElement('canvas');

  // Swiss QR code standard specifies error correction level 'M'
  await QRCode.toCanvas(canvas, payload, {
    errorCorrectionLevel: 'M',
    width: 256,
    margin: 1,
    color: {
      dark: '#000000FF',
      light: '#FFFFFFFF',
    },
  });

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Draw Swiss Cross in the center
  // The cross should be 7mm on a 46mm QR code. 7/46 is ~15.2% of the total size.
  const crossSize = canvas.width * 0.152;
  const crossX = (canvas.width - crossSize) / 2;
  const crossY = (canvas.height - crossSize) / 2;

  // Clear area behind the cross
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(crossX, crossY, crossSize, crossSize);

  // Draw red square
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(crossX, crossY, crossSize, crossSize);
  
  // Draw white cross arms
  ctx.fillStyle = '#FFFFFF';
  const armWidth = crossSize / (21/5); // Proportions of the swiss flag cross
  const armHeight = crossSize;
  const armVOffset = (canvas.height - armHeight) / 2;
  const armHOffset = (canvas.width - armHeight) / 2;
  
  // Vertical arm
  ctx.fillRect(crossX + armWidth * 1.5, crossY, armWidth, armHeight);
  // Horizontal arm
  ctx.fillRect(crossX, crossY + armWidth * 1.5, armHeight, armWidth);

  return canvas.toDataURL('image/png');
}
