import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CollectionsModule } from './../src/collections/collections.module';

describe('CollectionsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          'mongodb://127.0.0.1:27017/relation?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1',
        ),
        CollectionsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/collections (Post)', () => {
    return request(app.getHttpServer())
      .post('/collections')
      .send({ name: 'test', groupName: 'test', lang: 'zh-CN', desc: '' })
      .expect(201);
  });

  it('/collections (GET)', () => {
    return request(app.getHttpServer())
      .get('/collections')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });
});
