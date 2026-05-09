import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateMarketplaceProductDto,
  UpdateMarketplaceProductDto,
} from './marketplace.dto';
import { Prisma, marketplace_products } from '@prisma/client';

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number): Promise<marketplace_products[]> {
    try {
      return await this.prisma.marketplace_products.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async findPublished(category?: string): Promise<marketplace_products[]> {
    try {
      const where: Prisma.marketplace_productsWhereInput = {
        status: 'PUBLISHED',
      };
      if (category) {
        where.category = category;
      }
      return await this.prisma.marketplace_products.findMany({
        where,
        orderBy: { published_at: 'desc' },
        include: {
          users: {
            select: {
              user_id: true,
              first_name: true,
              last_name: true,
              business_name: true,
              city: true,
              state: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async findById(productId: number): Promise<marketplace_products> {
    try {
      const product = await this.prisma.marketplace_products.findUnique({
        where: { product_id: productId },
        include: {
          users: {
            select: {
              user_id: true,
              first_name: true,
              last_name: true,
              business_name: true,
              city: true,
              state: true,
            },
          },
        },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${productId} not found.`,
        );
      }
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async create(
    dto: CreateMarketplaceProductDto,
  ): Promise<marketplace_products> {
    try {
      return await this.prisma.marketplace_products.create({
        data: {
          user_id: dto.user_id,
          inventory_id: dto.inventory_id || null,
          name: dto.name,
          description: dto.description || null,
          category: dto.category,
          price: dto.price,
          units: dto.units,
          quantity: dto.quantity || 1,
          images: dto.images || [],
          status: 'DRAFT',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(
    productId: number,
    dto: UpdateMarketplaceProductDto,
  ): Promise<marketplace_products> {
    await this.findById(productId);

    try {
      const updateData: Prisma.marketplace_productsUpdateInput = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.category !== undefined) updateData.category = dto.category;
      if (dto.price !== undefined) updateData.price = dto.price;
      if (dto.units !== undefined) updateData.units = dto.units;
      if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
      if (dto.images !== undefined) updateData.images = dto.images;

      if (Object.keys(updateData).length === 0) {
        return this.findById(productId);
      }

      return await this.prisma.marketplace_products.update({
        where: { product_id: productId },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async publish(productId: number): Promise<marketplace_products> {
    await this.findById(productId);

    try {
      return await this.prisma.marketplace_products.update({
        where: { product_id: productId },
        data: {
          status: 'PUBLISHED',
          published_at: new Date(),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async unpublish(productId: number): Promise<marketplace_products> {
    await this.findById(productId);

    try {
      return await this.prisma.marketplace_products.update({
        where: { product_id: productId },
        data: { status: 'DRAFT' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(productId: number): Promise<boolean> {
    try {
      await this.prisma.marketplace_products.delete({
        where: { product_id: productId },
      });
      return true;
    } catch {
      return false;
    }
  }

  async toggleFavorite(
    userId: number,
    productId: number,
  ): Promise<{ favorited: boolean }> {
    try {
      const existing = await this.prisma.marketplace_favorites.findUnique({
        where: {
          user_id_product_id: { user_id: userId, product_id: productId },
        },
      });

      if (existing) {
        await this.prisma.marketplace_favorites.delete({
          where: { favorite_id: existing.favorite_id },
        });
        return { favorited: false };
      }

      await this.prisma.marketplace_favorites.create({
        data: { user_id: userId, product_id: productId },
      });
      return { favorited: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Already favorited');
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async toggleWishlist(
    userId: number,
    productId: number,
  ): Promise<{ wishlisted: boolean }> {
    try {
      const existing = await this.prisma.marketplace_wishlist.findUnique({
        where: {
          user_id_product_id: { user_id: userId, product_id: productId },
        },
      });

      if (existing) {
        await this.prisma.marketplace_wishlist.delete({
          where: { wishlist_id: existing.wishlist_id },
        });
        return { wishlisted: false };
      }

      await this.prisma.marketplace_wishlist.create({
        data: { user_id: userId, product_id: productId },
      });
      return { wishlisted: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Already in wishlist');
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async getFavorites(userId: number): Promise<marketplace_products[]> {
    try {
      const favorites = await this.prisma.marketplace_favorites.findMany({
        where: { user_id: userId },
        include: {
          product: {
            include: {
              users: {
                select: {
                  user_id: true,
                  first_name: true,
                  last_name: true,
                  business_name: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
      return favorites.map((f) => f.product);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async getWishlist(userId: number): Promise<marketplace_products[]> {
    try {
      const wishlist = await this.prisma.marketplace_wishlist.findMany({
        where: { user_id: userId },
        include: {
          product: {
            include: {
              users: {
                select: {
                  user_id: true,
                  first_name: true,
                  last_name: true,
                  business_name: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
      return wishlist.map((w) => w.product);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async getUserInteractions(
    userId: number,
  ): Promise<{ favorites: number[]; wishlist: number[] }> {
    try {
      const [favorites, wishlist] = await Promise.all([
        this.prisma.marketplace_favorites.findMany({
          where: { user_id: userId },
          select: { product_id: true },
        }),
        this.prisma.marketplace_wishlist.findMany({
          where: { user_id: userId },
          select: { product_id: true },
        }),
      ]);
      return {
        favorites: favorites.map((f) => f.product_id),
        wishlist: wishlist.map((w) => w.product_id),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
