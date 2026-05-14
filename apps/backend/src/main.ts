import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:8081',
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
}
void bootstrap();
