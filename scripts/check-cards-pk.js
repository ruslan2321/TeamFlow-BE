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
    WHERE tc.table_name = 'cards' AND tc.constraint_type = 'PRIMARY KEY'
  `);
  console.log('primary key:', JSON.stringify(pk.rows, null, 2));

  const defaults = await client.query(`
    SELECT column_name, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'task_id'
  `);
  console.log('task_id column:', JSON.stringify(defaults.rows, null, 2));

  const rows = await client.query('SELECT * FROM cards ORDER BY task_id NULLS LAST LIMIT 5');
  console.log('rows:', JSON.stringify(rows.rows, null, 2));

  const seq = await client.query(`
    SELECT pg_get_serial_sequence('cards', 'task_id') AS seq_name
  `);
  console.log('serial sequence:', JSON.stringify(seq.rows, null, 2));

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
