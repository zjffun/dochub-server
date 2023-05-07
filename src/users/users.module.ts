import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Doc, DocSchema } from 'src/docs/schemas/docs.schema';
import { User, UserSchema } from './schemas/users.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: Doc.name,
        schema: DocSchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
