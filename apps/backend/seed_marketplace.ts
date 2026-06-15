import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'borneelphukan@gmail.com';
  const user = await prisma.users.findUnique({ where: { email } });

  if (!user) {
    console.error(`User ${email} not found.`);
    return;
  }

  console.log(`Adding marketplace products for ${email} (ID: ${user.user_id})...`);

  const productsData = [
    {
      user_id: user.user_id,
      name: 'Organic Honey (500g)',
      description: 'Pure, raw, unfiltered organic honey harvested directly from our apiary.',
      category: 'Apiculture',
      price: 15.99,
      units: 'jars',
      quantity: 50,
      status: 'PUBLISHED' as any,
      published_at: new Date(),
      images: ['https://example.com/honey.jpg'],
    },
    {
      user_id: user.user_id,
      name: 'Farm Fresh Eggs (1 Dozen)',
      description: 'Free-range, pasture-raised organic brown eggs.',
      category: 'Poultry',
      price: 5.49,
      units: 'dozen',
      quantity: 200,
      status: 'PUBLISHED' as any,
      published_at: new Date(),
      images: ['https://example.com/eggs.jpg'],
    },
    {
      user_id: user.user_id,
      name: 'Fresh Cow Milk (1 Gallon)',
      description: 'Raw, unpasteurized milk from grass-fed cows.',
      category: 'Cattle Rearing',
      price: 8.99,
      units: 'gallons',
      quantity: 30,
      status: 'PUBLISHED' as any,
      published_at: new Date(),
      images: ['https://example.com/milk.jpg'],
    },
    {
      user_id: user.user_id,
      name: 'Premium Rose Bouquets',
      description: 'Hand-picked, freshly cut red and pink rose bouquets.',
      category: 'Floriculture',
      price: 24.99,
      units: 'bouquets',
      quantity: 15,
      status: 'PUBLISHED' as any,
      published_at: new Date(),
      images: ['https://example.com/roses.jpg'],
    },
    {
      user_id: user.user_id,
      name: 'Organic Manure (50lb bag)',
      description: 'Composted cattle manure, excellent fertilizer for gardens.',
      category: 'Cattle Rearing',
      price: 12.50,
      units: 'bags',
      quantity: 100,
      status: 'DRAFT' as any,
      images: ['https://example.com/manure.jpg'],
    }
  ];

  await prisma.marketplace_products.createMany({
    data: productsData,
  });

  console.log(`Successfully added ${productsData.length} products to the marketplace!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
