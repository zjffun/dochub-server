import {
  Controller,
  Get,
  Header,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GithubAuthGuard } from './github-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(GithubAuthGuard)
  @Get('github')
  async github() {
    return;
  }

  @UseGuards(GithubAuthGuard)
  @Get('github/callback')
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
