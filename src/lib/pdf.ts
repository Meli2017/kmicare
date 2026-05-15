import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateInvoicePDF(invoice: any, clientName: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  // Load fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const primaryColor = rgb(0 / 255, 51 / 255, 102 / 255); // #003366
  const textColor = rgb(15 / 255, 23 / 255, 42 / 255);
  const grayColor = rgb(100 / 255, 116 / 255, 139 / 255);

  let yOffset = height - 50;

  // Header
  page.drawText('KMI Home & Car Care', {
    x: 50,
    y: yOffset,
    size: 24,
    font: fontBold,
    color: primaryColor,
  });

  yOffset -= 20;
  page.drawText('Nettoyage professionnel à domicile', {
    x: 50,
    y: yOffset,
    size: 10,
    font: fontRegular,
    color: grayColor,
  });

  yOffset -= 40;

  // Invoice Title and Info
  page.drawText('FACTURE', {
    x: 50,
    y: yOffset,
    size: 20,
    font: fontBold,
    color: textColor,
  });

  // Invoice Details right aligned
  page.drawText(`N° ${invoice.invoiceNumber}`, {
    x: width - 200,
    y: yOffset,
    size: 12,
    font: fontBold,
    color: textColor,
  });

  yOffset -= 25;

  page.drawText(`Date d'émission: ${invoice.issueDate}`, { x: width - 200, y: yOffset, size: 10, font: fontRegular, color: grayColor });
  yOffset -= 15;
  if (invoice.serviceDate) {
    page.drawText(`Date du service: ${invoice.serviceDate}`, { x: width - 200, y: yOffset, size: 10, font: fontRegular, color: grayColor });
    yOffset -= 15;
  }

  yOffset -= 20;

  // Client Info
  page.drawText('Facturé à :', { x: 50, y: yOffset, size: 10, font: fontBold, color: grayColor });
  yOffset -= 15;
  page.drawText(clientName, { x: 50, y: yOffset, size: 14, font: fontBold, color: textColor });
  yOffset -= 15;
  page.drawText(invoice.clientEmail || '', { x: 50, y: yOffset, size: 10, font: fontRegular, color: grayColor });

  yOffset -= 40;

  // Table Header
  page.drawLine({ start: { x: 50, y: yOffset }, end: { x: width - 50, y: yOffset }, thickness: 1, color: grayColor });
  yOffset -= 15;
  
  page.drawText('Description', { x: 50, y: yOffset, size: 10, font: fontBold, color: textColor });
  page.drawText('Qté', { x: 350, y: yOffset, size: 10, font: fontBold, color: textColor });
  page.drawText('Prix Unitaire', { x: 400, y: yOffset, size: 10, font: fontBold, color: textColor });
  page.drawText('Total', { x: 500, y: yOffset, size: 10, font: fontBold, color: textColor });

  yOffset -= 10;
  page.drawLine({ start: { x: 50, y: yOffset }, end: { x: width - 50, y: yOffset }, thickness: 1, color: grayColor });
  yOffset -= 20;

  // Table Items
  for (const item of invoice.items) {
    page.drawText(item.description, { x: 50, y: yOffset, size: 10, font: fontRegular, color: textColor });
    page.drawText(item.quantity.toString(), { x: 350, y: yOffset, size: 10, font: fontRegular, color: textColor });
    page.drawText(`${item.amount.toFixed(2)} $`, { x: 400, y: yOffset, size: 10, font: fontRegular, color: textColor });
    page.drawText(`${(item.amount * item.quantity).toFixed(2)} $`, { x: 500, y: yOffset, size: 10, font: fontRegular, color: textColor });
    yOffset -= 20;
  }

  yOffset -= 10;
  page.drawLine({ start: { x: 50, y: yOffset }, end: { x: width - 50, y: yOffset }, thickness: 1, color: grayColor });
  yOffset -= 20;

  // Total
  page.drawText('Total à payer :', { x: 400, y: yOffset, size: 12, font: fontBold, color: textColor });
  page.drawText(`${invoice.totalAmount.toFixed(2)} $`, { x: 500, y: yOffset, size: 14, font: fontBold, color: primaryColor });

  yOffset -= 40;

  if (invoice.notes) {
    page.drawText('Notes :', { x: 50, y: yOffset, size: 10, font: fontBold, color: textColor });
    yOffset -= 15;
    page.drawText(invoice.notes, { x: 50, y: yOffset, size: 10, font: fontRegular, color: grayColor });
  }

  // Footer
  page.drawText('KMI Home & Car Care', { x: 50, y: 50, size: 10, font: fontBold, color: textColor });
  page.drawText('+1 (873) 344-2040 | contact@kmicare.ca | www.kmicare.ca', { x: 50, y: 35, size: 10, font: fontRegular, color: grayColor });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
