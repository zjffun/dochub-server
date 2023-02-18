import { Strategy } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  githubCallbackURL,
  githubClientID,
  githubClientSecret,
} from 'src/config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      clientID: githubClientID,
      clientSecret: githubClientSecret,
      callbackURL: githubCallbackURL,
    });
  }

  async validate(accessToken, refreshToken, profile) {
    const githubUser: CreateUserDto = {
      githubId: profile._json.id,
      name: profile._json.name,
      avatarUrl: profile._json.avatar_url,
      email: profile._json.email,
    };

    const user = await this.authService.findOrCreateGithubUser(githubUser);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
