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

  const rawOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:8081',
      ];

  // Clean whitespace and remove any trailing slashes automatically
  const allowedOrigins = rawOrigins.map((origin) =>
    origin.trim().replace(/\/+$/, ''),
  );

  console.log('🚀 [CORS] Whitelisted Origins:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
}
void bootstrap();
