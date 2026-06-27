import { describe, it, expect } from 'vitest';
import { usersSchema, adminSchema, loginHistorySchema, passwordResetsSchema } from '../src/user/user';

describe('User Module Schemas', () => {

  describe('usersSchema', () => {
    it('should validate a completely valid user object', () => {
      const validUser = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '+1234567890',
        password: 'securePassword123',
        plan: 'PRO',
      };
      const result = usersSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should set default values for plan, darkMode, and opening_balance', () => {
      const basicUser = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        phone_number: '12345',
        password: 'pass',
      };
      const result = usersSchema.parse(basicUser);
      expect(result.plan).toBe('FREE');
      expect(result.darkMode).toBe(false);
      expect(result.opening_balance).toBe(0);
    });

    it('should fail if required fields are missing', () => {
      const invalidUser = {
        first_name: 'John',
        // missing last_name, email, phone_number, password
      };
      const result = usersSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors).toHaveProperty('last_name');
        expect(errors).toHaveProperty('email');
        expect(errors).toHaveProperty('phone_number');
        expect(errors).toHaveProperty('password');
      }
    });

    it('should fail for an invalid email format', () => {
      const user = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'not-an-email',
        phone_number: '12345',
        password: 'pass',
      };
      const result = usersSchema.safeParse(user);
      expect(result.success).toBe(false);
    });

    it('should fail for empty strings on min(1) fields', () => {
      const user = {
        first_name: '',
        last_name: 'Doe',
        email: 'test@example.com',
        phone_number: '123',
        password: '',
      };
      const result = usersSchema.safeParse(user);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors).toHaveProperty('first_name');
        expect(errors).toHaveProperty('password');
      }
    });

    it('should coerce date fields correctly', () => {
      const user = {
        first_name: 'Time',
        last_name: 'Lord',
        email: 'time@example.com',
        phone_number: '1',
        password: '1',
        date_of_birth: '1990-01-01', // string instead of date object
        created_at: 1700000000000, // timestamp number
      };
      const result = usersSchema.parse(user);
      expect(result.date_of_birth).toBeInstanceOf(Date);
      expect(result.created_at).toBeInstanceOf(Date);
    });

    it('should reject invalid enum values for plan', () => {
      const user = {
        first_name: 'A',
        last_name: 'B',
        email: 'a@b.com',
        phone_number: '1',
        password: '1',
        plan: 'ENTERPRISE', // Not in ['FREE', 'BASIC', 'PRO']
      };
      const result = usersSchema.safeParse(user);
      expect(result.success).toBe(false);
    });
  });

  describe('adminSchema', () => {
    it('should validate a valid admin', () => {
      const admin = {
        first_name: 'Admin',
        last_name: 'Super',
        email: 'admin@system.com',
        password: 'supersecret',
      };
      expect(adminSchema.safeParse(admin).success).toBe(true);
    });

    it('should enforce UUID format for admin_id if provided', () => {
      const adminInvalid = {
        admin_id: '12345', // Not a UUID
        first_name: 'Admin',
        last_name: 'Super',
        email: 'admin@system.com',
        password: 'supersecret',
      };
      expect(adminSchema.safeParse(adminInvalid).success).toBe(false);
      
      const adminValid = {
        ...adminInvalid,
        admin_id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
      };
      expect(adminSchema.safeParse(adminValid).success).toBe(true);
    });
  });

  describe('passwordResetsSchema', () => {
    it('should require email, token, and expires_at', () => {
      const reset = {
        email: 'user@example.com',
        token: 'abc123xyz',
        expires_at: new Date(),
      };
      expect(passwordResetsSchema.safeParse(reset).success).toBe(true);
    });

    it('should fail if token is empty', () => {
      const reset = {
        email: 'user@example.com',
        token: '',
        expires_at: new Date(),
      };
      expect(passwordResetsSchema.safeParse(reset).success).toBe(false);
    });
  });

});
