import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import * as argon2 from 'argon2';

const subTypeMapping = {
  Producer: ['Poultry', 'Cattle Rearing', 'Apiculture'],
};

@Injectable()
export class UserRepository {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async getUserCount() {
    try {
      const count = await this.prisma.users.count();
      return { status: 200, data: { count } };
    } catch (err) {
      console.error('Error fetching user count:', err);
      return { status: 500, data: { error: 'Failed to fetch user count' } };
    }
  }

  async getAllUsers() {
    try {
      const usersList = await (this.prisma.users as any).findMany({
        orderBy: { created_at: 'desc' },
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          email: true,
          business_name: true,
          type: true,
          sub_type: true,
          plan: true,
          phone_number: true,
          country: true,
          subscription_expires_at: true,
          pending_plan: true,
          // opening_balance: true,
          created_at: true,
          // entity_type: true,
          // business_size: true,
        },
      });

      const users = usersList.map((user) => {
        const isSubscriptionActive =
          (user.plan !== 'FREE' || 
           (user.subscription_expires_at && new Date(user.subscription_expires_at) > new Date()));

        return {
          ...user,
          is_subscription_active: !!isSubscriptionActive,
        };
      });

      return { status: 200, data: { users } };
    } catch (err: any) {
      console.error('Error fetching all users:', err);
      throw new InternalServerErrorException(err.message || 'Failed to fetch all users');
    }
  }

  async getAvailableSubTypes(userId: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { user_id: Number(userId) },
        select: { type: true },
      });

      if (!user) {
        return { status: 404, data: { error: 'User not found' } };
      }

      const userType = user.type || '';
      const availableSubTypes = subTypeMapping[userType] || [];

      return { status: 200, data: { subTypes: availableSubTypes } };
    } catch (err) {
      console.error('Error fetching available sub-types:', err);
      return {
        status: 500,
        data: { error: 'Failed to fetch available sub-types' },
      };
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { user_id: Number(id) },
      });

      if (!user) {
        return { status: 404, data: { error: 'User not found' } };
      }

      // Check for pending plan transition
      const now = new Date();
      let currentPlan = user.plan;
      let currentExpiry = user.subscription_expires_at;

      if (currentExpiry && now > currentExpiry && (user as any).pending_plan) {
        const updatedUser = await (this.prisma.users as any).update({
          where: { user_id: Number(id) },
          data: {
            plan: (user as any).pending_plan,
            pending_plan: null,
            subscription_expires_at: null,
          },
        });
        currentPlan = updatedUser.plan;
        currentExpiry = updatedUser.subscription_expires_at;
      }

      const isSubscriptionActive = currentPlan !== 'FREE' && (!currentExpiry || now <= currentExpiry);

      return {
        status: 200,
        data: {
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            business_name: user.business_name,
            language: user.language || 'English',
            time_format: user.time_format || '24-hour',
            temperature_scale: user.temperature_scale || 'Celsius',
            type: user.type,
            sub_type: Array.isArray(user.sub_type)
              ? user.sub_type
              : typeof user.sub_type === 'string'
                ? (user.sub_type as string)
                    .replace(/[{}"]/g, '')
                    .split(',')
                    .filter(Boolean)
                : [],
            address_line_1: user.address_line_1 || '',
            address_line_2: user.address_line_2 || '',
            city: user.city || '',
            state: user.state || '',
            postal_code: user.postal_code || '',
            darkMode: user.darkMode,
            widgets: user.widgets || [],
            plan: String(currentPlan),
            country: String((user as any).country || ''),
            subscription_expires_at: currentExpiry,
            opening_balance: Number(user.opening_balance) || 0,
            is_subscription_active: isSubscriptionActive,
            entity_type: (user as any).entity_type,
            business_size: (user as any).business_size,
            pending_plan: (user as any).pending_plan,
          },
        },
      };
    } catch (err: any) {
      console.error('Error fetching user:', err);
      throw new InternalServerErrorException(err.message || 'Failed to fetch user');
    }
  }

  async updateUser(id: string, body: any) {
    const {
      first_name,
      last_name,
      phone_number,
      language,
      time_format,
      temperature_scale,
      type,
      business_name,
      sub_type,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      darkMode,
      widgets,
      opening_balance,
      entity_type,
      business_size,
      plan,
      pending_plan,
      subscription_expires_at,
    } = body;

    try {
      const userId = Number(id);
      const existing = await this.prisma.users.findUnique({
        where: { user_id: userId },
      });
      if (!existing) {
        return { status: 404, data: { error: 'User not found' } };
      }

      const updateData: any = {};
      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;
      if (phone_number !== undefined) updateData.phone_number = phone_number;
      if (language !== undefined) updateData.language = language;
      if (time_format !== undefined) updateData.time_format = time_format;
      if (temperature_scale !== undefined) updateData.temperature_scale = temperature_scale;
      if (type !== undefined) updateData.type = type;
      if (business_name !== undefined) updateData.business_name = business_name;
      if (address_line_1 !== undefined) updateData.address_line_1 = address_line_1;
      if (address_line_2 !== undefined) updateData.address_line_2 = address_line_2;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (postal_code !== undefined) updateData.postal_code = postal_code;
      if (country !== undefined) updateData.country = country;
      if (darkMode !== undefined) updateData.darkMode = darkMode;
      if (widgets !== undefined) updateData.widgets = widgets;
      if (opening_balance !== undefined) updateData.opening_balance = Number(opening_balance);
      if (entity_type !== undefined) updateData.entity_type = entity_type;
      if (business_size !== undefined) updateData.business_size = business_size;
      if (plan !== undefined) updateData.plan = plan;
      if (pending_plan !== undefined) updateData.pending_plan = pending_plan;
      if (subscription_expires_at !== undefined) updateData.subscription_expires_at = new Date(subscription_expires_at);

      if (sub_type !== undefined) {
        const validSubTypes = [
          'Fishery',
          'Poultry',
          'Cattle Rearing',
          'Apiculture',
        ];
        const filteredSubTypes = Array.isArray(sub_type)
          ? sub_type.filter((t) => validSubTypes.includes(t))
          : [];
        updateData.sub_type = filteredSubTypes;
      }

      if (Object.keys(updateData).length === 0) {
        return { status: 400, data: { error: 'No fields to update' } };
      }

      await this.prisma.users.update({
        where: { user_id: userId },
        data: updateData,
      });

      return { status: 200, data: { message: 'User updated successfully' } };
    } catch (err) {
      console.error('Error updating user:', err);
      return { status: 500, data: { error: 'Failed to update user' } };
    }
  }

  async logout(loginId: string) {
    try {
      await this.prisma.login_history.update({
        where: { login_id: loginId },
        data: { logged_out_at: new Date() },
      });
      return { status: 200, data: { message: 'Logged out successfully' } };
    } catch (err) {
      console.error('Error logging out:', err);
      return { status: 500, data: { error: 'Failed to log out' } };
    }
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { email },
      });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValid = await argon2.verify(user.password, password);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      return user;
    } catch (err) {
      console.error('Error validating user:', err);
      throw new Error('Invalid email or password');
    }
  }

  async registerUser(body: any) {
    const {
      first_name,
      last_name,
      email,
      phone_number,
      business_name,
      date_of_birth,
      password,
      type,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      darkMode,
    } = body;

    if (!first_name || !last_name || !email || !phone_number || !password) {
      return { status: 400, data: { error: 'Missing required fields' } };
    }

    try {
      // Check for existing user with same email or phone using OR
      const existing = await this.prisma.users.findFirst({
        where: {
          OR: [{ email: email }, { phone_number: phone_number }],
        },
      });

      if (existing) {
        return {
          status: 409,
          data: { error: 'Email or phone number already in use' },
        };
      }

      const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        hashLength: 16,
        timeCost: 2,
        memoryCost: 2 ** 16,
        parallelism: 1,
      });

      const registeredUser = await this.prisma.users.create({
        data: {
          first_name,
          last_name,
          email,
          phone_number,
          business_name: business_name || null,
          date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
          password: hashedPassword,
          type: type || null,
          address_line_1: address_line_1 || null,
          address_line_2: address_line_2 || null,
          city: city || null,
          state: state || null,
          postal_code: postal_code || null,
          country: country || null,
          darkMode: darkMode || false,
          widgets: ['Task Calendar'],
          entity_type: body.entity_type || null,
          business_size: body.business_size || null,
          plan: 'FREE',
          subscription_expires_at: null,
        },
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          business_name: true,
          type: true,
          address_line_1: true,
          address_line_2: true,
          city: true,
          state: true,
          postal_code: true,
          country: true,
          darkMode: true,
          widgets: true,
          plan: true,
          subscription_expires_at: true,
          entity_type: true,
          business_size: true,
        },
      });

      return {
        status: 201,
        data: {
          message: 'User registered successfully',
          user: {
            ...registeredUser,
            is_subscription_active: false,
          },
        },
      };
    } catch (err: any) {
      console.error('Error registering user:', err);
      throw new InternalServerErrorException(err.message || 'Failed to register user');
    }
  }

  async deleteUser(id: string) {
    try {
      const userId = Number(id);
      const existing = await this.prisma.users.findUnique({
        where: { user_id: userId },
      });
      if (!existing) {
        return { status: 404, data: { error: 'User not found' } };
      }
      await this.prisma.users.delete({ where: { user_id: userId } });
      return { status: 200, data: { message: 'User deleted successfully' } };
    } catch (err) {
      console.error('Error deleting user:', err);
      return { status: 500, data: { error: 'Failed to delete user' } };
    }
  }

  async verifyPassword(userId: string, password: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { user_id: Number(userId) },
        select: { password: true },
      });
      if (!user) {
        return { status: 404, data: { error: 'User not found' } };
      }

      const isValid = await argon2.verify(user.password, password);

      return {
        status: isValid ? 200 : 401,
        data: { valid: isValid },
      };
    } catch (err) {
      console.error('Error verifying password:', err);
      return { status: 500, data: { error: 'Failed to verify password' } };
    }
  }

  async scheduleDowngrade(userId: string, targetPlan: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { user_id: Number(userId) },
        select: { plan: true, subscription_expires_at: true }
      });

      if (!user) return { status: 404, data: { error: 'User not found' } };

      const planHierarchy = { 'FREE': 0, 'BASIC': 1, 'PRO': 2 };
      const currentLevel = planHierarchy[user.plan as keyof typeof planHierarchy] || 0;
      const targetLevel = planHierarchy[targetPlan as keyof typeof planHierarchy] || 0;

      if (targetLevel >= currentLevel) {
        return { status: 400, data: { error: 'Cannot schedule upgrade or same-level plan. Please use the subscribe flow for upgrades.' } };
      }

      await (this.prisma.users as any).update({
        where: { user_id: Number(userId) },
        data: {
          pending_plan: targetPlan as any,
        },
      });

      const expiryStr = user.subscription_expires_at 
        ? new Date(user.subscription_expires_at).toLocaleDateString() 
        : "the end of your billing cycle";

      return { status: 200, data: { message: `Your plan will be changed to ${targetPlan.charAt(0) + targetPlan.slice(1).toLowerCase()} at the end of your current billing cycle (${expiryStr}).` } };
    } catch (err) {
      console.error('Error scheduling plan downgrade:', err);
      return { status: 500, data: { error: 'Failed to schedule plan downgrade' } };
    }
  }

  async findByEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    return user || null;
  }
}
