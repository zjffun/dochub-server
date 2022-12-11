import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RelationsModule } from './relations/relations.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://127.0.0.1:27017/relation?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1',
    ),
    RelationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
