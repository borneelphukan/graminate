import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  Res,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { Response } from 'express';
import { CreateContractDto, UpdateContractDto } from './contracts.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { contractsSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getContractsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    const result = await this.contractsService.getContracts(userId);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllContracts(@Res() res: Response) {
    const result = await this.contractsService.getContracts();
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(contractsSchema)
  @Post('add')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async addContract(
    @Body() createContractDto: CreateContractDto,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    createContractDto.user_id = req.user.userId!;
    const result = await this.contractsService.addContract(createContractDto);
    if (result.status >= 500) {
      console.error(
        'Controller error while adding contract:',
        result.data.error,
      );
    }
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteContract(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const result = await this.contractsService.deleteContract(id, req.user.userId!);
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
  async updateContract(
    @Body() updateContractDto: UpdateContractDto,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const result =
      await this.contractsService.updateContract(updateContractDto, req.user.userId!);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async reset(@Request() req: RequestWithUser) {
    return this.contractsService.resetTable(req.user.userId!);
  }
}
