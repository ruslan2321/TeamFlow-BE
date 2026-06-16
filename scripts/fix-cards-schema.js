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

  await client.query(
    `ALTER TABLE cards ALTER COLUMN "CommentTask" TYPE text USING "CommentTask"::text`,
  );

  await client.query(`
    WITH numbered AS (
      SELECT ctid, ROW_NUMBER() OVER (ORDER BY ctid) AS rn
      FROM cards
      WHERE task_id IS NULL
    )
    UPDATE cards c
    SET task_id = numbered.rn + COALESCE((SELECT MAX(task_id) FROM cards WHERE task_id IS NOT NULL), 0)
    FROM numbered
    WHERE c.ctid = numbered.ctid
  `);

  await client.query(`CREATE SEQUENCE IF NOT EXISTS cards_task_id_seq`);

  await client.query(`
    SELECT setval(
      'cards_task_id_seq',
      GREATEST(COALESCE((SELECT MAX(task_id) FROM cards), 0), 1),
      (SELECT COUNT(*) > 0 FROM cards)
    )
  `);

  await client.query(`
    ALTER TABLE cards
    ALTER COLUMN task_id SET DEFAULT nextval('cards_task_id_seq')
  `);

  await client.query(`
    ALTER TABLE cards
    ALTER COLUMN task_id SET NOT NULL
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'cards_pkey'
      ) THEN
        ALTER TABLE cards ADD CONSTRAINT cards_pkey PRIMARY KEY (task_id);
      END IF;
    END $$
  `);

  await client.query(`
    ALTER SEQUENCE cards_task_id_seq OWNED BY cards.task_id
  `);

  const check = await client.query(`
    SELECT column_name, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'task_id'
  `);
  console.log('task_id:', JSON.stringify(check.rows[0], null, 2));

  await client.end();
  console.log('cards table fixed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
