import "server-only";

import { prisma } from "@/lib/prisma";
import { fallbackSettings } from "@/lib/seed-data";
import { deserializeVerificationAnalytes } from "@/lib/verification-dossier";
import { normalizeSearchQuery } from "@/lib/utils";

export async function getSiteSettings() {
  try {
    return (
      (await prisma.siteSettings.findUnique({
        where: { id: "main" },
      })) ?? fallbackSettings
    );
  } catch {
    return fallbackSettings;
  }
}

export async function getFeaturedProducts() {
  try {
    return prisma.productVerification.findMany({
      where: { hero: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch {
    return [];
  }
}

export async function getAllProducts() {
  try {
    return prisma.productVerification.findMany({
      orderBy: [{ verifiedAt: "desc" }, { hero: "desc" }, { brandName: "asc" }],
    });
  } catch {
    return [];
  }
}

function buildProductSearchHaystack(product: Awaited<ReturnType<typeof getAllProducts>>[number]) {
  const analyteNames = deserializeVerificationAnalytes(product.analyteResultsJson)
    .map((analyte) => analyte.ingredient)
    .join(" ");

  return normalizeSearchQuery(
    [
      product.brandName,
      product.productName,
      product.upc ?? "",
      product.verificationCode,
      product.lotNumber ?? "",
      product.category,
      product.verificationSearchText ?? "",
      analyteNames,
    ].join(" "),
  );
}

function scoreProductMatch(
  product: Awaited<ReturnType<typeof getAllProducts>>[number],
  normalizedQuery: string,
) {
  const exactProduct = normalizeSearchQuery(`${product.brandName} ${product.productName}`);
  const exactBrand = normalizeSearchQuery(product.brandName);
  const haystack = buildProductSearchHaystack(product);
  const terms = normalizedQuery.split(" ");

  let score = 0;

  if (exactProduct === normalizedQuery) {
    score += 300;
  }

  if (exactBrand === normalizedQuery) {
    score += 220;
  }

  if (product.verificationCode.toLowerCase() === normalizedQuery) {
    score += 200;
  }

  if (haystack.includes(normalizedQuery)) {
    score += 120;
  }

  score += terms.filter((term) => haystack.includes(term)).length * 15;

  if (product.verifiedAt) {
    score += 12;
  }

  if (product.hero) {
    score += 4;
  }

  return score;
}

export async function searchProductVerifications(query: string) {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) {
    return [];
  }

  const products = await getAllProducts();
  const terms = normalized.split(" ");

  return products
    .filter((product) => {
      const haystack = buildProductSearchHaystack(product);
      return haystack.includes(normalized) || terms.every((term) => haystack.includes(term));
    })
    .sort((left, right) => scoreProductMatch(right, normalized) - scoreProductMatch(left, normalized));
}

export async function findProductVerification(query: string) {
  const results = await searchProductVerifications(query);
  return results[0] ?? null;
}

export async function getProductVerificationById(id: string) {
  try {
    return prisma.productVerification.findUnique({
      where: { id },
    });
  } catch {
    return null;
  }
}

export async function getBlogPosts() {
  try {
    return prisma.blogPost.findMany({
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    });
  } catch {
    return [];
  }
}

export async function getFeaturedBlogPosts() {
  const posts = await getBlogPosts();
  return posts.slice(0, 3);
}

export async function getBlogPostBySlug(slug: string) {
  try {
    return prisma.blogPost.findUnique({
      where: { slug },
    });
  } catch {
    return null;
  }
}
