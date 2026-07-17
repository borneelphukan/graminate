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
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateContactDto } from './contacts.dto';
import { ContactsService } from './contacts.service';
import { Response } from 'express';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { contacts } from '@prisma/client';
import { contactsSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getContacts(@Param('id') id: string, @Res() res: Response) {
    const result = await this.contactsService.getContacts(id);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllContacts(@Res() res: Response) {
    const result = await this.contactsService.getContacts();
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(contactsSchema)
  @Post('add')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async addContact(@Body() body: CreateContactDto, @Request() req: RequestWithUser, @Res() res: Response) {
    body.user_id = req.user.userId!;
    const result = await this.contactsService.addContact(body);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteContact(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const result = await this.contactsService.deleteContact(id, req.user.userId!);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(contactsSchema, { partial: true })
  @Put('update')
  async updateContact(
    @Body() body: Partial<contacts> & { contact_id: number },
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const result = await this.contactsService.updateContact(body, req.user.userId!);
    return res.status(result.status).json(result.data);
  }
}
