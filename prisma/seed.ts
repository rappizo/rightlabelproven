import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { getAdminSeedConfig } from "../src/lib/admin-config";
import { createPasswordHash } from "../src/lib/passwords";

const prisma = new PrismaClient();
const localSectionImage = "/media/blog/section2.jpg";

async function main() {
  const adminConfig = getAdminSeedConfig();
  const passwordHash = await createPasswordHash(adminConfig.password);

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminConfig.email },
  });

  if (existingAdmin) {
    await prisma.adminUser.update({
      where: { email: adminConfig.email },
      data: {
        name: adminConfig.name,
        passwordHash,
      },
    });
  } else {
    const legacyAdmin = await prisma.adminUser.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (legacyAdmin) {
      await prisma.adminUser.update({
        where: { id: legacyAdmin.id },
        data: {
          name: adminConfig.name,
          email: adminConfig.email,
          passwordHash,
        },
      });
    } else {
      await prisma.adminUser.create({
        data: {
          name: adminConfig.name,
          email: adminConfig.email,
          passwordHash,
        },
      });
    }
  }

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      organizationName: "Right Label Proven",
      issuingEntityName: "Right Label Proven, Inc.",
      heroTagline: "RLP Launch Phase",
      heroHeadline: "The New Standard in Supplement Transparency",
      heroSubheadline:
        "Moving beyond basic labels. Our verification ecosystem provides real-time laboratory precision for every batch, verified by independent scientific scrutiny.",
      supportEmail: "support@rightlabelproven.org",
      supportPhone: "1-888-555-0142",
      supportHours: "Mon-Fri, 9:00 AM - 5:00 PM (EST)",
      addressLine1: "800 Innovation Drive, Suite 400",
      addressLine2: "Research Triangle Park, NC 27709, United States",
      footerStatement: "Scientific Integrity through Organic Transparency.",
    },
  });

  const products = [
    {
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
      hero: true,
    },
    {
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
      hero: true,
    },
    {
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
      hero: true,
    },
  ];

  for (const product of products) {
    await prisma.productVerification.upsert({
      where: { verificationCode: product.verificationCode },
      update: {},
      create: product,
    });
  }

  const founderLetter = {
    title: "The Wild West of Wellness: Why I Founded Right Label Proven",
    slug: "the-wild-west-of-wellness",
    excerpt:
      "Inside a supplement aisle, marketing often speaks louder than chemistry. Right Label Proven was built to restore the lab as the source of truth.",
    category: "Founder's Letter",
    authorName: "Dr. Richard H. Sterling",
    coverImage: localSectionImage,
    featured: true,
    publishedAt: new Date("2026-01-16T15:52:41Z"),
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
  };

  await prisma.blogPost.upsert({
    where: { slug: founderLetter.slug },
    update: founderLetter,
    create: founderLetter,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
