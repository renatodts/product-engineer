import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { resetDb } from '../test/reset-db';

describe('Review (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const seedDeck = async (): Promise<string> => {
    const res = await request(app.getHttpServer()).post('/decks').send({ name: 'Spanish' });
    return res.body.id as string;
  };

  const seedCard = async (deckId: string, front: string, dueAt?: Date): Promise<string> => {
    const res = await request(app.getHttpServer())
      .post(`/decks/${deckId}/cards`)
      .send({ front, back: `${front}-back` });
    const id = res.body.id as string;
    if (dueAt) {
      await prisma.card.update({ where: { id }, data: { dueAt } });
    }
    return id;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  beforeEach(() => resetDb(prisma));

  afterAll(() => app.close());

  it('returns due cards ordered by dueAt ascending', async () => {
    const deckId = await seedDeck();
    const earlier = new Date(Date.now() - 2 * 86_400_000);
    const later = new Date(Date.now() - 1 * 86_400_000);
    await seedCard(deckId, 'late', later);
    await seedCard(deckId, 'early', earlier);

    const res = await request(app.getHttpServer()).get(`/decks/${deckId}/review`).expect(200);

    expect(res.body.deckId).toBe(deckId);
    expect(res.body.cards.map((c: { front: string }) => c.front)).toEqual(['early', 'late']);
  });

  it('returns an empty session when nothing is due', async () => {
    const deckId = await seedDeck();
    const future = new Date(Date.now() + 7 * 86_400_000);
    await seedCard(deckId, 'future', future);

    const res = await request(app.getHttpServer()).get(`/decks/${deckId}/review`).expect(200);

    expect(res.body.cards).toEqual([]);
  });

  it('grades a card: updates SM-2 state and appends a review row', async () => {
    const deckId = await seedDeck();
    const cardId = await seedCard(deckId, 'hola');

    const res = await request(app.getHttpServer())
      .post(`/cards/${cardId}/review`)
      .send({ grade: 5 })
      .expect(201);

    expect(res.body).toMatchObject({ repetitions: 1, interval: 1 });
    expect(res.body.easeFactor).toBeCloseTo(2.6, 5);
    expect(new Date(res.body.dueAt).getTime()).toBeGreaterThan(Date.now());
    expect(await prisma.review.count()).toBe(1);
  });

  it('rejects an out-of-range grade with 400 and leaves the card unchanged', async () => {
    const deckId = await seedDeck();
    const cardId = await seedCard(deckId, 'hola');

    await request(app.getHttpServer())
      .post(`/cards/${cardId}/review`)
      .send({ grade: 6 })
      .expect(400);

    const card = await prisma.card.findUnique({ where: { id: cardId } });
    expect(card?.repetitions).toBe(0);
    expect(card?.easeFactor).toBe(2.5);
    expect(await prisma.review.count()).toBe(0);
  });

  it('returns 404 when grading a missing card', async () => {
    await request(app.getHttpServer()).post('/cards/missing/review').send({ grade: 3 }).expect(404);
  });
});
