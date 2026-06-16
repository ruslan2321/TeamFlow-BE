import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Card } from '../src/card/card.entites';
import { User } from '../src/profile/user.entities';
import { getDatabaseUrl } from '../src/config/database-url';

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    url: getDatabaseUrl(),
    entities: [Card, User],
    synchronize: false,
    ssl: { rejectUnauthorized: false },
  });
  await ds.initialize();
  try {
    const rows = await ds.getRepository(Card).find({
      relations: ['assignedUser'],
    });
    console.log('ok', rows.length, JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('query failed:', e);
  } finally {
    await ds.destroy();
  }
}

main();
