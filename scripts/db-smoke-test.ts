import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const email = `smoke_${Date.now()}@example.com`;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: "smoke_test_hash",
      profile: {
        create: {},
      },
    },
    include: {
      profile: true,
    },
  });

  const fetched = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!fetched) {
    throw new Error("Smoke test failed: user not found after create.");
  }

  await prisma.user.delete({
    where: { id: user.id },
  });
}

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
