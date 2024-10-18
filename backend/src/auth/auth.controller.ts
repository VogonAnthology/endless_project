import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { GoogleAuthGuard } from './guards/google-oauth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req) {
    return this.authService.login(req.user.id);
  }

  @UseGuards(RefreshAuthGuard)
  @Get('refresh')
  async refreshToken(@Req() req, @Res() res) {
    const response = await this.authService.refreshToken(req.user.id);

    res.cookie('accessToken', req.user.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure uniquement en production
      sameSite: 'strict', // Prévenir les attaques CSRF
      maxAge: 60 * 60 * 1000, // Durée de vie du cookie en millisecondes (1 heure ici
    });
    res.cookie('refreshToken', req.user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure uniquement en production
      sameSite: 'strict', // Prévenir les attaques CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // Durée de vie du cookie en millisecondes (7 jours ici)
    });

    return res.json({ accessToken: response.accessToken });
  }

  @Get('status')
  getStatus(@Req() req: Request) {
    console.log('req.user:', req.user);
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('signout')
  async signOut(@Req() req, @Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    await this.authService.signOut(req.user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res({ passthrough: true }) res: Response) {
    const response = await this.authService.login(req.user.id);

    // Définir un cookie HTTP-only avec le accessToken
    res.cookie('accessToken', response.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure uniquement en production
      sameSite: 'strict', // Prévenir les attaques CSRF
      maxAge: 60 * 60 * 1000, // Durée de vie du cookie en millisecondes (1 heure ici)
    });

    // Définir un cookie HTTP-only avec le refreshToken
    res.cookie('refreshToken', response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure uniquement en production
      sameSite: 'strict', // Prévenir les attaques CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // Durée de vie du cookie en millisecondes (7 jours ici)
    });

    res.redirect('http://localhost:4200');
  }
}
