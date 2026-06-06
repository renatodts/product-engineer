import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { resetDb } from '../test/reset-db';

describe('Cards (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const createDeck = async (name = 'Spanish'): Promise<string> => {
    const res = await request(app.getHttpServer()).post('/decks').send({ name });
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

  it('creates a card with default SM-2 state', async () => {
    const deckId = await createDeck();

    const res = await request(app.getHttpServer())
      .post(`/decks/${deckId}/cards`)
      .send({ front: 'hola', back: 'hello' })
      .expect(201);

    expect(res.body).toMatchObject({
      deckId,
      front: 'hola',
      back: 'hello',
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
    });
    expect(typeof res.body.dueAt).toBe('string');
  });

  it('returns 404 when creating a card in a non-existent deck', async () => {
    await request(app.getHttpServer())
      .post('/decks/missing/cards')
      .send({ front: 'a', back: 'b' })
      .expect(404);
  });

  it('rejects an empty front or back with 400', async () => {
    const deckId = await createDeck();
    await request(app.getHttpServer())
      .post(`/decks/${deckId}/cards`)
      .send({ front: '', back: 'hello' })
      .expect(400);
  });

  it('lists the cards in a deck', async () => {
    const deckId = await createDeck();
    await request(app.getHttpServer())
      .post(`/decks/${deckId}/cards`)
      .send({ front: '1', back: 'a' });
    await request(app.getHttpServer())
      .post(`/decks/${deckId}/cards`)
      .send({ front: '2', back: 'b' });

    const res = await request(app.getHttpServer()).get(`/decks/${deckId}/cards`).expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body.map((c: { front: string }) => c.front).sort()).toEqual(['1', '2']);
  });

  it('edits front/back without altering SM-2 scheduling state', async () => {
    const deckId = await createDeck();
    const created = await request(app.getHttpServer())
      .post(`/decks/${deckId}/cards`)
      .send({ front: 'hola', back: 'hello' });
    // simulate prior scheduling progress
    await prisma.card.update({
      where: { id: created.body.id },
      data: { easeFactor: 2.7, interval: 6, repetitions: 2 },
    });

    const res = await request(app.getHttpServer())
      .patch(`/cards/${created.body.id}`)
      .send({ front: 'HOLA', back: 'HELLO' })
      .expect(200);

    expect(res.body).toMatchObject({
      front: 'HOLA',
      back: 'HELLO',
      easeFactor: 2.7,
      interval: 6,
      repetitions: 2,
    });
  });

  it('deletes a card and its review history, returning 204', async () => {
    const deckId = await createDeck();
    const created = await request(app.getHttpServer())
      .post(`/decks/${deckId}/cards`)
      .send({ front: 'hola', back: 'hello' });
    await prisma.review.create({
      data: { cardId: created.body.id, grade: 5, interval: 1, easeFactor: 2.6 },
    });

    await request(app.getHttpServer()).delete(`/cards/${created.body.id}`).expect(204);

    expect(await prisma.card.count()).toBe(0);
    expect(await prisma.review.count()).toBe(0);
  });
});
