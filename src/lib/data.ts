import "server-only";

import { prisma } from "@/lib/prisma";
import { fallbackSettings } from "@/lib/seed-data";
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
      orderBy: [{ hero: "desc" }, { brandName: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function findProductVerification(query: string) {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) {
    return null;
  }

  const products = await getAllProducts();

  return (
    products.find((product) => {
      const fields = [
        product.brandName,
        product.productName,
        product.upc ?? "",
        product.verificationCode,
        product.lotNumber ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return fields.includes(normalized);
    }) ?? null
  );
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
