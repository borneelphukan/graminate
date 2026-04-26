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
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('JWT_SECRET') || 'secret',
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
