import { Injectable } from '@nestjs/common';
import { ContactsRepository } from './contacts.repository';

@Injectable()
export class ContactsService {
  constructor(private readonly contactsRepository: ContactsRepository) {}

  async getContacts(id?: string) {
    return this.contactsRepository.getContacts(id);
  }

  async addContact(body: any) {
    return this.contactsRepository.addContact(body);
  }

  async deleteContact(id: string) {
    return this.contactsRepository.deleteContact(id);
  }

  async updateContact(body: any) {
    return this.contactsRepository.updateContact(body);
  }

  async resetTable(userId: number) {
    return this.contactsRepository.resetTable(userId);
  }
}
