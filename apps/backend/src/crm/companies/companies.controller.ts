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
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Response } from 'express';
import { CreateCompanyDto } from './companies.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { companies } from '@prisma/client';
import { companiesSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getCompanies(@Param('id') id: string, @Res() res: Response) {
    const result = await this.companiesService.getCompanies(id);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllCompanies(
    @Res() res: Response,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit) : undefined;
    const parsedOffset = offset ? parseInt(offset) : undefined;
    const result = await this.companiesService.getCompanies(
      undefined,
      parsedLimit,
      parsedOffset,
    );
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(companiesSchema)
  @Post('add')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async addCompany(@Body() body: CreateCompanyDto, @Request() req: RequestWithUser, @Res() res: Response) {
    body.user_id = req.user.userId!;
    const result = await this.companiesService.addCompany(body);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteCompany(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const result = await this.companiesService.deleteCompany(id, req.user.userId!);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateCompany(
    @Body() body: Partial<companies> & { company_id: number },
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const result = await this.companiesService.updateCompany(body, req.user.userId!);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async reset(@Request() req: RequestWithUser, @Res() res: Response) {
    try {
      const result = await this.companiesService.resetTable(req.user.userId!);
      return res.status(200).json(result);
    } catch {
      return res.status(500).json({ error: 'Failed to reset companies table' });
    }
  }
}
