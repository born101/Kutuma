import { db } from './index';
import { users, tasks, bids } from './schema';

export async function seed() {
  console.log('🌱 Seeding database...');

  const mockUsers = [
    {
      name: 'John Requester',
      phone: '+263771234567',
      isRunner: false,
      verified: true,
      rating: '4.8',
      completedTasks: 45,
    },
    {
      name: 'Tendai Moyo',
      phone: '+263772345678',
      isRunner: true,
      verified: true,
      rating: '4.8',
      completedTasks: 127,
    },
    {
      name: 'Chipo Ndlovu',
      phone: '+263773456789',
      isRunner: true,
      verified: true,
      rating: '4.9',
      completedTasks: 203,
    },
    {
      name: 'Tapiwa Mutasa',
      phone: '+263774567890',
      isRunner: true,
      verified: true,
      rating: '4.7',
      completedTasks: 89,
    },
  ];

  const insertedUsers = await db.insert(users).values(mockUsers).returning();
  console.log(`✅ Inserted ${insertedUsers.length} users`);

  const [requester, runner1, runner2, runner3] = insertedUsers;

  const mockTasks = [
    {
      title: 'Buy groceries from OK Mart',
      description: 'Need basic groceries: 2kg mealie meal, cooking oil, sugar, and tomatoes. I will send the full list once you accept.',
      category: 'groceries',
      location: 'OK Mart, Avondale',
      timeframe: 'in about 2 hours',
      bidType: 'max',
      maxBudget: '15',
      createdBy: requester.id,
    },
    {
      title: 'Stand in queue at ZIMRA',
      description: 'Need someone to stand in line at ZIMRA Harare. Should take about 2-3 hours. I will come when you reach the front.',
      category: 'queue',
      location: 'ZIMRA Head Office, Harare',
      timeframe: 'in about 24 hours',
      bidType: 'fixed',
      fixedPrice: '25',
      createdBy: requester.id,
    },
    {
      title: 'Deliver package to Borrowdale',
      description: 'Small package needs to be delivered from CBD to Borrowdale. Package contains documents, very light.',
      category: 'delivery',
      location: 'CBD to Borrowdale',
      timeframe: 'in about 4 hours',
      bidType: 'max',
      maxBudget: '20',
      createdBy: requester.id,
    },
    {
      title: 'Get quotation from hardware store',
      description: 'Need someone to visit Graniteside hardware stores and get quotations for cement and bricks. Take photos of price lists.',
      category: 'research',
      location: 'Graniteside Area',
      timeframe: 'in about 6 hours',
      bidType: 'fixed',
      fixedPrice: '10',
      createdBy: requester.id,
    },
    {
      title: 'Pick up shoes from cobbler',
      description: 'My shoes are ready at the cobbler in Mbare. Just need someone to pick them up for me.',
      category: 'pickup',
      location: 'Mbare Musika',
      timeframe: 'in about 3 hours',
      bidType: 'max',
      maxBudget: '8',
      createdBy: requester.id,
    },
  ];

  const insertedTasks = await db.insert(tasks).values(mockTasks).returning();
  console.log(`✅ Inserted ${insertedTasks.length} tasks`);

  const [task1, task2, task3, , task5] = insertedTasks;

  const mockBids = [
    { taskId: task1.id, runnerId: runner1.id, amount: '15', status: 'pending' as const },
    { taskId: task1.id, runnerId: runner2.id, amount: '12', status: 'pending' as const },
    { taskId: task1.id, runnerId: runner3.id, amount: '13', status: 'pending' as const },
    { taskId: task2.id, runnerId: runner1.id, amount: '25', status: 'pending' as const },
    { taskId: task3.id, runnerId: runner2.id, amount: '18', status: 'pending' as const },
    { taskId: task3.id, runnerId: runner3.id, amount: '20', status: 'pending' as const },
    { taskId: task5.id, runnerId: runner1.id, amount: '8', status: 'pending' as const },
  ];

  const insertedBids = await db.insert(bids).values(mockBids).returning();
  console.log(`✅ Inserted ${insertedBids.length} bids`);

  console.log('✅ Database seeded successfully');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error seeding database:', error);
      process.exit(1);
    });
}
