const { Client } = require('pg');

async function main() {
  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  await client.query(`
    WITH numbered AS (
      SELECT ctid, ROW_NUMBER() OVER (ORDER BY ctid) AS rn
      FROM users
      WHERE id IS NULL
    )
    UPDATE users u
    SET id = numbered.rn + COALESCE((SELECT MAX(id) FROM users WHERE id IS NOT NULL), 0)
    FROM numbered
    WHERE u.ctid = numbered.ctid
  `);

  await client.query(`CREATE SEQUENCE IF NOT EXISTS users_id_seq`);

  await client.query(`
    SELECT setval(
      'users_id_seq',
      GREATEST(COALESCE((SELECT MAX(id) FROM users), 0), 1),
      (SELECT COUNT(*) > 0 FROM users WHERE id IS NOT NULL)
    )
  `);

  await client.query(`
    ALTER TABLE users
    ALTER COLUMN id SET DEFAULT nextval('users_id_seq')
  `);

  await client.query(`
    ALTER TABLE users
    ALTER COLUMN id SET NOT NULL
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_pkey'
      ) THEN
        ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
      END IF;
    END $$
  `);

  await client.query(`
    ALTER SEQUENCE users_id_seq OWNED BY users.id
  `);

  const check = await client.query(`
    SELECT column_name, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'id'
  `);
  console.log('id column after fix:', JSON.stringify(check.rows[0], null, 2));

  await client.end();
  console.log('users table fixed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
