import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { FloricultureService } from './floriculture.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { floriculture } from '@prisma/client';
import { floricultureSchema } from '@graminate/shared';
import { UserService } from '../user/user.service';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';
import { RequestWithUser } from '@/common/types/request.type';

@UseGuards(JwtAuthGuard)
@Controller('floriculture')
export class FloricultureController {
  constructor(
    private readonly floricultureService: FloricultureService,
    private readonly userService: UserService,
  ) {}

  @UseZodSchema(floricultureSchema, { partial: true })
  @Post('add')
  create(
    @Body() body: Partial<floriculture>,
    @Request() req: RequestWithUser,
  ): Promise<floriculture> {
    body.user_id = req.user.userId!;
    return this.floricultureService.create(body);
  }

  @Post('notifications/user/:id')
  async createNotification(
    @Param('id') id: string,
    @Body() data: { title: string; message: string; type?: string },
    @Request() req: RequestWithUser,
  ): Promise<any> {
    if (String(req.user.userId) !== id) throw new UnauthorizedException();
    return this.userService.createNotification(id, data);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ): Promise<{ floricultures: floriculture[] }> {
    if (String(req.user.userId) !== String(userId)) {
      throw new UnauthorizedException('Access denied');
    }
    return this.floricultureService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<floriculture | null> {
    return this.floricultureService.findOne(id);
  }

  @Get('watering/:userId')
  getWateringEvents(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ): Promise<any[]> {
    if (String(req.user.userId) !== String(userId)) {
      throw new UnauthorizedException('Access denied');
    }
    return this.floricultureService.getWateringEvents(userId);
  }

  @Get('watering/:userId/:date')
  getWateringByDate(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('date') date: string,
  ): Promise<any[]> {
    return this.floricultureService.getWateringByDate(userId, date);
  }

  @Post('watering')
  updateWatering(
    @Body()
    body: {
      userId: number;
      flowerId: number;
      date: string;
      watered: boolean;
    },
    @Request() req: RequestWithUser,
  ): Promise<any> {
    return this.floricultureService.updateWatering(
      req.user.userId!,
      body.flowerId,
      body.date,
      body.watered,
    );
  }

  @UseZodSchema(floricultureSchema, { partial: true })
  @Put('update/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ): Promise<floriculture> {
    return this.floricultureService.update(id, body);
  }

  @Delete('delete/:id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<floriculture> {
    return this.floricultureService.remove(id);
  }

  @Post('delete-multiple')
  removeMultiple(@Body('ids') ids: number[]): Promise<any> {
    return this.floricultureService.removeMultiple(ids);
  }

  @Post('reset-service')
  async reset(@Request() req: RequestWithUser): Promise<{ message: string }> {
    const userId = req.user.userId!;
    await this.floricultureService.reset(userId);
    return { message: `Floriculture table reset for user ${userId}` };
  }
}
