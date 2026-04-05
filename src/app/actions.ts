"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  authenticateConfiguredAdmin,
  createAdminSession,
  destroyAdminSession,
  requireAdmin,
} from "@/lib/auth";
import { getSiteSettings, searchProductVerifications } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import {
  buildVerificationPdf,
  buildVerificationSearchText,
  parseSupplementFactsCsv,
  serializeVerificationAnalytes,
} from "@/lib/verification-dossier";
import { normalizeSearchQuery } from "@/lib/utils";

function stringValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function booleanValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function nullableStringValue(formData: FormData, key: string) {
  return stringValue(formData, key) || null;
}

function nullableNumberValue(formData: FormData, key: string) {
  const raw = stringValue(formData, key);
  if (!raw) {
    return null;
  }

  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

function fileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function safeAdminRedirect(path: string) {
  return path.startsWith("/admin") ? path : "/admin";
}

function withQuery(path: string, key: string, value: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${key}=${encodeURIComponent(value)}`;
}

function productPayload(formData: FormData) {
  return {
    brandName: stringValue(formData, "brandName"),
    productName: stringValue(formData, "productName"),
    category: stringValue(formData, "category"),
    upc: nullableStringValue(formData, "upc"),
    verificationCode: stringValue(formData, "verificationCode"),
    lotNumber: nullableStringValue(formData, "lotNumber"),
    certificateStatus: stringValue(formData, "certificateStatus"),
    status: stringValue(formData, "status"),
    purityScore: nullableNumberValue(formData, "purityScore"),
    contaminants: nullableStringValue(formData, "contaminants"),
    activeIngredients: nullableStringValue(formData, "activeIngredients"),
    notes: nullableStringValue(formData, "notes"),
    badgeLabel: nullableStringValue(formData, "badgeLabel"),
    hero: booleanValue(formData, "hero"),
  };
}

async function upsertProductRecord(
  id: string,
  payload: ReturnType<typeof productPayload> & Record<string, unknown>,
) {
  if (id) {
    return prisma.productVerification.update({
      where: { id },
      data: payload,
    });
  }

  return prisma.productVerification.create({
    data: payload,
  });
}

export async function signInAction(formData: FormData) {
  const account = stringValue(formData, "account");
  const password = stringValue(formData, "password");

  const admin = await authenticateConfiguredAdmin(account, password);
  if (!admin) {
    redirect("/admin/login?error=1");
  }

  await createAdminSession(admin.id, admin.email);
  redirect("/admin");
}

export async function signOutAction() {
  await destroyAdminSession();
  redirect("/");
}

export async function submitContactAction(formData: FormData) {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    company: z.string().optional(),
    reason: z.string().min(2),
    message: z.string().min(10),
  });

  const parsed = schema.safeParse({
    name: stringValue(formData, "name"),
    email: stringValue(formData, "email"),
    company: stringValue(formData, "company") || undefined,
    reason: stringValue(formData, "reason"),
    message: stringValue(formData, "message"),
  });

  if (!parsed.success) {
    redirect("/contact?error=1");
  }

  await prisma.contactSubmission.create({ data: parsed.data });
  revalidatePath("/admin/submissions");
  redirect("/contact?submitted=1");
}

export async function submitApplicationAction(formData: FormData) {
  const schema = z.object({
    companyName: z.string().min(2),
    contactName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    website: z.string().url().optional().or(z.literal("")),
    facilityLocation: z.string().min(2),
    gmpCertified: z.boolean(),
    gmpCertificateBody: z.string().optional(),
    productName: z.string().min(2),
    productCategory: z.string().min(2),
    dossierUrl: z.string().url().optional().or(z.literal("")),
    message: z.string().min(10),
  });

  const parsed = schema.safeParse({
    companyName: stringValue(formData, "companyName"),
    contactName: stringValue(formData, "contactName"),
    email: stringValue(formData, "email"),
    phone: stringValue(formData, "phone") || undefined,
    website: stringValue(formData, "website"),
    facilityLocation: stringValue(formData, "facilityLocation"),
    gmpCertified: booleanValue(formData, "gmpCertified"),
    gmpCertificateBody: stringValue(formData, "gmpCertificateBody") || undefined,
    productName: stringValue(formData, "productName"),
    productCategory: stringValue(formData, "productCategory"),
    dossierUrl: stringValue(formData, "dossierUrl"),
    message: stringValue(formData, "message"),
  });

  if (!parsed.success) {
    redirect("/application?error=1");
  }

  const data = parsed.data;
  await prisma.applicationSubmission.create({
    data: {
      ...data,
      website: data.website || undefined,
      dossierUrl: data.dossierUrl || undefined,
    },
  });

  revalidatePath("/admin/submissions");
  redirect("/application?submitted=1");
}

export async function runVerificationSearchAction(formData: FormData) {
  const query = stringValue(formData, "query");
  const normalized = normalizeSearchQuery(query);
  if (!normalized) {
    redirect("/verify?error=1");
  }

  const results = await searchProductVerifications(query);
  await prisma.verificationSearchAudit.create({
    data: {
      query,
      normalized,
      matchedProduct:
        results.length > 0
          ? results
              .slice(0, 3)
              .map((result) => `${result.brandName} ${result.productName}`)
              .join(", ")
          : null,
    },
  });

  redirect(`/verify?q=${encodeURIComponent(query)}`);
}

export async function saveSiteSettingsAction(formData: FormData) {
  await requireAdmin();

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      organizationName: stringValue(formData, "organizationName"),
      issuingEntityName:
        nullableStringValue(formData, "issuingEntityName") || stringValue(formData, "organizationName"),
      heroTagline: stringValue(formData, "heroTagline"),
      heroHeadline: stringValue(formData, "heroHeadline"),
      heroSubheadline: stringValue(formData, "heroSubheadline"),
      supportEmail: stringValue(formData, "supportEmail"),
      supportPhone: stringValue(formData, "supportPhone"),
      supportHours: stringValue(formData, "supportHours"),
      addressLine1: stringValue(formData, "addressLine1"),
      addressLine2: stringValue(formData, "addressLine2"),
      footerStatement: stringValue(formData, "footerStatement"),
    },
    create: {
      id: "main",
      organizationName: stringValue(formData, "organizationName"),
      issuingEntityName:
        nullableStringValue(formData, "issuingEntityName") || stringValue(formData, "organizationName"),
      heroTagline: stringValue(formData, "heroTagline"),
      heroHeadline: stringValue(formData, "heroHeadline"),
      heroSubheadline: stringValue(formData, "heroSubheadline"),
      supportEmail: stringValue(formData, "supportEmail"),
      supportPhone: stringValue(formData, "supportPhone"),
      supportHours: stringValue(formData, "supportHours"),
      addressLine1: stringValue(formData, "addressLine1"),
      addressLine2: stringValue(formData, "addressLine2"),
      footerStatement: stringValue(formData, "footerStatement"),
    },
  });

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  redirect("/admin/settings");
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();

  const id = stringValue(formData, "id");
  const payload = productPayload(formData);

  await upsertProductRecord(id, payload);

  revalidatePath("/");
  revalidatePath("/verify");
  revalidatePath("/admin/products");
  redirect(safeAdminRedirect(stringValue(formData, "redirectTo") || "/admin/products"));
}

export async function verifyProductConfirmationAction(formData: FormData) {
  await requireAdmin();

  const id = stringValue(formData, "id");
  const redirectTo = safeAdminRedirect(stringValue(formData, "redirectTo") || "/admin/products");
  const uploadedCsv = fileValue(formData, "supplementFactsCsv");
  const existingProduct = id
    ? await prisma.productVerification.findUnique({
        where: { id },
      })
    : null;

  const csvText = uploadedCsv ? await uploadedCsv.text() : existingProduct?.supplementFactsCsv || "";
  if (!csvText) {
    redirect(withQuery(redirectTo, "error", "missing-csv"));
  }

  let analytes;
  try {
    analytes = parseSupplementFactsCsv(csvText);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unable to parse the CSV file.";
    redirect(withQuery(withQuery(redirectTo, "error", "invalid-csv"), "message", reason));
  }

  const basePayload = productPayload(formData);
  const issuedAt = new Date();
  const averagePercent =
    analytes.reduce((sum, analyte) => sum + analyte.percentOfLabelClaim, 0) / analytes.length;
  const settings = await getSiteSettings();
  const verificationPdfFileName = `${[
    basePayload.brandName,
    basePayload.productName,
    basePayload.verificationCode,
  ]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-verification-confirmation.pdf`;

  const verificationPdfBase64 = await buildVerificationPdf({
    brandName: basePayload.brandName,
    productName: basePayload.productName,
    category: basePayload.category,
    verificationCode: basePayload.verificationCode,
    lotNumber: basePayload.lotNumber,
    issuedAt,
    issuingEntityName: settings.issuingEntityName || settings.organizationName,
    addressLine1: settings.addressLine1,
    addressLine2: settings.addressLine2,
    supportPhone: settings.supportPhone,
    analytes,
  });

  await upsertProductRecord(id, {
    ...basePayload,
    certificateStatus: "ACTIVE",
    status: "VERIFIED",
    purityScore: Number(averagePercent.toFixed(2)),
    activeIngredients: `${analytes.length} analytes confirmed within the accepted label-claim interval.`,
    servingSize: analytes[0]?.servingSize || null,
    supplementFactsCsv: csvText,
    supplementFactsFileName:
      uploadedCsv?.name || existingProduct?.supplementFactsFileName || "supplement-facts.csv",
    analyteResultsJson: serializeVerificationAnalytes(analytes),
    verificationPdfBase64,
    verificationPdfFileName,
    verificationSearchText: buildVerificationSearchText({
      brandName: basePayload.brandName,
      productName: basePayload.productName,
      verificationCode: basePayload.verificationCode,
      lotNumber: basePayload.lotNumber,
      upc: basePayload.upc,
      category: basePayload.category,
      analytes,
    }),
    verifiedAt: issuedAt,
    notes:
      basePayload.notes ||
      "Analytical verification confirmation generated from the uploaded Supplement Facts dossier.",
  });

  revalidatePath("/");
  revalidatePath("/verify");
  revalidatePath("/admin/products");
  redirect(withQuery(redirectTo, "verified", "1"));
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  await prisma.productVerification.delete({
    where: { id: stringValue(formData, "id") },
  });
  revalidatePath("/");
  revalidatePath("/verify");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveBlogPostAction(formData: FormData) {
  await requireAdmin();

  const title = stringValue(formData, "title");
  const slug = stringValue(formData, "slug") || slugify(title);
  const payload = {
    title,
    slug,
    excerpt: stringValue(formData, "excerpt"),
    category: stringValue(formData, "category"),
    authorName: stringValue(formData, "authorName"),
    coverImage: stringValue(formData, "coverImage") || null,
    contentHtml: stringValue(formData, "contentHtml"),
    featured: booleanValue(formData, "featured"),
    publishedAt: new Date(
      stringValue(formData, "publishedAt") || new Date().toISOString(),
    ).toISOString(),
  };

  const id = stringValue(formData, "id");

  if (id) {
    await prisma.blogPost.update({
      where: { id },
      data: payload,
    });
  } else {
    await prisma.blogPost.create({
      data: payload,
    });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin();
  await prisma.blogPost.delete({
    where: { id: stringValue(formData, "id") },
  });
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updateContactSubmissionStatusAction(formData: FormData) {
  await requireAdmin();
  await prisma.contactSubmission.update({
    where: { id: stringValue(formData, "id") },
    data: { status: stringValue(formData, "status") },
  });
  revalidatePath("/admin/submissions");
  redirect("/admin/submissions");
}

export async function updateApplicationSubmissionStatusAction(formData: FormData) {
  await requireAdmin();
  await prisma.applicationSubmission.update({
    where: { id: stringValue(formData, "id") },
    data: { status: stringValue(formData, "status") },
  });
  revalidatePath("/admin/submissions");
  redirect("/admin/submissions");
}
