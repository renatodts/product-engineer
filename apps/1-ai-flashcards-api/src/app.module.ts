import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';

// TODO: Register feature modules here as the project grows.
@Module({
  imports: [PrismaModule],
  controllers: [AppController],
})
export class AppModule {}
