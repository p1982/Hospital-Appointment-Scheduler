import UsersService from '../../bll/users/users.service.ts';
import bcrypt from 'bcryptjs';
import { Service } from 'typedi';
import express from 'express';
import * as crypto from 'crypto';
import { JWTHeader, JWTPayload } from '../../types/jwt.interface.ts';
import config from '../../config/index.ts';

@Service()
class AuthController {
  private header: JWTHeader = {
    alg: 'HS256',
    typ: 'JWT',
  };
  private secret: string = config.get('SECRET_KEY');
  public path = '/auth';
  public router = express.Router();

  private tokenStorage: Record<string, string> = {};

  constructor(private usersService: UsersService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post('/login', this.loginJWT);
    this.router.post('/register', this.registerJWT);
    this.router.post('/refresh', this.refreshJWT);
  }

  private createJWT(
    header: JWTHeader,
    payload: JWTPayload,
    secret: string,
    expiresIn: string,
  ): string {
    const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
    const payloadWithExp = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + this.parseExpiration(expiresIn),
    };
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(payloadWithExp));
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return `${headerEncoded}.${payloadEncoded}.${signature}`;
  }

  private parseExpiration(expiration: string): number {
    const time = parseInt(expiration.slice(0, -1), 10);
    const unit = expiration.slice(-1);
    switch (unit) {
      case 's':
        return time;
      case 'm':
        return time * 60;
      case 'h':
        return time * 60 * 60;
      case 'd':
        return time * 60 * 60 * 24;
      default:
        throw new Error('Invalid expiration format');
    }
  }

  verifyJWT(token: string, secret: string): boolean {
    const [headerEncoded, payloadEncoded, signature] = token.split('.');
    const newSignature = crypto
      .createHmac('sha256', secret)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return newSignature === signature;
  }

  refreshJWT = async (request: express.Request, response: express.Response) => {
    const { email, token } = request.body;

    const user = await this.usersService.getUserByEmail(email);
    if (token && this.tokenStorage[token]) {
      const refreshToken = this.tokenStorage[token];
      const decoded = this.verifyJWT(refreshToken, 'refreshsecret');
      if (decoded) {
        const newTokenPayload: JWTPayload = {
          sub: email,
          name: user?.firstName + ' ' + user?.lastName,
          role: user?.role,
          iat: Math.floor(Date.now() / 1000),
        };
        const newToken = this.createJWT(
          this.header,
          newTokenPayload,
          this.secret,
          '15m',
        );

        this.tokenStorage[newToken] = refreshToken;
        response.status(200).json({
          token: newToken,
        });
      } else {
        response.status(403).send('Invalid refresh token');
      }
    } else {
      response.status(404).send('Invalid request');
    }
  };

  loginJWT = async (request: express.Request, response: express.Response) => {
    const { email, password } = request.body;

    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      response.status(404).send('Patient not found. Please signup');
    }

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {

      const payload: JWTPayload = {
        sub: email,
        name: user.firstName + ' ' + user.lastName,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
      };
      const token = this.createJWT(this.header, payload, this.secret, '15m');

      const refreshToken = this.createJWT(
        this.header,
        payload,
        'refreshsecret',
        '24h',
      );

      this.tokenStorage[token] = refreshToken;

      delete user.password;
      return response.status(200).json({ ...user, token, refreshToken });
    }
    response.status(400).send('Invalid Credentials');
  };

  registerJWT = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const { email, password, fullName, ...rest } = request.body;

    const oldUser = await this.usersService.getUserByEmail(email);

    if (oldUser) {
      return response.status(409).send('User Already Exist. Please Login');
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.createAUser({
      email: email,
      password: encryptedPassword,
      fullName,
      ...rest,
    });

    const payload: JWTPayload = {
      sub: email,
      name: fullName,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = this.createJWT(this.header, payload, this.secret, '15m');

    delete user.password;

    response.status(200).json({ ...user, token });
  };

  base64UrlEncode(url: string): string {
    return Buffer.from(url)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '-');
  }

  base64UrlDecode(base64Url: string): string {
    base64Url = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    switch (base64Url.length % 4) {
      case 0:
        break;
      case 2:
        base64Url += '==';
        break;
      case 3:
        base64Url += '=';
        break;
      default:
        throw new Error('Illegal base64Url string!');
    }
    return Buffer.from(base64Url, 'base64').toString();
  }
}

export default AuthController;
