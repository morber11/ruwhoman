import 'dotenv/config';
import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';
import { Challenge } from './challenges/challenge.entity';

const options: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Challenge],
    migrations: ['dist/migrations/*.js'],
};

export const AppDataSource = new DataSource(options);
