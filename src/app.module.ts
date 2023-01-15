import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectionsModule } from './collections/collections.module';
import { mongodbUri } from './config';
import { RelationsModule } from './relations/relations.module';

@Module({
  imports: [
    MongooseModule.forRoot(mongodbUri),
    CollectionsModule,
    RelationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
