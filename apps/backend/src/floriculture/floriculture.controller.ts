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
import { RequestWithUser } from '@/common/types/request.type';

@UseGuards(JwtAuthGuard)
@Controller('floriculture')
export class FloricultureController {
  constructor(
    private readonly floricultureService: FloricultureService,
    private readonly userService: UserService,
  ) {}

  @Post('add')
  create(@Body() body: Partial<floriculture>): Promise<floriculture> {
    if (body && ((body as any).planting_date === '' || (body as any).planting_date === 'Invalid Date')) {
      (body as any).planting_date = null;
    }
    const parsed = floricultureSchema.partial().parse(body);
    return this.floricultureService.create(parsed);
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
  ): Promise<{ floricultures: floriculture[] }> {
    return this.floricultureService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<floriculture | null> {
    return this.floricultureService.findOne(id);
  }

  @Get('watering/:userId')
  getWateringEvents(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any[]> {
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
  ): Promise<any> {
    return this.floricultureService.updateWatering(
      body.userId,
      body.flowerId,
      body.date,
      body.watered,
    );
  }

  @Put('update/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ): Promise<floriculture> {
    if (body && (body.planting_date === '' || body.planting_date === 'Invalid Date')) {
      body.planting_date = null;
    }
    const parsed = floricultureSchema.partial().parse(body);
    return this.floricultureService.update(id, parsed);
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
  async reset(@Body('userId') userId: number): Promise<{ message: string }> {
    await this.floricultureService.reset(userId);
    return { message: `Floriculture table reset for user ${userId}` };
  }
}
