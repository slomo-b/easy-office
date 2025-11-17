
import { InvoiceData } from "../types";

// QR code generation is handled by a global QRCode object from the CDN script
declare const QRCode: any;

// Helper function to clean and truncate fields according to Swiss QR Bill specs
const sanitizeField = (value: string | undefined | null, maxLength: number): string => {
  if (!value) return '';
  // Remove line breaks and trim whitespace
  const cleaned = value.replace(/(\r\n|\n|\r)/gm, " ").trim();
  // Truncate to max length
  return cleaned.substring(0, maxLength);
};

function generateQrCodePayload(data: InvoiceData): string {
  // Amount must be formatted with 2 decimal places
  const formattedAmount = Number(data.amount).toFixed(2);

  const payload = [
    'SPC', // Swiss Payments Code
    '0200', // Version
    '1', // Coding (UTF-8)
    data.creditorIban.replace(/\s/g, ''), // IBAN (no spaces)
    'S', // Creditor Address Type: S for Structured
    sanitizeField(data.creditorName, 70),
    sanitizeField(data.creditorStreet, 70),
    sanitizeField(data.creditorHouseNr, 16),
    sanitizeField(data.creditorZip, 16),
    sanitizeField(data.creditorCity, 35),
    sanitizeField(data.creditorCountry, 2),
    '', // Ultimate Creditor Address Type
    '', // Ultimate Creditor Name
    '', // Ultimate Creditor Street
    '', // Ultimate Creditor House Number
    '', // Ultimate Creditor Zip
    '', // Ultimate Creditor City
    '', // Ultimate Creditor Country
    formattedAmount, // Amount
    data.currency, // Currency
    'S', // Debtor Address Type
    sanitizeField(data.debtorName, 70),
    sanitizeField(data.debtorStreet, 70),
    sanitizeField(data.debtorHouseNr, 16),
    sanitizeField(data.debtorZip, 16),
    sanitizeField(data.debtorCity, 35),
    sanitizeField(data.debtorCountry, 2),
    'QRR', // Reference Type: QRR for QR-reference
    data.reference.replace(/\s/g, ''), // Reference (no spaces)
    sanitizeField(data.unstructuredMessage, 140), // Additional Information
    'EPD', // End of payload
    '', // Structured Billing Information (is empty because Debtor is provided)
  ];
  return payload.join('\n'); // Use LF (\n) as per spec
}

export async function generateQrCode(data: InvoiceData): Promise<string> {
  if (!data || !data.amount || Number(data.amount) <= 0) {
    throw new Error('Amount must be greater than zero to generate a QR code.');
  }
    
  const payload = generateQrCodePayload(data);
  const canvas = document.createElement('canvas');

  // Swiss QR code standard specifies error correction level 'M' and a quiet zone (margin)
  await QRCode.toCanvas(canvas, payload, {
    errorCorrectionLevel: 'M',
    width: 256,
    margin: 4, // Increased margin for better scannability (quiet zone)
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
  
  // Draw white cross arms based on a 5x5 grid model for the cross
  ctx.fillStyle = '#FFFFFF';
  const armWidth = crossSize / 5;
  
  // Vertical arm
  ctx.fillRect(crossX + armWidth * 2, crossY, armWidth, crossSize);
  // Horizontal arm
  ctx.fillRect(crossX, crossY + armWidth * 2, crossSize, armWidth);

  return canvas.toDataURL('image/png');
}
