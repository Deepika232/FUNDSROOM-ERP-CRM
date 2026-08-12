import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";

const SALT_ROUNDS = 12;

async function ensureAdminUser(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@test.com";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.warn(
      "ADMIN_PASSWORD not set. Skipping admin user seed. Set ADMIN_PASSWORD in Render to enable admin auto-creation if missing.",
    );
    return;
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail.toLowerCase() },
  });

  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME ?? "Admin",
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`Seeded admin user ${adminEmail}`);
}

const startServer = async (): Promise<void> => {
  await ensureAdminUser();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
