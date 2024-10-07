import * as dotenv from 'dotenv';
dotenv.config();

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'fallback-secret-key', // Fallback in case the env var isn't set
};
