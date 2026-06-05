import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { resetDb } from '../test/reset-db';

describe('Decks (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  beforeEach(() => resetDb(prisma));

  afterAll(() => app.close());

  it('creates a deck and returns it with zero counts', async () => {
    const res = await request(app.getHttpServer())
      .post('/decks')
      .send({ name: 'Spanish' })
      .expect(201);

    expect(res.body).toMatchObject({ name: 'Spanish', cardCount: 0, dueCount: 0 });
    expect(res.body.id).toEqual(expect.any(String));
    expect(typeof res.body.createdAt).toBe('string');
  });

  it('rejects an empty/whitespace name with 400', async () => {
    await request(app.getHttpServer()).post('/decks').send({ name: '   ' }).expect(400);
  });

  it('lists decks with card and due counts', async () => {
    await request(app.getHttpServer()).post('/decks').send({ name: 'A' });
    await request(app.getHttpServer()).post('/decks').send({ name: 'B' });

    const res = await request(app.getHttpServer()).get('/decks').expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body.map((d: { name: string }) => d.name).sort()).toEqual(['A', 'B']);
    expect(res.body[0]).toMatchObject({ cardCount: 0, dueCount: 0 });
  });

  it('deletes a deck and returns 204', async () => {
    const created = await request(app.getHttpServer()).post('/decks').send({ name: 'Temp' });

    await request(app.getHttpServer()).delete(`/decks/${created.body.id}`).expect(204);

    const res = await request(app.getHttpServer()).get('/decks').expect(200);
    expect(res.body).toHaveLength(0);
  });

  it('returns 404 when deleting a non-existent deck', async () => {
    await request(app.getHttpServer()).delete('/decks/does-not-exist').expect(404);
  });
});
