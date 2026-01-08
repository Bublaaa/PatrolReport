// import PDFDocument from "pdfkit";
// import { Report } from "../models/Report.js";
// import fs from "fs";
// import path from "path";
// import sharp from "sharp";

// import { toTitleCase } from "../../frontend/src/utils/toTitleCase.js";
// import {
//   formatDateToString,
//   formatTime,
// } from "../../frontend/src/utils/dateTimeFormatter.js";

// const getTextHeight = (doc, text, width) => {
//   return doc.heightOfString(text, { width });
// };

// const PAGE_MARGIN = 40;
// const PAGE_WIDTH = 595.28; // A4
// const PAGE_HEIGHT = 841.89;

// const TABLE = {
//   time: 60,
//   user: 120,
//   point: 120,
//   report: PAGE_WIDTH - PAGE_MARGIN * 2 - (60 + 120 + 120),
// };

// const LINE_GAP = 8;

// const drawHeader = (doc, y) => {
//   doc.font("Helvetica-Bold").fontSize(10);

//   doc.text("Time", PAGE_MARGIN, y, { width: TABLE.time });
//   doc.text("User", PAGE_MARGIN + TABLE.time, y, { width: TABLE.user });
//   doc.text("Patrol Point", PAGE_MARGIN + TABLE.time + TABLE.user, y, {
//     width: TABLE.point,
//   });
//   doc.text("Report", PAGE_MARGIN + TABLE.time + TABLE.user + TABLE.point, y, {
//     width: TABLE.report,
//   });

//   doc
//     .moveTo(PAGE_MARGIN, y + 14)
//     .lineTo(PAGE_WIDTH - PAGE_MARGIN, y + 14)
//     .stroke();

//   return y + 20;
// };

// const drawRow = (doc, report, startY) => {
//   doc.font("Helvetica").fontSize(9);

//   const initialY = startY;

//   // PAGE BREAK BEFORE ROW
//   if (initialY > PAGE_HEIGHT - PAGE_MARGIN - 60) {
//     doc.addPage();
//     startY = drawHeader(doc, PAGE_MARGIN);
//   }

//   // Fixed columns
//   doc.text(report.time, PAGE_MARGIN, startY, {
//     width: TABLE.time,
//   });

//   doc.text(report.user, PAGE_MARGIN + TABLE.time, startY, {
//     width: TABLE.user,
//   });

//   doc.text(report.patrolPoint, PAGE_MARGIN + TABLE.time + TABLE.user, startY, {
//     width: TABLE.point,
//   });

//   // 🔥 IMPORTANT: Let PDFKit handle Y for long text
//   doc.text(
//     report.report || "-",
//     PAGE_MARGIN + TABLE.time + TABLE.user + TABLE.point,
//     startY,
//     {
//       width: TABLE.report,
//       align: "left",
//     }
//   );

//   // ✅ doc.y is now the correct next position
//   return doc.y + LINE_GAP;
// };

// export const generateReportPDF = async (req, res) => {
//   const reports = await Report.find()
//     .populate("userId", "firstName lastName")
//     .populate("patrolPointId", "name")
//     .sort({ createdAt: 1 });

//   const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN });

//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=patrol-report.pdf"
//   );

//   doc.pipe(res);

//   doc.fontSize(14).text("Patrol Report", { align: "center" });
//   doc.moveDown();

//   let y = drawHeader(doc, doc.y + 10);

//   for (const r of reports) {
//     y = drawRow(
//       doc,
//       {
//         time: new Date(r.createdAt).toLocaleTimeString("id-ID", {
//           timeZone: "Asia/Jakarta",
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//         user: `${r.userId.firstName} ${r.userId.lastName}`,
//         patrolPoint: r.patrolPointId.name,
//         report: r.report,
//       },
//       y
//     );
//   }

//   doc.end();
// };

import PDFDocument from "pdfkit";
import { Report } from "../models/Report.js";

/* ===================== CONSTANTS ===================== */

const PAGE_MARGIN = 40;
const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;

const TABLE = {
  time: 60,
  user: 120,
  point: 120,
  report: PAGE_WIDTH - PAGE_MARGIN * 2 - (60 + 120 + 120),
};

const LINE_GAP = 8;

/* ===================== HEADER ===================== */

const drawHeader = (doc, y) => {
  doc.font("Helvetica-Bold").fontSize(10);

  doc.text("Time", PAGE_MARGIN, y, { width: TABLE.time });
  doc.text("User", PAGE_MARGIN + TABLE.time, y, { width: TABLE.user });
  doc.text("Patrol Point", PAGE_MARGIN + TABLE.time + TABLE.user, y, {
    width: TABLE.point,
  });
  doc.text("Report", PAGE_MARGIN + TABLE.time + TABLE.user + TABLE.point, y, {
    width: TABLE.report,
  });

  doc
    .moveTo(PAGE_MARGIN, y + 14)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN, y + 14)
    .stroke();

  return y + 20;
};

/* ===================== FORMATTED TEXT ===================== */

const renderFormattedText = (doc, text, x, startY, width) => {
  const lines = String(text).split("\n");
  let y = startY;

  const bulletRegex = /^(\s*)([-•]|\d+\.)\s+(.*)$/;

  for (const line of lines) {
    // PAGE BREAK
    if (y > PAGE_HEIGHT - PAGE_MARGIN - 40) {
      doc.addPage();
      y = drawHeader(doc, PAGE_MARGIN);
    }

    const match = line.match(bulletRegex);

    if (match) {
      const [, indent, bullet, content] = match;

      const bulletX = x + indent.length * 4;
      const textX = bulletX + 12;
      const textWidth = width - (textX - x);

      doc.text(bullet, bulletX, y);
      doc.text(content, textX, y, {
        width: textWidth,
        align: "left",
      });

      y = doc.y + 4;
    } else {
      doc.text(line, x, y, {
        width,
        align: "left",
      });

      y = doc.y + 4;
    }
  }

  return y;
};

/* ===================== ROW ===================== */

const drawRow = (doc, report, startY) => {
  doc.font("Helvetica").fontSize(9);

  // PAGE BREAK BEFORE ROW
  if (startY > PAGE_HEIGHT - PAGE_MARGIN - 60) {
    doc.addPage();
    startY = drawHeader(doc, PAGE_MARGIN);
  }

  // Fixed columns
  doc.text(report.time, PAGE_MARGIN, startY, { width: TABLE.time });
  doc.text(report.user, PAGE_MARGIN + TABLE.time, startY, {
    width: TABLE.user,
  });
  doc.text(report.patrolPoint, PAGE_MARGIN + TABLE.time + TABLE.user, startY, {
    width: TABLE.point,
  });

  // Report text (formatted)
  const textX = PAGE_MARGIN + TABLE.time + TABLE.user + TABLE.point;

  const nextY = renderFormattedText(
    doc,
    report.report || "-",
    textX,
    startY,
    TABLE.report
  );

  return nextY + LINE_GAP;
};

/* ===================== PDF CONTROLLER ===================== */

export const generateReportPDF = async (req, res) => {
  const reports = await Report.find()
    .populate("userId", "firstName lastName")
    .populate("patrolPointId", "name")
    .sort({ createdAt: 1 });

  const doc = new PDFDocument({
    size: "A4",
    margin: PAGE_MARGIN,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=patrol-report.pdf"
  );

  doc.pipe(res);

  // Title
  doc.fontSize(14).font("Helvetica-Bold").text("Patrol Report", {
    align: "center",
  });
  doc.moveDown();

  let y = drawHeader(doc, doc.y + 10);

  for (const r of reports) {
    y = drawRow(
      doc,
      {
        time: new Date(r.createdAt).toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
        }),
        user: `${r.userId.firstName} ${r.userId.lastName}`,
        patrolPoint: r.patrolPointId.name,
        report: r.report,
      },
      y
    );
  }

  doc.end();
};
