import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DocsModule } from '../src/docs/docs.module';

describe('DocsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          'mongodb://127.0.0.1:27017/relation?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1',
        ),
        DocsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/docs (Post)', () => {
    return request(app.getHttpServer())
      .post('/docs')
      .send({ name: 'test', groupName: 'test', lang: 'zh-CN', desc: '' })
      .expect(201);
  });

  it('/docs (GET)', () => {
    return request(app.getHttpServer())
      .get('/docs')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });
});
