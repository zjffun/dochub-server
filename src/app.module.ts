import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { mongodbUri } from './config';
import { DocsModule } from './docs/docs.module';
import { RelationsModule } from './relations/relations.module';
import { ContentsModule } from './contents/contents.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot(mongodbUri),
    DocsModule,
    RelationsModule,
    AuthModule,
    UsersModule,
    ContentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
