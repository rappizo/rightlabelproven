import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminSeedConfig, normalizeAdminAccount } from "@/lib/admin-config";
import { createPasswordHash, verifyPasswordHash } from "@/lib/passwords";
import { prisma } from "@/lib/prisma";

const ADMIN_COOKIE = "rlp_admin_session";

type AdminRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
};

function getSecret() {
  return new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || "development-only-secret-change-me",
  );
}

export async function verifyPassword(password: string, hash: string) {
  return verifyPasswordHash(password, hash);
}

async function syncConfiguredAdminRecord() {
  const adminConfig = getAdminSeedConfig();
  const select = {
    id: true,
    name: true,
    email: true,
    passwordHash: true,
    role: true,
  } as const;

  let admin = (await prisma.adminUser.findUnique({
    where: { email: adminConfig.email },
    select,
  })) as AdminRecord | null;

  if (!admin) {
    const legacyAdmin = (await prisma.adminUser.findFirst({
      orderBy: { createdAt: "asc" },
      select,
    })) as AdminRecord | null;
    const passwordHash = await createPasswordHash(adminConfig.password);

    if (legacyAdmin) {
      admin = (await prisma.adminUser.update({
        where: { id: legacyAdmin.id },
        data: {
          name: adminConfig.name,
          email: adminConfig.email,
          passwordHash,
        },
        select,
      })) as AdminRecord;
    } else {
      admin = (await prisma.adminUser.create({
        data: {
          name: adminConfig.name,
          email: adminConfig.email,
          passwordHash,
          role: "admin",
        },
        select,
      })) as AdminRecord;
    }
  }

  const passwordMatches = await verifyPasswordHash(adminConfig.password, admin.passwordHash);
  if (!passwordMatches || admin.name !== adminConfig.name || admin.email !== adminConfig.email) {
    admin = (await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        name: adminConfig.name,
        email: adminConfig.email,
        passwordHash: await createPasswordHash(adminConfig.password),
      },
      select,
    })) as AdminRecord;
  }

  return {
    admin,
    adminConfig,
  };
}

export async function authenticateConfiguredAdmin(account: string, password: string) {
  const normalizedAccount = normalizeAdminAccount(account);
  const { admin, adminConfig } = await syncConfiguredAdminRecord();

  if (normalizedAccount !== adminConfig.account) {
    return null;
  }

  if (password !== adminConfig.password) {
    return null;
  }

  return admin;
}

export async function createAdminSession(adminUserId: string, email: string) {
  const token = await new SignJWT({ adminUserId, email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const adminUserId = typeof payload.adminUserId === "string" ? payload.adminUserId : null;
    if (!adminUserId) {
      return null;
    }

    return (await prisma.adminUser.findUnique({
      where: { id: adminUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })) as { id: string; name: string; email: string; role: string } | null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
