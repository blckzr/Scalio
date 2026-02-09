// Certificate Generator Service
// Generates branded PDF certificates for user certifications

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a branded certificate PDF and returns the file path.
 * @param {Object} options
 * @param {string} options.userName - Full name of the user
 * @param {string} options.certificateTitle - Name of the certification
 * @param {string} options.issuer - Issuer/organization name
 * @param {string} options.date - Date of issuance (YYYY-MM-DD)
 * @param {string} options.outputDir - Directory to save the PDF
 * @returns {Promise<string>} - Path to the generated PDF
 */
async function generateCertificate({ userName, certificateTitle, issuer, date, outputDir }) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const fileName = `${userName.replace(/\s+/g, '_')}_${certificateTitle.replace(/\s+/g, '_')}_${date}.pdf`;
  const filePath = path.join(outputDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f7f7f7');

    // Border
    doc.save()
      .lineWidth(8)
      .strokeColor('#2d6cdf')
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .stroke()
      .restore();

    // Logo (optional: place your logo at ./assets/certificate-logo.png)
    const logoPath = path.join(__dirname, '../client/public/assets/certificate-logo.png');
    let logoHeight = 0;
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 60, 60, { width: 120 });
      logoHeight = 120;
    }

    // Calculate vertical center for main content
    const contentHeight = 340; // Approximate total height of all text blocks
    const yStart = (doc.page.height - contentHeight) / 2 + (logoHeight ? 40 : 0);
    let y = yStart;

    // Title
    doc.font('Helvetica-Bold')
      .fontSize(38)
      .fillColor('#2d6cdf')
      .text('Certificate of Completion', 0, y, {
        align: 'center',
        width: doc.page.width
      });
    y += 55;

    // Subtitle
    doc.font('Helvetica')
      .fontSize(20)
      .fillColor('#333')
      .text('This is to certify that', 0, y, { align: 'center', width: doc.page.width });
    y += 35;

    // User Name
    doc.font('Helvetica-Bold')
      .fontSize(32)
      .fillColor('#222')
      .text(userName, 0, y, { align: 'center', width: doc.page.width });
    y += 45;

    // Achievement
    doc.font('Helvetica')
      .fontSize(20)
      .fillColor('#333')
      .text('has successfully completed the certification:', 0, y, { align: 'center', width: doc.page.width });
    y += 35;

    // Certification Title
    doc.font('Helvetica-Bold')
      .fontSize(26)
      .fillColor('#2d6cdf')
      .text(certificateTitle, 0, y, { align: 'center', width: doc.page.width });
    y += 50;

    // Date and Issuer
    doc.font('Helvetica')
      .fontSize(16)
      .fillColor('#555')
      .text(`Awarded on: ${date}`, 0, y, { align: 'center', width: doc.page.width });
    y += 25;
    doc.text(`Issued by: ${issuer}`, 0, y, { align: 'center', width: doc.page.width });
    y += 50;

    // Signature line (optional)
    doc.font('Helvetica-Oblique')
      .fontSize(14)
      .fillColor('#888')
      .text('_________________________', 0, y, { align: 'center', width: doc.page.width });
    y += 18;
    doc.text('Signature', 0, y, { align: 'center', width: doc.page.width });

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { generateCertificate };
