import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config as dotenvConfig } from 'dotenv';
import { AppModule } from './app.module';

dotenvConfig();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.useBodyParser('json', { limit: '10mb' });
  await app.listen(30001);
}

bootstrap();
