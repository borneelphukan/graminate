import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaClient } from '@prisma/client';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let createdUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = new PrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  const testUser = {
    first_name: 'E2E',
    last_name: 'Test',
    email: 'e2e@graminate.com',
    phone_number: '1234567890',
    password: 'securepassword123',
    plan: 'FREE',
  };

  it('/user/register (POST) - should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/register')
      .send(testUser)
      .expect(201); // NestJS default for POST is 201

    expect(response.body).toBeDefined();
    
    // Some implementations wrap responses in { status, data }
    const resData = response.body.data || response.body;
    expect(resData).toHaveProperty('user');
    expect(resData.user.email).toBe(testUser.email);
    
    createdUserId = resData.user.user_id;
  });

  it('/user/login (POST) - should login and return JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201);

    const resData = response.body.data || response.body;
    expect(resData).toHaveProperty('token');
    
    authToken = resData.token;
  });

  it('/user/:id (GET) - should fetch user profile with valid JWT', async () => {
    const response = await request(app.getHttpServer())
      .get(`/user/${createdUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const resData = response.body.data || response.body;
    expect(resData).toHaveProperty('email', testUser.email);
  });

  it('/user/:id (GET) - should fail with 401 if JWT is missing', async () => {
    await request(app.getHttpServer())
      .get(`/user/${createdUserId}`)
      .expect(401);
  });
});
