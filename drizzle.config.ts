import { defineConfig } from 'drizzle-kit';
import { ENVIRONMENT } from './config';

export default defineConfig({
    out: './drizzle',
    schema: './db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: ENVIRONMENT.DATABASE_URL || '',
    },
});
