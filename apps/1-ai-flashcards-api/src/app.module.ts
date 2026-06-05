import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { DecksModule } from './decks/decks.module';

// TODO: Register feature modules here as the project grows.
@Module({
  imports: [PrismaModule, DecksModule],
  controllers: [AppController],
})
export class AppModule {}
