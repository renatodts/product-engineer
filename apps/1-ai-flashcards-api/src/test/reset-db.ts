import type { PrismaService } from '../prisma/prisma.service';

/**
 * Clears all flashcard data between integration tests. TRUNCATE ... CASCADE wipes
 * Deck/Card/Review in one statement so each test starts from an empty database.
 */
export async function resetDb(prisma: PrismaService): Promise<void> {
  await prisma.$executeRawUnsafe('TRUNCATE "Review", "Card", "Deck" RESTART IDENTITY CASCADE');
}
