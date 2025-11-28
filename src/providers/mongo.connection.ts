import { MongoClient } from 'mongodb';

export const DatabaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async () => {
      let client: any;

       client = new MongoClient('mongodb://localhost:27017/');
      await client.connect(); 
      return client.db('tripsdb');
    },
  },
];

