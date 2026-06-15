import { PrismaClient } from '@prisma/client';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Kevin', 'Linda', 'Mike', 'Nancy', 'Oscar', 'Peggy', 'Quinn', 'Rachel', 'Sam', 'Tina'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson'];
const companyNames = ['TechCorp', 'InnoSys', 'Global Net', 'Alpha Solutions', 'Beta Dynamics', 'Gamma Core', 'Delta Flow', 'Omega Tech', 'Zeta Enterprises', 'Epsilon Data', 'Sigma Systems', 'Theta Group', 'Kappa LLC', 'Lambda Inc', 'Mu Partners', 'Nu Ventures', 'Xi Corp', 'Omicron Holdings', 'Pi Services', 'Rho Technologies'];
const contractNames = ['Website Revamp', 'Mobile App Dev', 'SEO Optimization', 'Cloud Migration', 'Security Audit', 'Data Analysis', 'Marketing Campaign', 'Network Setup', 'Hardware Upgrade', 'Software Training', 'CRM Implementation', 'ERP Customization', 'API Integration', 'Payment Gateway', 'UI/UX Design', 'Database Tuning', 'Content Creation', 'Social Media Strategy', 'Email Marketing', 'Analytics Dashboard'];

async function main() {
  const targetEmails = ['borneelphukan@gmail.com', 'phukanborneel@gmail.com'];
  
  for (const email of targetEmails) {
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`User ${email} not found.`);
      continue;
    }

    const userId = user.user_id;
    console.log(`Seeding data for user ${email} (ID: ${userId})...`);

    // Add 20 contacts
    const contactsData: any[] = [];
    for (let i = 0; i < 20; i++) {
      contactsData.push({
        user_id: userId,
        first_name: firstNames[i],
        last_name: lastNames[i],
        email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}_${i}@example.com`,
        phone_number: `+1555${i.toString().padStart(2, '0')}${Date.now().toString().slice(-4)}`,
        type: i % 2 === 0 ? 'Vendor' : 'Customer',
      });
    }
    await prisma.contacts.createMany({ data: contactsData });
    console.log(`- Added 20 contacts`);

    // Add 20 companies
    const companiesData: any[] = [];
    for (let i = 0; i < 20; i++) {
      companiesData.push({
        user_id: userId,
        company_name: `${companyNames[i]} - ${userId} - ${i}`,
        contact_person: `${firstNames[i]} ${lastNames[i]}`,
        email: `contact_${i}@${companyNames[i].replace(/\s/g, '').toLowerCase()}.com`,
        phone_number: `+1555${(i+20).toString().padStart(2, '0')}${Date.now().toString().slice(-4)}`,
        address_line_1: `${100 + i} Main St`,
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
      });
    }
    await prisma.companies.createMany({ data: companiesData });
    console.log(`- Added 20 companies`);

    // Add 20 contracts
    const contractsData: any[] = [];
    for (let i = 0; i < 20; i++) {
      contractsData.push({
        user_id: userId,
        contract_name: `${contractNames[i]} - ${userId}`,
        partner: companyNames[i],
        amount: (i + 1) * 1000,
        stage: i % 3 === 0 ? 'Won' : i % 3 === 1 ? 'Lost' : 'Negotiation',
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      });
    }
    await prisma.contracts.createMany({ data: contractsData });
    console.log(`- Added 20 contracts`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
