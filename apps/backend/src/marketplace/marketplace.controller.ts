import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { MarketplaceService } from './marketplace.service';
import {
  CreateMarketplaceProductDto,
  UpdateMarketplaceProductDto,
  ToggleFavoriteDto,
  ToggleWishlistDto,
  AddToCartDto,
  UpdateCartQuantityDto,
  SaveBankDetailsDto,
  CreateCheckoutDto,
  VerifyPaymentDto,
  UpdateOrderStatusDto,
} from './marketplace.dto';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @UseGuards(JwtAuthGuard)
  @Get('products')
  async getPublishedProducts(@Query('category') category?: string) {
    const products = await this.marketplaceService.findPublished(category);
    return { products };
  }

  @UseGuards(JwtAuthGuard)
  @Get('products/user/:userId')
  async getUserProducts(@Param('userId', ParseIntPipe) userId: number) {
    const products = await this.marketplaceService.findByUserId(userId);
    return { products };
  }

  @UseGuards(JwtAuthGuard)
  @Get('products/:id')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.marketplaceService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('products/add')
  async createProduct(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateMarketplaceProductDto,
  ) {
    return this.marketplaceService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('products/update/:id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpdateMarketplaceProductDto,
  ) {
    return this.marketplaceService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('products/publish/:id')
  async publishProduct(@Param('id', ParseIntPipe) id: number) {
    return this.marketplaceService.publish(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('products/unpublish/:id')
  async unpublishProduct(@Param('id', ParseIntPipe) id: number) {
    return this.marketplaceService.unpublish(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('products/delete/:id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.marketplaceService.delete(id);
    if (!deleted) {
      throw new HttpException(
        'Product not found or could not be deleted',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Product deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites/toggle')
  async toggleFavorite(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: ToggleFavoriteDto,
  ) {
    return this.marketplaceService.toggleFavorite(dto.user_id, dto.product_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('wishlist/toggle')
  async toggleWishlist(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: ToggleWishlistDto,
  ) {
    return this.marketplaceService.toggleWishlist(dto.user_id, dto.product_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites/user/:userId')
  async getFavorites(@Param('userId', ParseIntPipe) userId: number) {
    const products = await this.marketplaceService.getFavorites(userId);
    return { products };
  }

  @UseGuards(JwtAuthGuard)
  @Get('wishlist/user/:userId')
  async getWishlist(@Param('userId', ParseIntPipe) userId: number) {
    const products = await this.marketplaceService.getWishlist(userId);
    return { products };
  }

  @UseGuards(JwtAuthGuard)
  @Get('interactions/user/:userId')
  async getUserInteractions(@Param('userId', ParseIntPipe) userId: number) {
    return this.marketplaceService.getUserInteractions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('cart/user/:userId')
  async getCart(@Param('userId', ParseIntPipe) userId: number) {
    const items = await this.marketplaceService.getCart(userId);
    return { items };
  }

  @UseGuards(JwtAuthGuard)
  @Post('cart/add')
  async addToCart(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: AddToCartDto,
  ) {
    return this.marketplaceService.addToCart(
      dto.user_id,
      dto.product_id,
      dto.quantity,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('cart/update/:cartId')
  async updateCartQuantity(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpdateCartQuantityDto,
  ) {
    return this.marketplaceService.updateCartQuantity(cartId, dto.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cart/remove/:cartId')
  async removeFromCart(@Param('cartId', ParseIntPipe) cartId: number) {
    return this.marketplaceService.removeFromCart(cartId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bank/:userId')
  async getBankDetails(@Param('userId', ParseIntPipe) userId: number) {
    const details = await this.marketplaceService.getBankDetails(userId);
    return { data: details };
  }

  @UseGuards(JwtAuthGuard)
  @Post('bank/save')
  async saveBankDetails(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: SaveBankDetailsDto,
  ) {
    const result = await this.marketplaceService.saveBankDetails(dto);
    return { data: result, message: 'Bank details saved successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('bank/:userId')
  async deleteBankDetails(@Param('userId', ParseIntPipe) userId: number) {
    return this.marketplaceService.deleteBankDetails(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout/create-order')
  async createCheckoutOrder(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateCheckoutDto,
  ) {
    return this.marketplaceService.createCheckoutOrder(dto.user_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout/verify-payment')
  async verifyPayment(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: VerifyPaymentDto,
  ) {
    return this.marketplaceService.verifyPayment(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/user/:userId')
  async getOrdersByUser(@Param('userId', ParseIntPipe) userId: number) {
    const orders = await this.marketplaceService.getOrdersByUser(userId);
    return { orders };
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:orderId')
  async getOrderById(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.marketplaceService.getOrderById(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getAllOrders() {
    const orders = await this.marketplaceService.getAllOrders();
    return { orders };
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:orderId/update-status')
  async updateOrderStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpdateOrderStatusDto,
  ) {
    return this.marketplaceService.updateOrderStatus(orderId, dto.status);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:orderId/release')
  async releaseEscrow(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.marketplaceService.releaseEscrow(orderId);
  }
}
