import {
  Controller,
  Get,
  Header,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { apiPrefix } from 'src/config';
import { AuthService } from './auth.service';
import { GithubAuthGuard } from './github-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller(apiPrefix)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('v1/auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(GithubAuthGuard)
  @Get('v1/auth/github')
  async github() {
    return;
  }

  @UseGuards(GithubAuthGuard)
  @Get('v1/auth/github/callback')
  @Header('CONTENT-TYPE', 'text/html')
  async githubCallback(@Request() req) {
    const { access_token, github_token } = await this.authService.login(
      req.user,
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sign In Success</title>
        </head>
        <body>
          <script>
            localStorage.setItem('access_token', '${access_token}');
            // TODO: fix vulnerable
            localStorage.setItem('github_token', '${github_token}');
            window.opener.postMessage({ type: 'signInSuccess' });
            window.close();
          </script>
        </body>
      </html>
    `;
  }
}
