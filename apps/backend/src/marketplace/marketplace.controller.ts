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
}
