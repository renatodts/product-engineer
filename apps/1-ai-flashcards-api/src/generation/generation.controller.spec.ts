import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NOTES_MAX_LENGTH } from '@product-engineer/shared-contracts';
import type { AiCardGenerator } from '@product-engineer/shared-ai';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { AI_CARD_GENERATOR } from './generation.tokens';
import { resetDb } from '../test/reset-db';

describe('Generation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const seedDeck = async (): Promise<string> => {
    const res = await request(app.getHttpServer()).post('/decks').send({ name: 'Spanish' });
    return res.body.id as string;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  beforeEach(() => resetDb(prisma));

  afterAll(() => app.close());

  it('returns suggestions without persisting them', async () => {
    const deckId = await seedDeck();

    const res = await request(app.getHttpServer())
      .post(`/decks/${deckId}/generate`)
      .send({ notes: 'The sky is blue. Grass is green.' })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toEqual(
      expect.objectContaining({ front: expect.any(String), back: expect.any(String) }),
    );
    expect(await prisma.card.count()).toBe(0);
  });

  it('rejects empty notes with 400', async () => {
    const deckId = await seedDeck();
    await request(app.getHttpServer())
      .post(`/decks/${deckId}/generate`)
      .send({ notes: '   ' })
      .expect(400);
  });

  it('rejects oversized notes with 400', async () => {
    const deckId = await seedDeck();
    await request(app.getHttpServer())
      .post(`/decks/${deckId}/generate`)
      .send({ notes: 'a'.repeat(NOTES_MAX_LENGTH + 1) })
      .expect(400);
  });

  it('returns 404 generating for a missing deck', async () => {
    await request(app.getHttpServer())
      .post('/decks/missing/generate')
      .send({ notes: 'something' })
      .expect(404);
  });

  it('persists only the accepted suggestions', async () => {
    const deckId = await seedDeck();

    const res = await request(app.getHttpServer())
      .post(`/decks/${deckId}/cards/accept`)
      .send({ suggestions: [{ front: 'Q1', back: 'A1' }] })
      .expect(201);

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ front: 'Q1', back: 'A1', easeFactor: 2.5 });
    expect(await prisma.card.count()).toBe(1);
  });

  it('rejects accepting an empty selection with 400', async () => {
    const deckId = await seedDeck();
    await request(app.getHttpServer())
      .post(`/decks/${deckId}/cards/accept`)
      .send({ suggestions: [] })
      .expect(400);
  });
});

describe('Generation failure (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const failing: AiCardGenerator = {
    generateCards: () => Promise.reject(new Error('provider down')),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AI_CARD_GENERATOR)
      .useValue(failing)
      .compile();
    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  beforeEach(() => resetDb(prisma));

  afterAll(() => app.close());

  it('returns 502 and persists nothing when the provider errors', async () => {
    const res = await request(app.getHttpServer()).post('/decks').send({ name: 'Spanish' });
    const deckId = res.body.id as string;

    await request(app.getHttpServer())
      .post(`/decks/${deckId}/generate`)
      .send({ notes: 'something' })
      .expect(502);

    expect(await prisma.card.count()).toBe(0);
  });
});
