import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateReportPdf = async ({
  report,
  user,
  patrolPoint,
  images = [],
}) => {
  const fileName = `report-${report._id}.pdf`;
  const filePath = path.join("tmp", fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ===== HEADER =====
    doc.fontSize(18).text("Patrol Report", { align: "center" });
    doc.moveDown();

    // ===== METADATA =====
    doc.fontSize(12);
    doc.text(`Security: ${user.firstName} ${user.lastName}`);
    doc.text(`Position: ${user.position}`);
    doc.text(`Patrol Point: ${patrolPoint.name}`);
    doc.text(`Location: ${patrolPoint.latitude}, ${patrolPoint.longitude}`);
    doc.text(`Date: ${new Date(report.createdAt).toLocaleString()}`);
    doc.moveDown();

    // ===== REPORT CONTENT =====
    doc.fontSize(14).text("Report:");
    doc.fontSize(12).text(report.report);
    doc.moveDown();

    // ===== IMAGES =====
    if (images.length > 0) {
      doc.addPage();
      doc.fontSize(14).text("Report Images");
      doc.moveDown();

      images.forEach((imgPath, index) => {
        doc.text(`Image ${index + 1}`);
        doc.image(imgPath, {
          fit: [450, 300],
          align: "center",
        });
        doc.moveDown();
      });
    }

    doc.end();

    stream.on("finish", () => resolve({ filePath, fileName }));
    stream.on("error", reject);
  });
};
