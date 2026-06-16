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
  const userRepo = ds.getRepository(User);
  const cardRepo = ds.getRepository(Card);
  const user = await userRepo.findOne({ where: {} });
  if (!user) {
    console.log('no users');
    return;
  }
  const saved = await cardRepo.save(
    cardRepo.create({
      title: 'pk-test',
      name_task: 'pk-test',
      description: 'pk-test',
      status: 'В разработке',
      assignedUser: user,
    }),
  );
  console.log('saved task_id:', saved.task_id);
  await cardRepo.delete({ task_id: saved.task_id });
  await ds.destroy();
}

main().catch(console.error);
