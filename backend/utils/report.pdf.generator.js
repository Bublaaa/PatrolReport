import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { toTitleCase } from "../../frontend/src/utils/toTitleCase.js";
import { formatDateToString } from "../../frontend/src/utils/dateTimeFormatter.js";

// * CONSTANT
const PAGE_MARGIN = 40;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const USABLE_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const ROW_HEIGHT = 25;

const COLS = {
  time: USABLE_WIDTH / 3,
  user: USABLE_WIDTH / 3,
  point: USABLE_WIDTH / 3,
};

const IMAGE_COLS = 3;
const IMAGE_HEIGHT = 120;
const IMAGE_GAP = 10;

const DEFAULT_BORDER_COLOR = "#9ca3af";
const DEFAULT_TEXT_COLOR = "#111827";

// * HELPER FUNCTIONS
const drawDivider = (doc) => {
  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .strokeColor(DEFAULT_BORDER_COLOR)
    .stroke();
  doc.moveDown(1);
};
const ensureSpace = (doc, height) => {
  if (doc.y + height > PAGE_HEIGHT - PAGE_MARGIN) {
    doc.addPage();
    doc.y = PAGE_MARGIN;
  }
};

const drawTextCell = (doc, x, y, w, h, text, options = {}) => {
  const {
    isHeader = false,
    align = "center",
    fontSize = 10,
    font = "Helvetica",
    headerFont = "Helvetica-Bold",
    padding = 6,
    textColor = DEFAULT_TEXT_COLOR,
    borderColor = DEFAULT_BORDER_COLOR,
  } = options;

  doc.rect(x, y, w, h).stroke(borderColor);

  doc
    .font(isHeader ? headerFont : font)
    .fontSize(fontSize)
    .fillColor(textColor)
    .text(text ?? "-", x + padding, y + padding, {
      width: w - padding * 2,
      align,
    });
};

const drawImageCell = async (doc, x, y, w, h, imagePath, options = {}) => {
  const {
    align = "center",
    valign = "center",
    padding = 6,
    borderColor = DEFAULT_BORDER_COLOR,
    backgroundColor = null,
  } = options;

  doc.save();

  if (backgroundColor) {
    doc.rect(x, y, w, h).fill(backgroundColor);
  }

  doc.rect(x, y, w, h).stroke(borderColor);

  if (!imagePath || !fs.existsSync(imagePath)) {
    doc
      .fontSize(9)
      .fillColor(DEFAULT_BORDER_COLOR)
      .text("Image not found", x + padding, y + h / 2 - 5, {
        width: w - padding * 2,
        align: "center",
      });

    doc.restore();
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
      .text("Unsupported image", x + padding, y + h / 2 - 5, {
        width: w - padding * 2,
        align: "center",
      });
    doc.restore();
    return;
  }

  const maxW = w - padding * 2;
  const maxH = h - padding * 2;
  const ratio = img.width / img.height;

  let iw = maxW;
  let ih = iw / ratio;

  if (ih > maxH) {
    ih = maxH;
    iw = ih * ratio;
  }

  let ix = x + padding;
  if (align === "center") ix = x + (w - iw) / 2;
  if (align === "right") ix = x + w - iw - padding;

  let iy = y + padding;
  if (valign === "center") iy = y + (h - ih) / 2;
  if (valign === "bottom") iy = y + h - ih - padding;

  doc.image(img, ix, iy, {
    width: iw,
    height: ih,
  });

  doc.restore();
};

const renderTextBlock = (doc, text, width) => {
  const lines = String(text).split("\n");
  const bulletRegex = /^(\s*)([-•]|\d+\.)\s+(.*)$/;

  const padding = 8;
  const borderColor = DEFAULT_BORDER_COLOR;

  let blockStartY = doc.y;

  const drawBorder = (startY, endY) => {
    doc
      .rect(PAGE_MARGIN, startY - padding, width, endY - startY + padding * 2)
      .stroke(borderColor);
  };

  for (const line of lines) {
    if (doc.y > PAGE_HEIGHT - PAGE_MARGIN - 40) {
      drawBorder(blockStartY, doc.y);
      doc.addPage();
      doc.y = PAGE_MARGIN;
      blockStartY = doc.y;
    }

    const match = line.match(bulletRegex);

    if (match) {
      const [, indent, bullet, content] = match;
      const bulletX = PAGE_MARGIN + indent.length * 4;
      const textX = bulletX + 12;

      doc.text(bullet, bulletX, doc.y);
      doc.text(content, textX, doc.y, {
        width: width - (textX - PAGE_MARGIN),
      });
    } else {
      doc.text(line, PAGE_MARGIN + padding, doc.y, {
        width: width - padding * 2,
      });
    }
  }

  drawBorder(blockStartY, doc.y);
};

const renderReportBlock = async (doc, report, images) => {
  ensureSpace(doc, 120);

  let y = doc.y + ROW_HEIGHT;

  // HEADER
  doc.font("Helvetica-Bold").fontSize(12).text(`Report - ${report.id}`);
  doc.moveDown(0.5);
  drawTextCell(doc, PAGE_MARGIN, y, COLS.time, ROW_HEIGHT, "Time", {
    isHeader: true,
  });
  drawTextCell(doc, PAGE_MARGIN + COLS.time, y, COLS.user, ROW_HEIGHT, "User", {
    isHeader: true,
  });
  drawTextCell(
    doc,
    PAGE_MARGIN + COLS.time + COLS.user,
    y,
    COLS.point,
    ROW_HEIGHT,
    "Patrol Point",
    { isHeader: true }
  );

  // VALUES
  y += ROW_HEIGHT;
  drawTextCell(doc, PAGE_MARGIN, y, COLS.time, ROW_HEIGHT, report.time);
  drawTextCell(
    doc,
    PAGE_MARGIN + COLS.time,
    y,
    COLS.user,
    ROW_HEIGHT,
    report.user
  );
  drawTextCell(
    doc,
    PAGE_MARGIN + COLS.time + COLS.user,
    y,
    COLS.point,
    ROW_HEIGHT,
    toTitleCase(report.point)
  );

  doc.y = y + ROW_HEIGHT;

  /* ----- REPORT TEXT ----- */
  drawTextCell(doc, PAGE_MARGIN, doc.y, USABLE_WIDTH, ROW_HEIGHT, "Report", {
    isHeader: true,
    align: "left",
  });

  doc.y += 15;
  renderTextBlock(doc, report.text.replace(/\r\n|\r/g, "\n"), USABLE_WIDTH);
  doc.y += 8;

  ensureSpace(doc, IMAGE_HEIGHT + 60);

  drawTextCell(doc, PAGE_MARGIN, doc.y, USABLE_WIDTH, ROW_HEIGHT, "Images", {
    isHeader: true,
  });
  doc.y += 8;

  let x = PAGE_MARGIN;
  let col = 0;
  for (const img of images) {
    ensureSpace(doc, IMAGE_HEIGHT + 20);
    await drawImageCell(
      doc,
      x,
      doc.y,
      USABLE_WIDTH / IMAGE_COLS,
      IMAGE_HEIGHT,
      path.resolve(process.cwd(), img.filePath)
    );
    x += USABLE_WIDTH / IMAGE_COLS;
    col++;

    if (col === IMAGE_COLS) {
      col = 0;
      x = PAGE_MARGIN;
      doc.y += IMAGE_HEIGHT + IMAGE_GAP;
    }
  }
  doc.y += IMAGE_HEIGHT + 30;
};

/* ===================== CONTROLLER ===================== */

export const generateReportPDF = async (res, reports, imagesByReportId) => {
  const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=patrol-report.pdf"
  );

  doc.pipe(res);
  const dateString = new Date(reports[0]?.createdAt).toLocaleString();

  doc.font("Helvetica-Bold").fontSize(14).text("Report Patrol");
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(`Date : ${formatDateToString(dateString)}`);

  doc.moveDown(1);
  drawDivider(doc);

  for (const report of reports) {
    await renderReportBlock(
      doc,
      {
        id: report._id,
        time: new Date(report.createdAt).toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
        }),
        user: `${report.userId.firstName} ${report.userId.lastName}`,
        point: report.patrolPointId.name,
        text: report.report,
      },
      imagesByReportId[report._id.toString()] || []
    );
    drawDivider(doc);
  }

  doc.end();
};
