import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import {
  githubCallbackURL,
  githubClientID,
  githubClientSecret,
} from 'src/config';
import { User } from 'src/users/schemas/users.schema';
import { AuthService } from './auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      scope: ['public_repo'],
      clientID: githubClientID,
      clientSecret: githubClientSecret,
      callbackURL: githubCallbackURL,
    });
  }

  async validate(accessToken, refreshToken, profile) {
    const githubUser = new User();
    githubUser.githubId = profile._json.id;
    githubUser.name = profile._json.name;
    githubUser.avatarUrl = profile._json.avatar_url;
    githubUser.email = profile._json.email;
    githubUser.githubToken = accessToken;

    const login = profile._json.login;

    const user = await this.authService.findOrCreateGithubUser({
      user: githubUser,
      login,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
