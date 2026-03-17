import { drizzle } from 'drizzle-orm/node-postgres';
import { ENVIRONMENT } from '@/config';
import * as schema from './schema';

export const db = drizzle(ENVIRONMENT.DATABASE_URL, { schema });
