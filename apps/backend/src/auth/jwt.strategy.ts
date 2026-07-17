import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  isAdmin?: boolean;
  adminId?: string;
  userId?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    const secret = cfg.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): {
    isAdmin?: boolean;
    adminId?: string;
    userId?: number;
  } {
    if (payload.isAdmin) {
      return { isAdmin: true, adminId: payload.adminId };
    }
    if (payload.userId) {
      return { userId: payload.userId };
    }
    throw new UnauthorizedException();
  }
}
