import type { IAuthor } from '@/interfaces/IAuthor'

export const MOCK_AUTHORS: IAuthor[] = [
  {
    id: 'a1',
    name: 'Alice Smith',
    profilePicture: 'https://example.com/alice.jpg',
    createdAt: '2022-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    verified: true,
  },
  {
    id: 'a2',
    name: 'Bob Johnson',
    profilePicture: 'https://example.com/bob.jpg',
    createdAt: '2022-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
    verified: false,
  },
  {
    id: 'a3',
    name: 'Carol Lee',
    profilePicture: 'https://example.com/carol.jpg',
    createdAt: '2022-03-01T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z',
    verified: true,
  },
]
