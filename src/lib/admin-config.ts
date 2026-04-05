function normalizeAdminAccount(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

export function getAdminEmailFromAccount(account: string) {
  return `${normalizeAdminAccount(account)}@admin.rightlabelproven.local`;
}

export function getAdminSeedConfig() {
  const account = normalizeAdminAccount(process.env.ADMIN_ACCOUNT || "admin");

  return {
    name: "RLP Administrator",
    account,
    email: getAdminEmailFromAccount(account),
    password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
  };
}
