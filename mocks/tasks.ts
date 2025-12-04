import type { Task, Runner } from '@/types';

const mockRunners: Runner[] = [
  {
    id: 'runner1',
    name: 'Tendai Moyo',
    rating: 4.8,
    completedTasks: 127,
    verified: true,
  },
  {
    id: 'runner2',
    name: 'Chipo Ndlovu',
    rating: 4.9,
    completedTasks: 203,
    verified: true,
  },
  {
    id: 'runner3',
    name: 'Tapiwa Mutasa',
    rating: 4.7,
    completedTasks: 89,
    verified: true,
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'task1',
    title: 'Buy groceries from OK Mart',
    description:
      'Need basic groceries: 2kg mealie meal, cooking oil, sugar, and tomatoes. I will send the full list once you accept.',
    category: 'groceries',
    location: 'OK Mart, Avondale',
    timeframe: 'in about 2 hours',
    status: 'open',
    bidType: 'max',
    maxBudget: 15,
    bids: [
      {
        id: 'bid1',
        runner: mockRunners[0],
        amount: 15,
        createdAt: new Date(),
      },
      {
        id: 'bid2',
        runner: mockRunners[1],
        amount: 12,
        createdAt: new Date(),
      },
      {
        id: 'bid3',
        runner: mockRunners[2],
        amount: 13,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
  },
  {
    id: 'task2',
    title: 'Stand in queue at ZIMRA',
    description:
      'Need someone to stand in line at ZIMRA Harare. Should take about 2-3 hours. I will come when you reach the front.',
    category: 'queue',
    location: 'ZIMRA Head Office, Harare',
    timeframe: 'in about 24 hours',
    status: 'open',
    bidType: 'fixed',
    fixedPrice: 25,
    bids: [
      {
        id: 'bid4',
        runner: mockRunners[0],
        amount: 25,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
  },
  {
    id: 'task3',
    title: 'Deliver package to Borrowdale',
    description:
      'Small package needs to be delivered from CBD to Borrowdale. Package contains documents, very light.',
    category: 'delivery',
    location: 'CBD to Borrowdale',
    timeframe: 'in about 4 hours',
    status: 'open',
    bidType: 'max',
    maxBudget: 20,
    bids: [
      {
        id: 'bid5',
        runner: mockRunners[1],
        amount: 18,
        createdAt: new Date(),
      },
      {
        id: 'bid6',
        runner: mockRunners[2],
        amount: 20,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
  },
  {
    id: 'task4',
    title: 'Get quotation from hardware store',
    description:
      'Need someone to visit Graniteside hardware stores and get quotations for cement and bricks. Take photos of price lists.',
    category: 'research',
    location: 'Graniteside Area',
    timeframe: 'in about 6 hours',
    status: 'open',
    bidType: 'fixed',
    fixedPrice: 10,
    bids: [],
    createdAt: new Date(),
  },
  {
    id: 'task5',
    title: 'Pick up shoes from cobbler',
    description: 'My shoes are ready at the cobbler in Mbare. Just need someone to pick them up for me.',
    category: 'pickup',
    location: 'Mbare Musika',
    timeframe: 'in about 3 hours',
    status: 'open',
    bidType: 'max',
    maxBudget: 8,
    bids: [
      {
        id: 'bid7',
        runner: mockRunners[0],
        amount: 8,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
  },
];
