import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getOverview: async () => ({
              name: 'restaurant-order-api',
              docs: '/docs',
              demoQrTokens: [],
            }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(({ body }) => {
        expect(body.name).toBe('restaurant-order-api');
        expect(body.docs).toBe('/docs');
        expect(Array.isArray(body.demoQrTokens)).toBe(true);
      });
  });
});
