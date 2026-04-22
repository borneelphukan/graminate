const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: "postgresql://postgres:borneel1999@localhost:5433/graminate"
  });

  const userId = 1;
  const loans = [
    { loan_name: "Bank Loan A", amount: 500000, interest_rate: 8.5, lender: "SBI", start_date: '2026-01-01' },
    { loan_name: "Equipment Financing", amount: 250000, interest_rate: 7.0, lender: "HDFC", start_date: '2026-02-15' },
    { loan_name: "Short-term Credit", amount: 100000, interest_rate: 12.0, lender: "Local Cooperative", start_date: '2026-03-10' },
  ];

  try {
    for (const loan of loans) {
      await pool.query(
        `INSERT INTO loans (user_id, loan_name, lender, amount, interest_rate, start_date, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          userId,
          loan.loan_name,
          loan.lender,
          loan.amount,
          loan.interest_rate,
          new Date(loan.start_date),
          'Active'
        ]
      );
    }
    console.log('Dummy loan data inserted successfully!');
  } catch (err) {
    console.error('Error inserting dummy loan data:', err);
  } finally {
    await pool.end();
  }
}

main();
