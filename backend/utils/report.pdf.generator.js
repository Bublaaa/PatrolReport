import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import sharp from "sharp";

import { toTitleCase } from "../../frontend/src/utils/toTitleCase.js";
import {
  formatDateToString,
  formatTime,
} from "../../frontend/src/utils/dateTimeFormatter.js";

const drawDivider = (doc) => {
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#9ca3af").stroke();
  doc.moveDown(1);
};

const drawCell = (doc, x, y, w, h, text, options = {}) => {
  const {
    align = "center",
    valign = "center",
    fontSize = 10,
    font = "Helvetica",
    padding = 6,
    textColor = "#111827",
    borderColor = "#9ca3af",
    backgroundColor = null,
  } = options;

  // Background
  if (backgroundColor) {
    doc.save();
    doc.rect(x, y, w, h).fill(backgroundColor);
    doc.restore();
  }

  // Border
  doc.rect(x, y, w, h).stroke(borderColor);

  // Vertical alignment
  let textY = y + padding;
  if (valign === "center") textY = y + h / 2 - fontSize / 2;
  if (valign === "bottom") textY = y + h - fontSize - padding;

  doc
    .font(font)
    .fontSize(fontSize)
    .fillColor(textColor)
    .text(text ?? "-", x + padding, textY, {
      width: w - padding * 2,
      align,
    });
};

const drawImageCell = async (doc, x, y, w, h, imagePath, options = {}) => {
  const {
    align = "center",
    valign = "center",
    padding = 6,
    borderColor = "#9ca3af",
    backgroundColor = null,
  } = options;

  if (backgroundColor) {
    doc.save();
    doc.rect(x, y, w, h).fill(backgroundColor);
    doc.restore();
  }

  doc.rect(x, y, w, h).stroke(borderColor);

  if (!imagePath || !fs.existsSync(imagePath)) {
    doc
      .fontSize(9)
      .fillColor("#9ca3af")
      .text("Image not found", x, y + h / 2 - 5, {
        width: w,
        align: "center",
      });
    return;
  }

  let img;
  try {
    const ext = path.extname(imagePath).toLowerCase();

    if (ext === ".webp") {
      const buffer = await sharp(imagePath).png().toBuffer();
      img = doc.openImage(buffer);
    } else {
      img = doc.openImage(imagePath);
    }
  } catch (err) {
    doc
      .fontSize(9)
      .fillColor("#ef4444")
      .text("Unsupported image", x, y + h / 2 - 5, {
        width: w,
        align: "center",
      });
    return;
  }

  const maxWidth = w - padding * 2;
  const maxHeight = h - padding * 2;
  const ratio = img.width / img.height;

  let imgWidth = maxWidth;
  let imgHeight = imgWidth / ratio;

  if (imgHeight > maxHeight) {
    imgHeight = maxHeight;
    imgWidth = imgHeight * ratio;
  }

  let imgX = x + (w - imgWidth) / 2;
  let imgY = y + (h - imgHeight) / 2;

  doc.image(img, imgX, imgY, {
    width: imgWidth,
    height: imgHeight,
  });
};

export const generateReportPDF = async (reports, res, imagesByReportId) => {
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  const PAGE_WIDTH = doc.page.width;
  const START_X = doc.page.margins.left;
  const USABLE_WIDTH =
    PAGE_WIDTH - doc.page.margins.left - doc.page.margins.right;

  const COLUMN_WIDTH = USABLE_WIDTH / 3;
  const ROW_HEIGHT = 22;

  const IMAGE_COLS = 3;
  const IMAGE_CELL_HEIGHT = 110;
  const IMAGE_GAP = 10;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=patrol-reports.pdf"
  );

  doc.pipe(res);

  /* ---------- HEADER ---------- */
  const dateString = new Date(reports[0]?.createdAt).toLocaleString();

  doc.font("Helvetica-Bold").fontSize(14).text("Report Patrol");
  doc
    .font("Helvetica")
    .fontSize(11)
    .text(`Date : ${formatDateToString(dateString)}`);

  doc.moveDown(1);
  drawDivider(doc);

  /* ---------- REPORT LIST ---------- */
  for (let index = 0; index < reports.length; index++) {
    const report = reports[index];

    const patrolPoint = toTitleCase(report.patrolPointId?.name ?? "-");

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`Report - ${index + 1}`);
    doc.moveDown(0.5);

    let Y = doc.y;

    // Header row
    drawCell(doc, START_X, Y, COLUMN_WIDTH, ROW_HEIGHT, "Time");
    drawCell(doc, START_X + COLUMN_WIDTH, Y, COLUMN_WIDTH, ROW_HEIGHT, "User");
    drawCell(
      doc,
      START_X + COLUMN_WIDTH * 2,
      Y,
      COLUMN_WIDTH,
      ROW_HEIGHT,
      "Patrol Point"
    );

    // Values
    Y += ROW_HEIGHT;
    drawCell(
      doc,
      START_X,
      Y,
      COLUMN_WIDTH,
      ROW_HEIGHT,
      formatTime(new Date(report.createdAt))
    );
    drawCell(
      doc,
      START_X + COLUMN_WIDTH,
      Y,
      COLUMN_WIDTH,
      ROW_HEIGHT,
      `${report.userId?.firstName ?? ""} ${report.userId?.lastName ?? ""}`
    );
    drawCell(
      doc,
      START_X + COLUMN_WIDTH * 2,
      Y,
      COLUMN_WIDTH,
      ROW_HEIGHT,
      patrolPoint
    );

    // Description
    Y += ROW_HEIGHT;
    drawCell(doc, START_X, Y, USABLE_WIDTH, ROW_HEIGHT, "Report", {
      align: "left",
    });

    Y += ROW_HEIGHT;
    drawCell(doc, START_X, Y, USABLE_WIDTH, ROW_HEIGHT, report.report, {
      align: "left",
    });

    // Images
    Y += ROW_HEIGHT;
    drawCell(doc, START_X, Y, USABLE_WIDTH, ROW_HEIGHT, "Images");

    Y += ROW_HEIGHT;

    const images = imagesByReportId[report._id.toString()] || [];

    let imgX = START_X;
    let imgY = Y;
    let colIndex = 0;

    for (const image of images) {
      const fullPath = path.resolve(process.cwd(), image.filePath);

      await drawImageCell(
        doc,
        imgX,
        imgY,
        COLUMN_WIDTH,
        IMAGE_CELL_HEIGHT,
        fullPath,
        { backgroundColor: "#f9fafb" }
      );

      colIndex++;
      imgX += COLUMN_WIDTH;

      if (colIndex === IMAGE_COLS) {
        colIndex = 0;
        imgX = START_X;
        imgY += IMAGE_CELL_HEIGHT + IMAGE_GAP;

        if (imgY > doc.page.height - 150) {
          doc.addPage();
          imgY = doc.page.margins.top;
        }
      }
    }

    doc.y = imgY + IMAGE_CELL_HEIGHT + 20;
    if (doc.y > 700) doc.addPage();
  }

  doc.end();
};
