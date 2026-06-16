require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const cols = await client.query(
    `SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_name = 'cards'
     ORDER BY ordinal_position`,
  );
  console.log('columns:', JSON.stringify(cols.rows, null, 2));
  const sample = await client.query('SELECT * FROM cards LIMIT 1');
  console.log('sample:', JSON.stringify(sample.rows, null, 2));
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
