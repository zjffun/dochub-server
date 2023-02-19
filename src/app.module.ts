import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';
import { mongodbUri } from './config';
import { RelationsModule } from './relations/relations.module';
import { TranslatedContentModule } from './translated-content/translated-content.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot(mongodbUri),
    CollectionsModule,
    RelationsModule,
    AuthModule,
    UsersModule,
    TranslatedContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
