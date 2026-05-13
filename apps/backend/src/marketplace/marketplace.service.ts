import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateMarketplaceProductDto,
  UpdateMarketplaceProductDto,
  SaveBankDetailsDto,
} from './marketplace.dto';
import { Prisma, marketplace_products } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

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
        throw new NotFoundException(`Product with ID ${productId} not found.`);
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

  async getCart(userId: number) {
    try {
      return await this.prisma.marketplace_cart.findMany({
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
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async addToCart(userId: number, productId: number, quantity = 1) {
    try {
      const existing = await this.prisma.marketplace_cart.findUnique({
        where: {
          user_id_product_id: { user_id: userId, product_id: productId },
        },
      });

      if (existing) {
        return await this.prisma.marketplace_cart.update({
          where: { cart_id: existing.cart_id },
          data: {
            quantity: existing.quantity + quantity,
            updated_at: new Date(),
          },
        });
      }

      return await this.prisma.marketplace_cart.create({
        data: { user_id: userId, product_id: productId, quantity },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async updateCartQuantity(cartId: number, quantity: number) {
    try {
      return await this.prisma.marketplace_cart.update({
        where: { cart_id: cartId },
        data: { quantity, updated_at: new Date() },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async removeFromCart(cartId: number) {
    try {
      await this.prisma.marketplace_cart.delete({
        where: { cart_id: cartId },
      });
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async getBankDetails(userId: number) {
    return this.prisma.bank_details.findUnique({
      where: { user_id: userId },
    });
  }

  async saveBankDetails(dto: SaveBankDetailsDto) {
    try {
      return await this.prisma.bank_details.upsert({
        where: { user_id: dto.user_id },
        update: {
          cardholder_name: dto.cardholder_name,
          card_number: dto.card_number,
          expiry_date: dto.expiry_date,
          card_type: dto.card_type || null,
        },
        create: {
          user_id: dto.user_id,
          cardholder_name: dto.cardholder_name,
          card_number: dto.card_number,
          expiry_date: dto.expiry_date,
          card_type: dto.card_type || null,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async deleteBankDetails(userId: number) {
    try {
      await this.prisma.bank_details.delete({
        where: { user_id: userId },
      });
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async createCheckoutOrder(userId: number) {
    const cartItems = await this.prisma.marketplace_cart.findMany({
      where: { user_id: userId },
      include: {
        product: {
          include: { users: { select: { user_id: true } } },
        },
      },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    for (const item of cartItems) {
      if (item.quantity > item.product.quantity) {
        throw new BadRequestException(
          `Not enough stock for product "${item.product.name}". Available: ${item.product.quantity}`,
        );
      }
      if (item.product.status !== 'PUBLISHED') {
        throw new BadRequestException(
          `Product "${item.product.name}" is no longer active on the marketplace`,
        );
      }
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const totalAmount = subtotal + cgst + sgst;
    const totalAmountPaise = Math.round(totalAmount * 100);

    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      throw new InternalServerErrorException(
        'Razorpay credentials not configured',
      );
    }

    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: totalAmountPaise,
        currency: 'INR',
        receipt: `mkt_${userId}_${Date.now()}`,
      }),
    });

    const razorpayOrder = await razorpayRes.json();

    if (!razorpayOrder.id) {
      throw new InternalServerErrorException('Failed to create Razorpay order');
    }

    const order = await this.prisma.marketplace_orders.create({
      data: {
        buyer_id: userId,
        razorpay_order_id: razorpayOrder.id,
        total_amount: totalAmount,
        cgst,
        sgst,
        status: 'PENDING',
        items: {
          create: cartItems.map((item) => ({
            product_id: item.product_id,
            producer_id: item.product.user_id,
            quantity: item.quantity,
            unit_price: Number(item.product.price),
          })),
        },
      },
      include: { items: true },
    });

    return {
      order_id: order.order_id,
      razorpay_order_id: razorpayOrder.id,
      amount: totalAmountPaise,
      currency: 'INR',
      key_id: keyId,
    };
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      throw new InternalServerErrorException(
        'Razorpay credentials not configured',
      );
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new BadRequestException('Payment verification failed');
    }

    const order = await this.prisma.marketplace_orders.findFirst({
      where: { razorpay_order_id: razorpayOrderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.prisma.$transaction(async (tx) => {
      // Update order status
      await tx.marketplace_orders.update({
        where: { order_id: order.order_id },
        data: {
          razorpay_payment_id: razorpayPaymentId,
          status: 'PAID',
          paid_at: new Date(),
        },
      });

      // Reduce quantity for each product in the order
      for (const item of order.items) {
        const product = await tx.marketplace_products.findUnique({
          where: { product_id: item.product_id },
        });

        if (product) {
          const newQuantity = Math.max(0, product.quantity - item.quantity);
          const newStatus = newQuantity <= 0 ? 'SOLD_OUT' : product.status;

          await tx.marketplace_products.update({
            where: { product_id: item.product_id },
            data: {
              quantity: newQuantity,
              status: newStatus,
            },
          });

          // Create an inventory entry for the buyer, initially unassigned (null warehouse_id)
          await tx.inventory.create({
            data: {
              user_id: order.buyer_id,
              item_name: product.name,
              item_group: product.category,
              units: product.units,
              quantity: item.quantity,
              price_per_unit: item.unit_price,
              warehouse_id: null, // Explicitly unassigned
            },
          });
        }
      }

      // Clear the user's cart
      await tx.marketplace_cart.deleteMany({
        where: { user_id: order.buyer_id },
      });
    });

    return { success: true, order_id: order.order_id };
  }

  async getOrdersByUser(userId: number) {
    return this.prisma.marketplace_orders.findMany({
      where: { buyer_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true, units: true } },
            producer: {
              select: {
                first_name: true,
                last_name: true,
                business_name: true,
              },
            },
          },
        },
      },
    });
  }

  async getOrderById(orderId: number) {
    const order = await this.prisma.marketplace_orders.findUnique({
      where: { order_id: orderId },
      include: {
        buyer: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            business_name: true,
          },
        },
        items: {
          include: {
            product: {
              select: { name: true, images: true, units: true, category: true },
            },
            producer: {
              select: {
                first_name: true,
                last_name: true,
                business_name: true,
              },
            },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getAllOrders() {
    return this.prisma.marketplace_orders.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        buyer: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            business_name: true,
          },
        },
        items: {
          include: {
            product: { select: { name: true, images: true, units: true } },
            producer: {
              select: {
                first_name: true,
                last_name: true,
                business_name: true,
              },
            },
          },
        },
      },
    });
  }

  async updateOrderStatus(orderId: number, status: string) {
    const validStatuses = [
      'PENDING',
      'PAID',
      'SHIPPED',
      'DELIVERED',
      'RELEASED',
      'CANCELLED',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    const updateData: any = { status: status as any };

    if (status === 'SHIPPED') {
      updateData.shipped_at = new Date();
      updateData.delivered_at = null;
    } else if (status === 'DELIVERED') {
      updateData.delivered_at = new Date();
    } else if (status === 'PAID') {
      updateData.shipped_at = null;
      updateData.delivered_at = null;
    }

    return this.prisma.marketplace_orders.update({
      where: { order_id: orderId },
      data: updateData,
    });
  }

  async releaseEscrow(orderId: number) {
    const order = await this.prisma.marketplace_orders.findUnique({
      where: { order_id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'DELIVERED' && order.status !== 'PAID') {
      throw new BadRequestException(
        'Order must be PAID or DELIVERED to release escrow',
      );
    }

    await this.prisma.$transaction([
      this.prisma.marketplace_order_items.updateMany({
        where: { order_id: orderId },
        data: { escrow_released: true },
      }),
      this.prisma.marketplace_orders.update({
        where: { order_id: orderId },
        data: { status: 'RELEASED', released_at: new Date() },
      }),
    ]);

    return { success: true, message: 'Escrow released successfully' };
  }
}
