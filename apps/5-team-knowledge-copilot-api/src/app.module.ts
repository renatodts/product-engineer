import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

// TODO: Register feature modules here as the project grows.
@Module({
  controllers: [AppController],
})
export class AppModule {}
