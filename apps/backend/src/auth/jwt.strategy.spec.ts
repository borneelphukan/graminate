import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy, JwtPayload } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);
  });

  describe('validate', () => {
    it('should return admin payload when isAdmin is true', () => {
      const payload: JwtPayload = { isAdmin: true, adminId: 'admin-uuid' };
      const result = strategy.validate(payload);
      expect(result).toEqual({ isAdmin: true, adminId: 'admin-uuid' });
    });

    it('should return user payload when userId is present', () => {
      const payload: JwtPayload = { userId: 42 };
      const result = strategy.validate(payload);
      expect(result).toEqual({ userId: 42 });
    });

    it('should throw UnauthorizedException for empty payload', () => {
      const payload: JwtPayload = {};
      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when userId is 0', () => {
      const payload: JwtPayload = { userId: 0 };
      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    });
  });
});
