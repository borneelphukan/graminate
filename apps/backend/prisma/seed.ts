import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:borneel1999@localhost:5433/graminate";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Starting Ultra-Comprehensive Database Seed Process ---');

  // 1. Clear all data
  console.log('Truncating tables...');
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"${name}"`)
    .join(', ');

  try {
    if (tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
      console.log('✅ Database truncated.');
    }
  } catch (error) {
    console.error('❌ Error during truncation:', error);
    return;
  }

  // 2. Create User
  const hashedPassword = await argon2.hash('password123', {
    type: argon2.argon2id,
    hashLength: 16,
    timeCost: 2,
    memoryCost: 2 ** 16,
    parallelism: 1,
  });

  const user = await prisma.users.create({
    data: {
      first_name: 'Borneel',
      last_name: 'Phukan',
      email: 'borneelphukan@gmail.com',
      phone_number: '1234567890',
      password: hashedPassword,
      business_name: 'Graminate Agro-Industrial Complex',
      type: 'Producer',
      sub_type: ['Poultry', 'Cattle Rearing', 'Apiculture'],
      plan: 'PRO',
      address_line_1: 'Agri Business Park, Sector 4',
      city: 'Guwahati',
      state: 'Assam',
      postal_code: '781001',
      widgets: ['Task Calendar', 'Weather Monitor', 'Finance Overview', 'Inventory Status', 'CRM Insights', 'Production Heatmap'],
    },
  });

  const userId = user.user_id;

  // 3. Setup Date Range
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // --- 4. STATIC ENTITIES SETUP ---
  console.log('Setting up static entities...');
  
  // Poultry Flocks
  const flocks = await Promise.all([
    prisma.poultry_flock.create({ data: { user_id: userId, flock_name: 'Layer Flock-A', flock_type: 'Layers', quantity: 2000, breed: 'Leghorn', housing_type: 'Caged' } }),
    prisma.poultry_flock.create({ data: { user_id: userId, flock_name: 'Broiler Flock-C', flock_type: 'Broilers', quantity: 3500, breed: 'Cobb 500', housing_type: 'Deep Litter' } })
  ]);

  // Cattle Herds
  const cattleUnits = await Promise.all([
    prisma.cattle_rearing.create({ data: { user_id: userId, cattle_name: 'Dairy Unit Alpha', cattle_type: 'Cows', number_of_animals: 30, purpose: 'Milk Production' } }),
    prisma.cattle_rearing.create({ data: { user_id: userId, cattle_name: 'Goat Dairy Beta', cattle_type: 'Goat', number_of_animals: 50, purpose: 'Milk Production' } })
  ]);

  // Apiculture
  const apiary = await prisma.apiculture.create({ data: { user_id: userId, apiary_name: 'Summit Apiaries', area: 12.0, city: 'Guwahati' } });
  const hives = await Promise.all([
    prisma.bee_hives.create({ data: { apiary_id: apiary.apiary_id, hive_name: 'Hive-Alpha', hive_type: 'Langstroth', bee_species: 'Apis mellifera' } }),
    prisma.bee_hives.create({ data: { apiary_id: apiary.apiary_id, hive_name: 'Hive-Beta', hive_type: 'Top-Bar', bee_species: 'Apis cerana' } })
  ]);

  // Warehouse/Inventory
  const warehouse = await prisma.warehouse.create({ data: { user_id: userId, name: 'Main Depot', type: 'Cold Storage', storage_capacity: 10000, city: 'Guwahati', state: 'Assam' } });
  const dryStorage = await prisma.warehouse.create({ data: { user_id: userId, name: 'Dry Grain Silo', type: 'Cold Storage', storage_capacity: 50000, city: 'Nalbari', state: 'Assam' } });
  
  await prisma.inventory.create({ data: { user_id: userId, item_name: 'Soybean Meal', item_group: 'Poultry', units: 'bags', quantity: 150, price_per_unit: 800, warehouse_id: warehouse.warehouse_id, feed: true } });
  await prisma.inventory.create({ data: { user_id: userId, item_name: 'Maize Feed', item_group: 'Poultry', units: 'kg', quantity: 5000, price_per_unit: 25, warehouse_id: dryStorage.warehouse_id, feed: true } });
  await prisma.inventory.create({ data: { user_id: userId, item_name: 'Cattle Mineral Mix', item_group: 'Cattle Rearing', units: 'kg', quantity: 200, price_per_unit: 45, warehouse_id: warehouse.warehouse_id, feed: true } });
  await prisma.inventory.create({ data: { user_id: userId, item_name: 'Sugar Syrup', item_group: 'Apiculture', units: 'liters', quantity: 100, price_per_unit: 60, warehouse_id: warehouse.warehouse_id, feed: true } });
  await prisma.inventory.create({ data: { user_id: userId, item_name: 'Bee Smoker Fuel', item_group: 'Apiculture', units: 'kg', quantity: 50, price_per_unit: 15, warehouse_id: warehouse.warehouse_id, feed: false } });

  // --- 5. CRM DATA (20 Records Each) ---
  console.log('Generating CRM data (Contacts, Companies, Deals, Invoices)...');
  const companies: any[] = [];
  for (let i = 1; i <= 20; i++) {
    const c = await prisma.companies.create({
      data: {
        user_id: userId,
        company_name: `Agricultural Solutions ${i}`,
        type: i % 2 === 0 ? 'Supplier' : 'Buyer',
        email: `contact${i}@agrisolutions.com`,
        address_line_1: `${i} Industrial Ave`,
        city: 'Guwahati',
        state: 'Assam',
        postal_code: '781001'
      }
    });
    companies.push(c);

    await prisma.contacts.create({
      data: {
        user_id: userId,
        first_name: `Agent${i}`,
        last_name: 'Agri',
        email: `agent${i}@example.com`,
        type: 'Vendor',
        city: 'Guwahati'
      }
    });

    await prisma.deals.create({
      data: {
        user_id: userId,
        deal_name: `Annual Supply Deal #${i}`,
        partner: c.company_name,
        amount: 10000 + (i * 2000),
        stage: i % 3 === 0 ? 'Closed Won' : 'Negotiation',
        start_date: new Date(year, month, 1),
        end_date: new Date(year, month + 11, 0)
      }
    });

    const inv = await prisma.invoices.create({
      data: {
        user_id: userId,
        title: `Production Invoice #${i}`,
        bill_to: c.company_name,
        due_date: new Date(year, month, daysInMonth),
        receipt_number: `INV-2026-${i.toString().padStart(3, '0')}`,
        tax: 50.0
      }
    });
    await prisma.invoice_items.create({ data: { invoice_id: inv.invoice_id, description: 'Bulk Feed Supply', quantity: 10, rate: 1000 } });
  }

  // --- 6. PROJECTS & TASKS ---
  console.log('Adding Projects & Task List items...');
  const businessProjects = ['Smart Irrigation', 'Methane Digestor', 'AI Grading System', 'Export Logistics', 'Heritage Breeding'];
  for (const p of businessProjects) {
    await prisma.kanban_columns.create({ data: { user_id: userId, project: p, title: 'To Do', position: 0 } });
    await prisma.kanban_columns.create({ data: { user_id: userId, project: p, title: 'In Progress', position: 1 } });
    await prisma.kanban_columns.create({ data: { user_id: userId, project: p, title: 'Done', position: 2 } });
  }

  const agriculturalTasks = [
    { project: 'Poultry', task: 'Morning Vaccinations', desc: 'Vaccinate Flock-A for Newcastle disease', priority: 'High' },
    { project: 'Poultry', task: 'Feed Inventory Audit', desc: 'Check levels of soybean meal and maize', priority: 'Medium' },
    { project: 'Poultry', task: 'Automation Check', desc: 'Verify automatic waterers in Shed 2', priority: 'Low' },
    { project: 'Cattle Rearing', task: 'Milk Hygiene Protocol', desc: 'Deep clean all milking machines', priority: 'High' },
    { project: 'Cattle Rearing', task: 'Vet Checkup', desc: 'Monthly health check for Dairy Unit Alpha', priority: 'Medium' },
    { project: 'Apiculture', task: 'Varroa Treatment', desc: 'Apply organic treatment to Hive-Alpha', priority: 'High' },
    { project: 'Apiculture', task: 'Supers Inspection', desc: 'Check if Hive-Beta needs new honey supers', priority: 'Medium' },
  ];

  for (const t of agriculturalTasks) {
    await prisma.tasks.create({
      data: {
        user_id: userId,
        project: t.project,
        task: t.task,
        description: t.desc,
        priority: t.priority,
        status: 'To Do',
        deadline: new Date(year, month, daysInMonth)
      }
    });
  }

  // --- 7. EMPLOYEES (LABOURS) ---
  console.log('Onboarding 10 Employees...');
  const employees = [
    { name: 'Arjun Das', role: 'Farm Manager', salary: 35000, gender: 'Male' },
    { name: 'Megha Baruah', role: 'Veterinarian', salary: 55000, gender: 'Female' },
    { name: 'Rohan Saikia', role: 'Poultry Supervisor', salary: 28000, gender: 'Male' },
    { name: 'Priya Kalita', role: 'Cattle Caretaker', salary: 22000, gender: 'Female' },
    { name: 'Jatin Bora', role: 'Apiary Technician', salary: 25000, gender: 'Male' },
    { name: 'Sunita Gogoi', role: 'Sales Coordinator', salary: 30000, gender: 'Female' },
    { name: 'Bikash Medhi', role: 'Warehouse Keeper', salary: 20000, gender: 'Male' },
    { name: 'Anita Devi', role: 'Accountant', salary: 32000, gender: 'Female' },
    { name: 'Rahul Sarma', role: 'Logistics Lead', salary: 27000, gender: 'Male' },
    { name: 'Nilam Bora', role: 'General Support', salary: 18000, gender: 'Female' },
  ];

  for (let i = 0; i < employees.length; i++) {
    const e = employees[i];
    await prisma.labours.create({
      data: {
        user_id: userId,
        full_name: e.name,
        role: e.role,
        base_salary: e.salary,
        gender: e.gender,
        contact_number: `98640${i}1234`,
        date_of_birth: new Date(1990 + i, 0, 1),
        aadhar_card_number: `12345678901${i}`,
        bank_name: 'State Bank of India',
        bank_account_number: `321654987${i}`,
        ifsc_code: 'SBIN0000123'
      }
    });
  }

  // --- 8. DYNAMIC DATA POPULATION (Honey, Inspection, Feed, Eggs) ---
  console.log('Populating detailed production and inspection records...');
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    // Poultry: Eggs (Grading)
    for (const flock of flocks) {
      if (flock.flock_type === 'Layers') {
        await prisma.poultry_eggs.create({
          data: {
            user_id: userId,
            flock_id: flock.flock_id,
            date_collected: date,
            small_eggs: 20 + Math.floor(Math.random() * 30),
            medium_eggs: 50 + Math.floor(Math.random() * 50),
            large_eggs: 100 + Math.floor(Math.random() * 100),
            extra_large_eggs: 10 + Math.floor(Math.random() * 20),
            total_eggs: 0,
            broken_eggs: Math.floor(Math.random() * 5)
          }
        });
      }

      // Poultry: Feed Status (Morning & Evening sessions)
      for (const session of ['Morning', 'Evening']) {
        await prisma.poultry_feeds.create({
          data: {
            user_id: userId,
            flock_id: flock.flock_id,
            feed_given: session === 'Morning' ? 'Starter Crumble' : 'Finisher Pellet',
            amount_given: 8.5 + Math.random() * 5,
            units: 'kg',
            feed_date: date
          }
        });
      }
    }

    // Cattle: Milk (Morning & Evening milking)
    for (const unit of cattleUnits) {
      for (const session of ['Morning', 'Evening']) {
        await prisma.cattle_milk.create({
          data: {
            user_id: userId,
            cattle_id: unit.cattle_id,
            date_collected: date,
            milk_produced: 10 + Math.random() * 15,
            animal_name: unit.cattle_name + (session === 'Morning' ? ' (AM)' : ' (PM)')
          }
        });
      }
    }

    // Apiculture: Hive Inspections (Weekly)
    if (day % 7 === 0) {
      for (const hive of hives) {
        await prisma.hive_inspection.create({
          data: {
            hive_id: hive.hive_id,
            inspection_date: date,
            queen_status: 'Healthy and Laying',
            brood_pattern: 'Solid',
            population_strength: 'High',
            frames_of_brood: 5,
            frames_of_nectar_honey: 3,
            frames_of_pollen: 1,
            notes: 'Strong colony activity observed.'
          }
        });
      }
    }

    // Apiculture: Honey Production (Weekly harvest for more data)
    if (day % 7 === 0) {
      for (const hive of hives) {
        await prisma.honey_production.create({
          data: {
            hive_id: hive.hive_id,
            harvest_date: date,
            honey_weight: 4.5 + Math.random() * 3,
            honey_type: day % 2 === 0 ? 'Wildflower' : 'Acacia',
            harvest_notes: 'Consistent quality.'
          }
        });
      }
    }

    // Financials: Daily Sales (Randomized mix of products)
    const saleCategories = [
      { name: 'Bulk Eggs', occupation: 'Poultry', items: ['Large Eggs'], units: 'trays', price: 180 },
      { name: 'Morning Milk', occupation: 'Cattle Rearing', items: ['Fresh Milk'], units: 'liters', price: 65 },
      { name: 'Premium Honey', occupation: 'Apiculture', items: ['Organic Honey'], units: 'kg', price: 450 },
      { name: 'Live Broilers', occupation: 'Poultry', items: ['Chicken'], units: 'birds', price: 250 },
    ];

    for (const sc of saleCategories) {
      if (Math.random() > 0.4) { // 60% chance of a sale per category per day
        const qty = 5 + Math.floor(Math.random() * 15);
        await prisma.sales.create({
          data: {
            user_id: userId,
            sales_date: date,
            sales_name: sc.name,
            occupation: sc.occupation,
            items_sold: sc.items,
            quantities_sold: [qty],
            prices_per_unit: [sc.price],
            quantity_unit: sc.units,
            invoice_created: true
          }
        });
      }
    }

    // Financials: Daily Expenses
    const expenseCategories = [
      { title: 'Electricity Bill', cat: 'Utilities', amount: 300, chance: 0.1 },
      { title: 'Animal Feed Top-up', cat: 'Feed', amount: 1500, chance: 0.3 },
      { title: 'Fuel for Transport', cat: 'Logistics', amount: 250, chance: 0.5 },
      { title: 'Medical Supplies', cat: 'Health', amount: 800, chance: 0.05 },
    ];

    for (const ec of expenseCategories) {
      if (Math.random() < ec.chance) {
        await prisma.expenses.create({
          data: {
            user_id: userId,
            title: ec.title,
            category: ec.cat,
            occupation: day % 2 === 0 ? 'Poultry' : 'Cattle Rearing',
            expense: ec.amount + (Math.random() * 100),
            date_created: date
          }
        });
      }
    }
  }

  console.log('--- 🚀 Ultra-Comprehensive Seeding Completed! ---');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
