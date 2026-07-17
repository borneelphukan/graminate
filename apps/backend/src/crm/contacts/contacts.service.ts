import { Injectable } from '@nestjs/common';
import { ContactsRepository } from './contacts.repository';
import { contacts } from '@prisma/client';

@Injectable()
export class ContactsService {
  constructor(private readonly contactsRepository: ContactsRepository) {}

  async getContacts(id?: string): Promise<{
    status: number;
    data: { contacts?: contacts[]; error?: string };
  }> {
    return this.contactsRepository.getContacts(id);
  }

  async addContact(body: Partial<contacts>): Promise<{
    status: number;
    data: { message?: string; error?: string; contact?: contacts };
  }> {
    return this.contactsRepository.addContact(body);
  }

  async deleteContact(id: string, userId?: number): Promise<{
    status: number;
    data: { message?: string; error?: string; contact?: contacts };
  }> {
    return this.contactsRepository.deleteContact(id, userId);
  }

  async updateContact(
    body: Partial<contacts> & { contact_id: number },
    userId?: number,
  ): Promise<{
    status: number;
    data: { message?: string; error?: string; contact?: contacts };
  }> {
    return this.contactsRepository.updateContact(body, userId);
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    return this.contactsRepository.resetTable(userId);
  }
}
