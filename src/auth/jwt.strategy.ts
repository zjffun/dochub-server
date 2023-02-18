import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Document, Types } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { secret } from 'src/config';
import { User } from 'src/users/schemas/users.schema';

export interface IJwtUser {
  userId: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(user: IJwtUser): Promise<IJwtUser> {
    return user;
  }
}
