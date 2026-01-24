import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

const DEFAULT_EMAIL = "test_user@example.com";

function getArgValue(flag: string) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

async function run() {
  const email = getArgValue("--email")?.trim().toLowerCase() ?? DEFAULT_EMAIL;
  const password = getArgValue("--password");

  if (!password) {
    throw new Error("Missing --password. Provide a password via CLI arguments.");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`User already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: {
        create: {},
      },
    },
  });

  console.log(`Created user ${user.email} with id ${user.id}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
