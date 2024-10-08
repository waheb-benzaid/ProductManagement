import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env variables

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use((req, res, next) => {
    console.log('Request Headers:', req.headers);
    console.log('Authorization:', req.headers.authorization);
    next();
  });
  await app.listen(3000);
}
bootstrap();
