import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { secret } from 'src/config';

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

  getUser(req: any): Promise<IJwtUser> {
    return new Promise<IJwtUser>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const _this = this;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const token = this._jwtFromRequest(req);

      if (!token) {
        return reject(new Error('No auth token'));
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._secretOrKeyProvider(
        req,
        token,
        function (secretOrKeyError, secretOrKey) {
          if (secretOrKeyError) {
            reject(secretOrKeyError);
          } else {
            // Verify the JWT
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            JwtStrategy.JwtVerifier(
              token,
              secretOrKey,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              _this._verifOpts,
              function (jwt_err, payload) {
                if (jwt_err) {
                  reject(jwt_err);
                } else {
                  resolve(payload);
                }
              },
            );
          }
        },
      );
    });
  }
}
