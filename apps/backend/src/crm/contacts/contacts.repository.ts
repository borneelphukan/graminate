import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ContactsRepository {
  constructor(private readonly prisma: PrismaService) {}
  async getContacts(id?: string) {
    try {
      let contacts;

      if (id) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
          return {
            status: 400,
            data: { error: 'Invalid user ID parameter' },
          };
        }

        contacts = await this.prisma.contacts.findMany({
          where: { user_id: parsedId },
          orderBy: { created_at: 'desc' },
        });
      } else {
        contacts = await this.prisma.contacts.findMany({
          orderBy: { created_at: 'desc' },
        });
      }

      return { status: 200, data: { contacts } };
    } catch (err) {
      console.error('Error fetching contacts:', err);
      return { status: 500, data: { error: 'Failed to fetch contacts' } };
    }
  }

  async addContact(body: any) {
    const {
      user_id,
      first_name,
      last_name,
      email,
      phone_number,
      type,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
    } = body;

    if (
      !user_id ||
      !first_name ||
      !phone_number ||
      !type ||
      !address_line_1 ||
      !city ||
      !state ||
      !postal_code
    ) {
      return { status: 400, data: { error: 'Missing required fields' } };
    }

    try {
      const newContact = await this.prisma.contacts.create({
        data: {
          user_id,
          first_name,
          last_name: last_name || null,
          email: email || null,
          phone_number,
          type,
          address_line_1,
          address_line_2: address_line_2 || null,
          city,
          state,
          postal_code,
        },
      });

      return {
        status: 201,
        data: {
          message: 'Contact added successfully',
          contact: newContact,
        },
      };
    } catch (err) {
      console.error('Error adding contact:', err);
      return { status: 500, data: { error: 'Failed to add contact' } };
    }
  }

  async deleteContact(id: string) {
    const parsedId = parseInt(id, 10);

    if (!id || isNaN(parsedId)) {
      return { status: 400, data: { error: 'Invalid contact ID' } };
    }

    try {
      const existing = await this.prisma.contacts.findUnique({
        where: { contact_id: parsedId },
      });

      if (!existing) {
        return { status: 404, data: { error: 'Contact not found' } };
      }

      const deletedContact = await this.prisma.contacts.delete({
        where: { contact_id: parsedId },
      });

      return {
        status: 200,
        data: {
          message: 'Contact deleted successfully',
          contact: deletedContact,
        },
      };
    } catch (err) {
      console.error('Error deleting contact:', err);
      return { status: 500, data: { error: 'Failed to delete contact' } };
    }
  }

  async updateContact(body: any) {
    const {
      id,
      first_name,
      last_name,
      email,
      phone_number,
      type,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
    } = body;

    const parsedId = parseInt(id, 10);
    if (!id || isNaN(parsedId)) {
      return { status: 400, data: { error: 'Invalid contact ID' } };
    }

    try {
      const existing = await this.prisma.contacts.findUnique({
        where: { contact_id: parsedId },
      });

      if (!existing) {
        return { status: 404, data: { error: 'Contact not found' } };
      }

      const updatedContact = await this.prisma.contacts.update({
        where: { contact_id: parsedId },
        data: {
          first_name,
          last_name: last_name || null,
          email: email || null,
          phone_number:
            typeof phone_number === 'string' && phone_number.trim() === ''
              ? null
              : phone_number,
          type,
          address_line_1,
          address_line_2: address_line_2 || null,
          city,
          state,
          postal_code,
        },
      });

      return {
        status: 200,
        data: {
          message: 'Contact updated successfully',
          contact: updatedContact,
        },
      };
    } catch (err) {
      console.error('Error updating contact:', err);
      return { status: 500, data: { error: 'Failed to update contact' } };
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.contacts.deleteMany({});
      return { message: `Contacts table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
