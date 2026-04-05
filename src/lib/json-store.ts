import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

import { getAdminSeedConfig } from "@/lib/admin-config";
import { createPasswordHash, verifyPasswordHash } from "@/lib/passwords";
import { fallbackSettings } from "@/lib/seed-data";

type OrderDirection = "asc" | "desc";

type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type SiteSettingsRecord = typeof fallbackSettings & { updatedAt: string };

type ProductVerificationRecord = {
  id: string;
  brandName: string;
  productName: string;
  category: string;
  upc: string | null;
  verificationCode: string;
  lotNumber: string | null;
  certificateStatus: string;
  status: string;
  purityScore: number | null;
  contaminants: string | null;
  activeIngredients: string | null;
  notes: string | null;
  badgeLabel: string | null;
  servingSize?: string | null;
  supplementFactsCsv?: string | null;
  supplementFactsFileName?: string | null;
  analyteResultsJson?: string | null;
  verificationPdfBase64?: string | null;
  verificationPdfFileName?: string | null;
  verificationSearchText?: string | null;
  verifiedAt?: string | null;
  hero: boolean;
  createdAt: string;
  updatedAt: string;
};

type BlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  authorName: string;
  coverImage: string | null;
  contentHtml: string;
  publishedAt: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

type ContactSubmissionRecord = {
  id: string;
  name: string;
  email: string;
  company?: string;
  reason: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type ApplicationSubmissionRecord = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  facilityLocation: string;
  gmpCertified: boolean;
  gmpCertificateBody?: string;
  productName: string;
  productCategory: string;
  dossierUrl?: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type VerificationSearchAuditRecord = {
  id: string;
  query: string;
  normalized: string;
  matchedProduct: string | null;
  createdAt: string;
};

type Store = {
  adminUsers: AdminUserRecord[];
  siteSettings: SiteSettingsRecord;
  productVerifications: ProductVerificationRecord[];
  blogPosts: BlogPostRecord[];
  contactSubmissions: ContactSubmissionRecord[];
  applicationSubmissions: ApplicationSubmissionRecord[];
  verificationSearchAudits: VerificationSearchAuditRecord[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const LEGACY_SECTION_IMAGE =
  "https://rightlabelproven.org/wp-content/uploads/2026/01/section2.jpg";
const LOCAL_SECTION_IMAGE = "/media/blog/section2.jpg";

function now() {
  return new Date().toISOString();
}

function toComparableValue(value: unknown) {
  if (typeof value === "boolean") {
    return Number(value);
  }

  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).getTime();
  }

  return value as string | number;
}

function sortByOrder<T extends Record<string, unknown>>(
  items: T[],
  orderBy?: Record<string, OrderDirection> | Array<Record<string, OrderDirection>>,
) {
  if (!orderBy) {
    return items;
  }

  const rules = Array.isArray(orderBy) ? orderBy : [orderBy];

  return [...items].sort((left, right) => {
    for (const rule of rules) {
      const [field, direction] = Object.entries(rule)[0];
      const leftValue = toComparableValue(left[field]);
      const rightValue = toComparableValue(right[field]);

      if (leftValue === rightValue) {
        continue;
      }

      if (leftValue > rightValue) {
        return direction === "asc" ? 1 : -1;
      }

      return direction === "asc" ? -1 : 1;
    }

    return 0;
  });
}

function applyWhere<T extends Record<string, unknown>>(items: T[], where?: Record<string, unknown>) {
  if (!where) {
    return items;
  }

  return items.filter((item) =>
    Object.entries(where).every(([key, value]) => item[key] === value),
  );
}

function applyTake<T>(items: T[], take?: number) {
  return typeof take === "number" ? items.slice(0, take) : items;
}

function applySelect<T extends Record<string, unknown>, S extends Record<string, boolean> | undefined>(
  item: T | null,
  select?: S,
) {
  if (!item || !select) {
    return item;
  }

  const output: Record<string, unknown> = {};
  for (const key of Object.keys(select)) {
    if (select[key]) {
      output[key] = item[key];
    }
  }

  return output;
}

async function createInitialStore() {
  const timestamp = now();
  const adminConfig = getAdminSeedConfig();
  const passwordHash = await createPasswordHash(adminConfig.password);

  return {
    adminUsers: [
      {
        id: randomUUID(),
        name: adminConfig.name,
        email: adminConfig.email,
        passwordHash,
        role: "admin",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    siteSettings: {
      ...fallbackSettings,
      updatedAt: timestamp,
    },
    productVerifications: [
      {
        id: randomUUID(),
        brandName: "PureSphere Bio",
        productName: "Focus Matrix Nootropic",
        category: "Nootropics",
        upc: "850000774001",
        verificationCode: "RLP-774-O",
        lotNumber: "774-O",
        certificateStatus: "ACTIVE",
        status: "VERIFIED",
        purityScore: 99.8,
        contaminants: "None detected",
        activeIngredients: "Label sync 100%",
        notes: "Verified via multi-point laboratory assessment.",
        badgeLabel: "PLATINUM",
        servingSize: null,
        supplementFactsCsv: null,
        supplementFactsFileName: null,
        analyteResultsJson: null,
        verificationPdfBase64: null,
        verificationPdfFileName: null,
        verificationSearchText: null,
        verifiedAt: null,
        hero: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: randomUUID(),
        brandName: "VitalExtracts",
        productName: "Herbal Support Complex",
        category: "Herbal Support",
        upc: "850000774002",
        verificationCode: "RLP-902-A",
        lotNumber: "902-A",
        certificateStatus: "ACTIVE",
        status: "VERIFIED",
        purityScore: 100,
        contaminants: "Heavy metals under threshold",
        activeIngredients: "Organic traceability confirmed",
        notes: "Batch passed HPLC and mass spectrometry review.",
        badgeLabel: "GOLD",
        servingSize: null,
        supplementFactsCsv: null,
        supplementFactsFileName: null,
        analyteResultsJson: null,
        verificationPdfBase64: null,
        verificationPdfFileName: null,
        verificationSearchText: null,
        verifiedAt: null,
        hero: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: randomUUID(),
        brandName: "Zenith Nutrition",
        productName: "Performance Greens",
        category: "Performance",
        upc: "850000774003",
        verificationCode: "RLP-921-K",
        lotNumber: "921-K",
        certificateStatus: "ACTIVE",
        status: "VERIFIED",
        purityScore: 98.9,
        contaminants: "None detected",
        activeIngredients: "Actives within tolerance",
        notes: "Random retail pull matched the submitted dossier.",
        badgeLabel: "CERTIFIED",
        servingSize: null,
        supplementFactsCsv: null,
        supplementFactsFileName: null,
        analyteResultsJson: null,
        verificationPdfBase64: null,
        verificationPdfFileName: null,
        verificationSearchText: null,
        verifiedAt: null,
        hero: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    blogPosts: [
      {
        id: randomUUID(),
        title: "The Wild West of Wellness: Why I Founded Right Label Proven",
        slug: "the-wild-west-of-wellness",
        excerpt:
          "Inside a supplement aisle, marketing often speaks louder than chemistry. Right Label Proven was built to restore the lab as the source of truth.",
        category: "Founder's Letter",
        authorName: "Dr. Richard H. Sterling",
        coverImage: LOCAL_SECTION_IMAGE,
        featured: true,
        publishedAt: "2026-01-16T15:52:41.000Z",
        contentHtml: `
          <p>In the laboratory, numbers do not lie. Mass spectrometry does not have a marketing budget. A chromatogram does not care about your brand story. In the lab, there is only truth.</p>
          <p>Walk down the supplement aisle of your local pharmacy or scroll through the top sellers on a marketplace and you enter a very different environment. Claims get louder, labels get shinier, and transparency gets thinner. That gap between label and reality is exactly why Right Label Proven exists.</p>
          <h2>Truth needs infrastructure</h2>
          <p>Consumers should not need a chemistry degree to know whether a product is real, safe, and formulated as promised. Honest manufacturers should not be forced to compete with brands cutting corners in the dark.</p>
          <p>We built Right Label Proven to make third-party verification visible, searchable, and accountable. Our work starts with blind retail acquisition, continues through independent lab analysis, and ends only when the data can stand on its own.</p>
          <h2>What we are building</h2>
          <p>Right Label Proven is not a badge mill. It is a system. Products are reviewed against documentation, tested through accredited methods, and surfaced in a public verification layer that gives both shoppers and brands a shared source of truth.</p>
          <p>If the future of supplements is going to be better, it will not happen through louder marketing. It will happen through better evidence.</p>
        `,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    contactSubmissions: [],
    applicationSubmissions: [],
    verificationSearchAudits: [],
  } satisfies Store;
}

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Store;
    const adminConfig = getAdminSeedConfig();
    const primaryAdmin = parsed.adminUsers[0];
    let needsWrite = false;

    if (!primaryAdmin?.passwordHash) {
      parsed.adminUsers[0].passwordHash = await createPasswordHash(adminConfig.password);
      parsed.adminUsers[0].name = adminConfig.name;
      parsed.adminUsers[0].email = adminConfig.email;
      needsWrite = true;
    } else if (parsed.adminUsers.length === 1) {
      if (primaryAdmin.name !== adminConfig.name) {
        primaryAdmin.name = adminConfig.name;
        needsWrite = true;
      }

      if (primaryAdmin.email !== adminConfig.email) {
        primaryAdmin.email = adminConfig.email;
        needsWrite = true;
      }

      const passwordMatches = await verifyPasswordHash(adminConfig.password, primaryAdmin.passwordHash);
      if (!passwordMatches) {
        primaryAdmin.passwordHash = await createPasswordHash(adminConfig.password);
        needsWrite = true;
      }
      if (needsWrite) {
        primaryAdmin.updatedAt = now();
      }
    }

    for (const post of parsed.blogPosts) {
      if (post.coverImage === LEGACY_SECTION_IMAGE) {
        post.coverImage = LOCAL_SECTION_IMAGE;
        post.updatedAt = now();
        needsWrite = true;
      }
    }

    if (!parsed.siteSettings.issuingEntityName) {
      parsed.siteSettings.issuingEntityName = parsed.siteSettings.organizationName;
      parsed.siteSettings.updatedAt = now();
      needsWrite = true;
    }

    for (const product of parsed.productVerifications) {
      const normalizedProduct = {
        servingSize: product.servingSize ?? null,
        supplementFactsCsv: product.supplementFactsCsv ?? null,
        supplementFactsFileName: product.supplementFactsFileName ?? null,
        analyteResultsJson: product.analyteResultsJson ?? null,
        verificationPdfBase64: product.verificationPdfBase64 ?? null,
        verificationPdfFileName: product.verificationPdfFileName ?? null,
        verificationSearchText: product.verificationSearchText ?? null,
        verifiedAt: product.verifiedAt ?? null,
      };

      for (const [key, value] of Object.entries(normalizedProduct)) {
        if (product[key as keyof ProductVerificationRecord] !== value) {
          (product as Record<string, unknown>)[key] = value;
          needsWrite = true;
        }
      }
    }

    if (needsWrite) {
      await writeFile(STORE_PATH, JSON.stringify(parsed, null, 2));
    }

    return parsed;
  } catch {
    const initialStore = await createInitialStore();
    await writeFile(STORE_PATH, JSON.stringify(initialStore, null, 2));
    return initialStore;
  }
}

async function saveStore(store: Store) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

export const jsonPrisma = {
  adminUser: {
    async findUnique({
      where,
      select,
    }: {
      where: { id?: string; email?: string };
      select?: Record<string, boolean>;
    }) {
      const store = await ensureStore();
      const item =
        store.adminUsers.find((user) => {
          if (where.id) {
            return user.id === where.id;
          }

          if (where.email) {
            return user.email === where.email;
          }

          return false;
        }) ?? null;

      return applySelect(item, select);
    },
    async findFirst({
      orderBy,
      select,
    }: {
      orderBy?: Record<string, OrderDirection> | Array<Record<string, OrderDirection>>;
      select?: Record<string, boolean>;
    } = {}) {
      const store = await ensureStore();
      const sorted = sortByOrder(store.adminUsers, orderBy);
      return applySelect(sorted[0] ?? null, select);
    },
    async create({
      data,
      select,
    }: {
      data: Omit<AdminUserRecord, "id" | "createdAt" | "updatedAt">;
      select?: Record<string, boolean>;
    }) {
      const store = await ensureStore();
      const record: AdminUserRecord = {
        ...data,
        id: randomUUID(),
        createdAt: now(),
        updatedAt: now(),
      };
      store.adminUsers.push(record);
      await saveStore(store);
      return applySelect(record, select);
    },
    async update({
      where,
      data,
      select,
    }: {
      where: { id?: string; email?: string };
      data: Partial<AdminUserRecord>;
      select?: Record<string, boolean>;
    }) {
      const store = await ensureStore();
      const index = store.adminUsers.findIndex((user) => {
        if (where.id) {
          return user.id === where.id;
        }

        if (where.email) {
          return user.email === where.email;
        }

        return false;
      });

      if (index === -1) {
        throw new Error("Admin user not found");
      }

      store.adminUsers[index] = {
        ...store.adminUsers[index],
        ...data,
        updatedAt: now(),
      };
      await saveStore(store);
      return applySelect(store.adminUsers[index], select);
    },
  },
  siteSettings: {
    async findUnique(args?: { where?: { id: string } }) {
      void args;
      const store = await ensureStore();
      return store.siteSettings;
    },
    async upsert({
      update,
      create,
    }: {
      where: { id: string };
      update: Partial<SiteSettingsRecord>;
      create: Omit<SiteSettingsRecord, "updatedAt"> | SiteSettingsRecord;
    }) {
      const store = await ensureStore();
      store.siteSettings = {
        ...(store.siteSettings || create),
        ...update,
        updatedAt: now(),
      };
      await saveStore(store);
      return store.siteSettings;
    },
  },
  productVerification: {
    async findMany({
      where,
      orderBy,
      take,
    }: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, OrderDirection> | Array<Record<string, OrderDirection>>;
      take?: number;
    } = {}) {
      const store = await ensureStore();
      return applyTake(sortByOrder(applyWhere(store.productVerifications, where), orderBy), take);
    },
    async findUnique({ where }: { where: { id?: string; verificationCode?: string } }) {
      const store = await ensureStore();
      return (
        store.productVerifications.find((item) => {
          if (where.id) {
            return item.id === where.id;
          }
          if (where.verificationCode) {
            return item.verificationCode === where.verificationCode;
          }
          return false;
        }) ?? null
      );
    },
    async create({ data }: { data: Omit<ProductVerificationRecord, "id" | "createdAt" | "updatedAt"> }) {
      const store = await ensureStore();
      const record: ProductVerificationRecord = {
        ...data,
        id: randomUUID(),
        createdAt: now(),
        updatedAt: now(),
      };
      store.productVerifications.unshift(record);
      await saveStore(store);
      return record;
    },
    async update({ where, data }: { where: { id: string }; data: Partial<ProductVerificationRecord> }) {
      const store = await ensureStore();
      const index = store.productVerifications.findIndex((item) => item.id === where.id);
      if (index === -1) {
        throw new Error("Product not found");
      }
      store.productVerifications[index] = {
        ...store.productVerifications[index],
        ...data,
        updatedAt: now(),
      };
      await saveStore(store);
      return store.productVerifications[index];
    },
    async delete({ where }: { where: { id: string } }) {
      const store = await ensureStore();
      store.productVerifications = store.productVerifications.filter((item) => item.id !== where.id);
      await saveStore(store);
    },
    async count() {
      const store = await ensureStore();
      return store.productVerifications.length;
    },
  },
  blogPost: {
    async findMany({
      orderBy,
      take,
    }: {
      orderBy?: Record<string, OrderDirection> | Array<Record<string, OrderDirection>>;
      take?: number;
    } = {}) {
      const store = await ensureStore();
      return applyTake(sortByOrder(store.blogPosts, orderBy), take);
    },
    async findUnique({ where }: { where: { slug?: string; id?: string } }) {
      const store = await ensureStore();
      return (
        store.blogPosts.find((item) => {
          if (where.slug) {
            return item.slug === where.slug;
          }
          if (where.id) {
            return item.id === where.id;
          }
          return false;
        }) ?? null
      );
    },
    async create({ data }: { data: Omit<BlogPostRecord, "id" | "createdAt" | "updatedAt"> }) {
      const store = await ensureStore();
      const record: BlogPostRecord = {
        ...data,
        id: randomUUID(),
        createdAt: now(),
        updatedAt: now(),
      };
      store.blogPosts.unshift(record);
      await saveStore(store);
      return record;
    },
    async update({ where, data }: { where: { id: string }; data: Partial<BlogPostRecord> }) {
      const store = await ensureStore();
      const index = store.blogPosts.findIndex((item) => item.id === where.id);
      if (index === -1) {
        throw new Error("Post not found");
      }
      store.blogPosts[index] = {
        ...store.blogPosts[index],
        ...data,
        updatedAt: now(),
      };
      await saveStore(store);
      return store.blogPosts[index];
    },
    async delete({ where }: { where: { id: string } }) {
      const store = await ensureStore();
      store.blogPosts = store.blogPosts.filter((item) => item.id !== where.id);
      await saveStore(store);
    },
    async count() {
      const store = await ensureStore();
      return store.blogPosts.length;
    },
  },
  contactSubmission: {
    async findMany({
      orderBy,
      take,
    }: {
      orderBy?: Record<string, OrderDirection> | Array<Record<string, OrderDirection>>;
      take?: number;
    } = {}) {
      const store = await ensureStore();
      return applyTake(sortByOrder(store.contactSubmissions, orderBy), take);
    },
    async create({
      data,
    }: {
      data: Omit<ContactSubmissionRecord, "id" | "createdAt" | "updatedAt" | "status"> & {
        status?: string;
      };
    }) {
      const store = await ensureStore();
      const record: ContactSubmissionRecord = {
        ...data,
        id: randomUUID(),
        status: data.status || "NEW",
        createdAt: now(),
        updatedAt: now(),
      };
      store.contactSubmissions.unshift(record);
      await saveStore(store);
      return record;
    },
    async update({ where, data }: { where: { id: string }; data: Partial<ContactSubmissionRecord> }) {
      const store = await ensureStore();
      const index = store.contactSubmissions.findIndex((item) => item.id === where.id);
      if (index === -1) {
        throw new Error("Submission not found");
      }
      store.contactSubmissions[index] = {
        ...store.contactSubmissions[index],
        ...data,
        updatedAt: now(),
      };
      await saveStore(store);
      return store.contactSubmissions[index];
    },
    async count() {
      const store = await ensureStore();
      return store.contactSubmissions.length;
    },
  },
  applicationSubmission: {
    async findMany({
      orderBy,
      take,
    }: {
      orderBy?: Record<string, OrderDirection> | Array<Record<string, OrderDirection>>;
      take?: number;
    } = {}) {
      const store = await ensureStore();
      return applyTake(sortByOrder(store.applicationSubmissions, orderBy), take);
    },
    async create({
      data,
    }: {
      data: Omit<ApplicationSubmissionRecord, "id" | "createdAt" | "updatedAt" | "status"> & {
        status?: string;
      };
    }) {
      const store = await ensureStore();
      const record: ApplicationSubmissionRecord = {
        ...data,
        id: randomUUID(),
        status: data.status || "NEW",
        createdAt: now(),
        updatedAt: now(),
      };
      store.applicationSubmissions.unshift(record);
      await saveStore(store);
      return record;
    },
    async update({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<ApplicationSubmissionRecord>;
    }) {
      const store = await ensureStore();
      const index = store.applicationSubmissions.findIndex((item) => item.id === where.id);
      if (index === -1) {
        throw new Error("Application not found");
      }
      store.applicationSubmissions[index] = {
        ...store.applicationSubmissions[index],
        ...data,
        updatedAt: now(),
      };
      await saveStore(store);
      return store.applicationSubmissions[index];
    },
    async count() {
      const store = await ensureStore();
      return store.applicationSubmissions.length;
    },
  },
  verificationSearchAudit: {
    async create({
      data,
    }: {
      data: Omit<VerificationSearchAuditRecord, "id" | "createdAt">;
    }) {
      const store = await ensureStore();
      const record: VerificationSearchAuditRecord = {
        ...data,
        id: randomUUID(),
        createdAt: now(),
      };
      store.verificationSearchAudits.unshift(record);
      await saveStore(store);
      return record;
    },
  },
};
