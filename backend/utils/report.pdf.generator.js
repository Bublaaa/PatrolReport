import PDFDocument from "pdfkit";

export const generateReportPDF = (reports, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  // Stream PDF directly to response
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=patrol-reports.pdf"
  );

  doc.pipe(res);

  // ===== TITLE =====
  doc.fontSize(18).text("Patrol Reports", { align: "center" }).moveDown(1.5);

  // ===== REPORT LIST =====
  reports.forEach((report, index) => {
    doc
      .fontSize(12)
      .text(`Report #${index + 1}`, { underline: true })
      .moveDown(0.5);

    doc.fontSize(10);

    doc.text(`Date       : ${new Date(report.createdAt).toLocaleString()}`);
    doc.text(
      `User       : ${report.userId.firstName} ${report.userId.lastName}`
    );
    doc.text(`Patrol Point  : ${report.patrolPointId.name}`);

    doc.moveDown(0.5);
    doc.text("Report Description:");
    doc.text(report.report, {
      indent: 20,
      align: "justify",
    });

    doc.moveDown(1);

    // Divider
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

    doc.moveDown(1);
  });

  doc.end();
};
