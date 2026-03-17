import dotenv from 'dotenv';
import z from 'zod';

dotenv.config({ path: '.env' });

const environmentSchema = z.object({
    DATABASE_URL: z.string().optional(),
    SESSION_SECRET: z.string().optional(),
});

export const ENVIRONMENT = environmentSchema.parse(process.env);
