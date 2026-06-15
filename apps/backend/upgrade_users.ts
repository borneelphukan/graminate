import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.users.updateMany({
    where: {
      email: {
        in: ['borneelphukan@gmail.com', 'phukanborneel@gmail.com'],
      },
    },
    data: {
      plan: 'PRO',
    },
  });

  console.log(`Updated ${result.count} users to PRO.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
