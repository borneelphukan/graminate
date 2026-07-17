import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe';
import { csrfMiddleware } from './common/middlewares/csrf.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(helmet());
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ limit: '1mb', extended: true }));
  app.useGlobalPipes(new ZodValidationPipe());
  app.setGlobalPrefix('api');

  const rawOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:3001',
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

  app.use(csrfMiddleware(allowedOrigins));

  if (!process.env.ADMIN_INVITE_CODE) {
    console.warn(
      'ADMIN_INVITE_CODE is not set — admins can still be invited via root-generated invite codes.',
    );
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
}
void bootstrap();
