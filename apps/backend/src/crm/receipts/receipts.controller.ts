import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CreateReceiptDto, UpdateReceiptDto } from './receipts.dto';
import { ReceiptsService } from './receipts.service';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getReceipts(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const result = await this.receiptsService.getReceipts(id);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async addReceipt(
    @Body() createReceiptDto: CreateReceiptDto,
    @Res() res: Response,
  ) {
    const result = await this.receiptsService.addReceipt(createReceiptDto);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const result = await this.receiptsService.deleteReceipt(id);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async updateReceipt(
    @Body() updateReceiptDto: UpdateReceiptDto,
    @Res() res: Response,
  ) {
    const result = await this.receiptsService.updateReceipt(updateReceiptDto);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async reset(@Body('userId', ParseIntPipe) userId: number) {
    return this.receiptsService.resetTable(userId);
  }
}
