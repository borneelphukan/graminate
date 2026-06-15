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

  const userId = user.user_id;
  console.log(`Adding financial and floriculture data for ${email} (ID: ${userId})...`);

  // 1. Add 5 Flowers to Floriculture
  const flowersData = [
    { user_id: userId, flower_name: 'Rose', flower_type: 'Perennial', method: 'Greenhouse', planting_date: new Date('2024-01-10'), plants: 500 },
    { user_id: userId, flower_name: 'Tulip', flower_type: 'Bulb', method: 'Open Field', planting_date: new Date('2024-02-15'), plants: 1000 },
    { user_id: userId, flower_name: 'Lily', flower_type: 'Perennial', method: 'Greenhouse', planting_date: new Date('2024-03-20'), plants: 300 },
    { user_id: userId, flower_name: 'Sunflower', flower_type: 'Annual', method: 'Open Field', planting_date: new Date('2024-04-05'), plants: 800 },
    { user_id: userId, flower_name: 'Orchid', flower_type: 'Epiphyte', method: 'Indoor', planting_date: new Date('2024-05-12'), plants: 150 },
  ];
  await prisma.floriculture.createMany({ data: flowersData });
  console.log('- Added 5 Flowers to Floriculture');

  // 2. Add Financial Data (Expenses)
  const expensesData: any[] = [];
  const expenseCategories = ['Farm Utilities', 'Agricultural Feeds', 'Consulting', 'Electricity', 'Labour Salary', 'Water Supply', 'Taxes', 'Others'];
  const occupations = ['Poultry', 'Apiculture', 'Cattle Rearing', 'Floriculture'];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // random date within last 60 days
    expensesData.push({
      user_id: userId,
      title: `Expense ${i + 1}`,
      occupation: occupations[Math.floor(Math.random() * occupations.length)],
      category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
      expense: Math.floor(Math.random() * 500) + 50,
      date_created: date,
    });
  }
  await prisma.expenses.createMany({ data: expensesData });
  console.log('- Added 30 Expenses');

  // 3. Add Financial Data (Sales)
  const salesData: any[] = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // random date within last 60 days
    salesData.push({
      user_id: userId,
      sales_name: `Sale Transaction ${i + 1}`,
      sales_date: date,
      occupation: occupations[Math.floor(Math.random() * occupations.length)],
      items_sold: ['Product A', 'Product B'],
      quantities_sold: [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 5) + 1],
      prices_per_unit: [Math.floor(Math.random() * 50) + 10, Math.floor(Math.random() * 30) + 10],
      quantity_unit: 'units',
      invoice_created: false,
    });
  }
  
  for (const sale of salesData) {
    await prisma.sales.create({ data: sale });
  }
  console.log('- Added 30 Sales Transactions');

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
