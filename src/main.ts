// init dotenv before AppModule, otherwise process.env.MONGODB_URI will be undefined in AppModule
import './initDotEnv';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.enableCors({ origin: ['https://dochub.zjffun.com'] });

  app.useBodyParser('json', { limit: '10mb' });

  await app.listen(30001);
}

bootstrap();
