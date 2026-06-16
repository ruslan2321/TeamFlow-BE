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

  await client.query(`ALTER TABLE cards DROP COLUMN IF EXISTS "userIdId"`);
  await client.query(
    `ALTER TABLE cards ALTER COLUMN title TYPE varchar(255) USING title::varchar`,
  );
  await client.query(
    `ALTER TABLE cards ALTER COLUMN description TYPE varchar(255) USING description::varchar`,
  );
  await client.query(
    `ALTER TABLE cards ALTER COLUMN name_task TYPE varchar(255) USING name_task::varchar`,
  );

  const cols = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cards' ORDER BY ordinal_position`,
  );
  console.log(JSON.stringify(cols.rows, null, 2));
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
