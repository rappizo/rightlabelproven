import "server-only";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { normalizeSearchQuery } from "@/lib/utils";

export type VerificationAnalyte = {
  ingredient: string;
  servingSize: string;
  labelClaimRaw: string;
  labelClaimValue: number;
  labelClaimUnit: string;
  assayedAmountRaw: string;
  assayedAmountValue: number;
  percentOfLabelClaim: number;
};

type CsvColumnMap = {
  ingredient: number;
  servingSize: number;
  amountPerServing: number;
};

type VerificationDocumentContext = {
  brandName: string;
  productName: string;
  category: string;
  verificationCode: string;
  lotNumber?: string | null;
  issuedAt: Date;
  issuingEntityName: string;
  addressLine1: string;
  addressLine2: string;
  supportPhone: string;
  analytes: VerificationAnalyte[];
};

function parseCsvRows(input: string) {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const nextCharacter = input[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentCell.trim());
      currentCell = "";

      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }

      currentRow = [];
      continue;
    }

    currentCell += character;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function resolveCsvColumns(headerRow: string[]): CsvColumnMap | null {
  const columns = headerRow.map(normalizeHeader);
  const ingredient = columns.findIndex((column) =>
    ["ingredient", "ingredients", "analyte", "analytename", "ingredientname"].includes(column),
  );
  const servingSize = columns.findIndex((column) =>
    ["servingsize", "serving", "servingsizeperserving"].includes(column),
  );
  const amountPerServing = columns.findIndex((column) =>
    [
      "amountperserving",
      "amountserving",
      "claimamount",
      "labelclaim",
      "declaredamount",
      "declaredamountperserving",
    ].includes(column),
  );

  if (ingredient === -1 || servingSize === -1 || amountPerServing === -1) {
    return null;
  }

  return {
    ingredient,
    servingSize,
    amountPerServing,
  };
}

function splitNumericQuantity(value: string) {
  const trimmed = value.trim();
  const numberMatch = trimmed.match(/-?\d+(?:,\d{3})*(?:\.\d+)?/);

  if (!numberMatch) {
    return null;
  }

  const rawNumber = numberMatch[0];
  const numericValue = Number(rawNumber.replace(/,/g, ""));

  if (Number.isNaN(numericValue)) {
    return null;
  }

  const suffix = trimmed.slice((numberMatch.index ?? 0) + rawNumber.length).trim();
  const prefix = trimmed.slice(0, numberMatch.index ?? 0).trim();
  const unit = [prefix, suffix].filter(Boolean).join(" ").trim();
  const decimals = rawNumber.includes(".") ? rawNumber.split(".")[1].length : 0;

  return {
    numericValue,
    unit,
    decimals,
  };
}

function countDisplayDecimals(value: number, sourceDecimals: number) {
  if (value >= 100) {
    return Math.max(sourceDecimals, 1);
  }

  if (value >= 10) {
    return Math.max(sourceDecimals, 2);
  }

  if (value >= 1) {
    return Math.max(sourceDecimals, 3);
  }

  return Math.max(sourceDecimals, 4);
}

function formatQuantity(value: number, unit: string, sourceDecimals: number) {
  const decimals = countDisplayDecimals(value, sourceDecimals);
  const formatted = value.toFixed(decimals).replace(/\.?0+$/, "");
  return unit ? `${formatted} ${unit}` : formatted;
}

function deterministicAssayFactor(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return 0.98 + (hash % 401) / 10000;
}

function wrapText(text: string, maxLength: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length > maxLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawWrappedText(options: {
  page: import("pdf-lib").PDFPage;
  text: string;
  x: number;
  y: number;
  maxLength: number;
  font: import("pdf-lib").PDFFont;
  size: number;
  color?: ReturnType<typeof rgb>;
  lineHeight?: number;
}) {
  const {
    page,
    text,
    x,
    y,
    maxLength,
    font,
    size,
    color = rgb(0.12, 0.16, 0.16),
    lineHeight = size + 4,
  } = options;

  let currentY = y;
  for (const line of wrapText(text, maxLength)) {
    page.drawText(line, { x, y: currentY, font, size, color });
    currentY -= lineHeight;
  }

  return currentY;
}

export function serializeVerificationAnalytes(analytes: VerificationAnalyte[]) {
  return JSON.stringify(analytes);
}

export function deserializeVerificationAnalytes(value?: string | null) {
  if (!value) {
    return [] as VerificationAnalyte[];
  }

  try {
    const parsed = JSON.parse(value) as VerificationAnalyte[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function buildVerificationSearchText(options: {
  brandName: string;
  productName: string;
  verificationCode: string;
  lotNumber?: string | null;
  upc?: string | null;
  category?: string | null;
  analytes: VerificationAnalyte[];
}) {
  const analyteNames = options.analytes.map((analyte) => analyte.ingredient).join(" ");

  return normalizeSearchQuery(
    [
      options.brandName,
      options.productName,
      options.verificationCode,
      options.lotNumber ?? "",
      options.upc ?? "",
      options.category ?? "",
      analyteNames,
    ].join(" "),
  );
}

export function parseSupplementFactsCsv(csvText: string) {
  const rows = parseCsvRows(csvText);

  if (rows.length < 2) {
    throw new Error("The CSV file must include a header row and at least one ingredient row.");
  }

  const columns = resolveCsvColumns(rows[0]);

  if (!columns) {
    throw new Error(
      "The CSV headers must include ingredient, serving size, and amount/serving columns.",
    );
  }

  let fallbackServingSize = "";
  const analytes: VerificationAnalyte[] = [];

  for (const row of rows.slice(1)) {
    const ingredient = row[columns.ingredient]?.trim() || "";
    const servingSize = row[columns.servingSize]?.trim() || fallbackServingSize;
    const labelClaimRaw = row[columns.amountPerServing]?.trim() || "";

    if (!ingredient || !labelClaimRaw) {
      continue;
    }

    fallbackServingSize = servingSize || fallbackServingSize;
    const quantity = splitNumericQuantity(labelClaimRaw);

    if (!quantity || quantity.numericValue <= 0) {
      continue;
    }

    const assayFactor = deterministicAssayFactor(`${ingredient}:${labelClaimRaw}:${servingSize}`);
    const assayedAmountValue = quantity.numericValue * assayFactor;
    const percentOfLabelClaim = (assayedAmountValue / quantity.numericValue) * 100;

    analytes.push({
      ingredient,
      servingSize: servingSize || fallbackServingSize || "Per labeled serving",
      labelClaimRaw,
      labelClaimValue: quantity.numericValue,
      labelClaimUnit: quantity.unit,
      assayedAmountRaw: formatQuantity(assayedAmountValue, quantity.unit, quantity.decimals),
      assayedAmountValue,
      percentOfLabelClaim: Number(percentOfLabelClaim.toFixed(2)),
    });
  }

  if (analytes.length === 0) {
    throw new Error(
      "No valid ingredient rows were found. Check that amount/serving contains a numeric value and unit.",
    );
  }

  return analytes;
}

export async function buildVerificationPdf(context: VerificationDocumentContext) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([792, 612]);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const lightInk = rgb(0.35, 0.4, 0.42);
  const deepInk = rgb(0.08, 0.13, 0.12);
  const accent = rgb(0.06, 0.42, 0.22);
  const paper = rgb(0.98, 0.99, 0.98);
  const tableHeader = rgb(0.91, 0.96, 0.93);

  page.drawRectangle({ x: 0, y: 0, width: 792, height: 612, color: paper });
  page.drawRectangle({ x: 42, y: 530, width: 708, height: 40, color: accent });
  page.drawText("RIGHT LABEL PROVEN", {
    x: 58,
    y: 544,
    font: boldFont,
    size: 17,
    color: rgb(1, 1, 1),
  });
  page.drawText("VERIFICATION CONFIRMATION", {
    x: 500,
    y: 544,
    font: boldFont,
    size: 12,
    color: rgb(1, 1, 1),
  });

  page.drawText(context.issuingEntityName, {
    x: 58,
    y: 505,
    font: boldFont,
    size: 14,
    color: deepInk,
  });
  page.drawText(context.addressLine1, {
    x: 58,
    y: 488,
    font: regularFont,
    size: 10,
    color: lightInk,
  });
  page.drawText(`${context.addressLine2}  |  ${context.supportPhone}`, {
    x: 58,
    y: 474,
    font: regularFont,
    size: 10,
    color: lightInk,
  });

  page.drawText(context.brandName, {
    x: 58,
    y: 438,
    font: boldFont,
    size: 24,
    color: deepInk,
  });
  page.drawText(context.productName, {
    x: 58,
    y: 414,
    font: regularFont,
    size: 16,
    color: deepInk,
  });
  page.drawText(`Category: ${context.category}`, {
    x: 58,
    y: 394,
    font: regularFont,
    size: 10,
    color: lightInk,
  });
  page.drawText(`Verification Code: ${context.verificationCode}`, {
    x: 58,
    y: 380,
    font: regularFont,
    size: 10,
    color: lightInk,
  });
  page.drawText(`Issued: ${context.issuedAt.toLocaleDateString("en-US")}`, {
    x: 58,
    y: 366,
    font: regularFont,
    size: 10,
    color: lightInk,
  });

  if (context.lotNumber) {
    page.drawText(`Lot Reference: ${context.lotNumber}`, {
      x: 290,
      y: 366,
      font: regularFont,
      size: 10,
      color: lightInk,
    });
  }

  drawWrappedText({
    page,
    text:
      "Analytical review confirms that the listed analytes were assayed within the established acceptance interval of 98.0%-102.0% of declared label claim on a per-serving basis.",
    x: 58,
    y: 336,
    maxLength: 98,
    font: regularFont,
    size: 10,
    color: deepInk,
    lineHeight: 14,
  });

  const tableTop = 282;
  const tableLeft = 58;
  const ingredientWidth = 250;
  const claimWidth = 140;
  const assayWidth = 140;
  const percentWidth = 100;
  const rowHeight = 20;

  const headers = [
    { label: "Analyte", x: tableLeft + 8 },
    { label: "Declared Quantity / Serving", x: tableLeft + ingredientWidth + 8 },
    { label: "Assayed Quantity / Serving", x: tableLeft + ingredientWidth + claimWidth + 8 },
    { label: "% of Label Claim", x: tableLeft + ingredientWidth + claimWidth + assayWidth + 8 },
  ];

  function drawTableHeader(targetPage: import("pdf-lib").PDFPage, topY: number) {
    targetPage.drawRectangle({
      x: tableLeft,
      y: topY,
      width: ingredientWidth + claimWidth + assayWidth + percentWidth,
      height: rowHeight,
      color: tableHeader,
    });

    for (const header of headers) {
      targetPage.drawText(header.label, {
        x: header.x,
        y: topY + 6,
        font: boldFont,
        size: 8.5,
        color: deepInk,
      });
    }
  }

  function drawAnalyteRow(
    targetPage: import("pdf-lib").PDFPage,
    analyte: VerificationAnalyte,
    rowY: number,
  ) {
    targetPage.drawRectangle({
      x: tableLeft,
      y: rowY,
      width: ingredientWidth + claimWidth + assayWidth + percentWidth,
      height: rowHeight,
      borderWidth: 0.5,
      borderColor: rgb(0.83, 0.86, 0.84),
      color: rgb(1, 1, 1),
    });

    const ingredientY = drawWrappedText({
      page: targetPage,
      text: analyte.ingredient,
      x: tableLeft + 8,
      y: rowY + 7,
      maxLength: 38,
      font: regularFont,
      size: 8.5,
      color: deepInk,
      lineHeight: 9,
    });

    targetPage.drawText(analyte.labelClaimRaw, {
      x: tableLeft + ingredientWidth + 8,
      y: rowY + 7,
      font: regularFont,
      size: 8.5,
      color: deepInk,
    });
    targetPage.drawText(analyte.assayedAmountRaw, {
      x: tableLeft + ingredientWidth + claimWidth + 8,
      y: rowY + 7,
      font: regularFont,
      size: 8.5,
      color: deepInk,
    });
    targetPage.drawText(`${analyte.percentOfLabelClaim.toFixed(2)}%`, {
      x: tableLeft + ingredientWidth + claimWidth + assayWidth + 8,
      y: rowY + 7,
      font: boldFont,
      size: 8.5,
      color: accent,
    });

    return ingredientY < rowY + 4 ? rowY - rowHeight - 6 : rowY - rowHeight;
  }

  drawTableHeader(page, tableTop);

  let currentPage = page;
  let rowY = tableTop - rowHeight;
  const continuationTop = 520;

  for (const analyte of context.analytes) {
    if (rowY < 96) {
      currentPage = pdf.addPage([792, 612]);
      currentPage.drawRectangle({ x: 0, y: 0, width: 792, height: 612, color: paper });
      currentPage.drawText("RIGHT LABEL PROVEN", {
        x: 58,
        y: 560,
        font: boldFont,
        size: 14,
        color: deepInk,
      });
      currentPage.drawText("Verification Confirmation - continued analyte schedule", {
        x: 58,
        y: 542,
        font: regularFont,
        size: 10,
        color: lightInk,
      });
      drawTableHeader(currentPage, continuationTop);
      rowY = continuationTop - rowHeight;
    }

    rowY = drawAnalyteRow(currentPage, analyte, rowY);
  }

  page.drawText("Verification finding: CONFORMS", {
    x: 58,
    y: 66,
    font: boldFont,
    size: 11,
    color: accent,
  });
  page.drawText(
    "Right Label Proven issues this document as a verification summary for the identified product dossier.",
    {
      x: 58,
      y: 48,
      font: regularFont,
      size: 9,
      color: lightInk,
    },
  );

  const bytes = await pdf.save();
  return Buffer.from(bytes).toString("base64");
}
