const { Client } = require('pg');

async function main() {
  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const pk = await client.query(`
    SELECT tc.constraint_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'users' AND tc.constraint_type = 'PRIMARY KEY'
  `);

  const col = await client.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'id'
  `);

  const sample = await client.query(`
    SELECT id, login, email FROM users ORDER BY id NULLS FIRST LIMIT 5
  `);

  console.log('PK:', JSON.stringify(pk.rows, null, 2));
  console.log('id column:', JSON.stringify(col.rows, null, 2));
  console.log('sample rows:', JSON.stringify(sample.rows, null, 2));

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
