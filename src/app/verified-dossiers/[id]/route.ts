import { NextResponse } from "next/server";

import { getProductVerificationById } from "@/lib/data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const product = await getProductVerificationById(id);

  if (!product?.verificationPdfBase64) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const pdfBytes = Buffer.from(product.verificationPdfBase64, "base64");

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${product.verificationPdfFileName || "verification-confirmation.pdf"}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
