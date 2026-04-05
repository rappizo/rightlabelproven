import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyPasswordHash } from "@/lib/passwords";
import { prisma } from "@/lib/prisma";

const ADMIN_COOKIE = "rlp_admin_session";

function getSecret() {
  return new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || "development-only-secret-change-me",
  );
}

export async function verifyPassword(password: string, hash: string) {
  return verifyPasswordHash(password, hash);
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
