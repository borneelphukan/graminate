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
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { CreateReceiptDto, UpdateReceiptDto } from './receipts.dto';
import { ReceiptsService } from './receipts.service';
import { invoicesSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

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
  @UseZodSchema(invoicesSchema)
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
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    createReceiptDto.user_id = req.user.userId!;
    const result = await this.receiptsService.addReceipt(createReceiptDto);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const result = await this.receiptsService.deleteReceipt(
      id,
      req.user.userId,
    );
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
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const result = await this.receiptsService.updateReceipt(
      updateReceiptDto,
      req.user.userId,
    );
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async reset(@Request() req: RequestWithUser) {
    return this.receiptsService.resetTable(req.user.userId!);
  }
}
