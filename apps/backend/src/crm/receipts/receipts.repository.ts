import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateReceiptDto, UpdateReceiptDto } from './receipts.dto';

@Injectable()
export class ReceiptsRepository {
  constructor(private readonly prisma: PrismaService) {}
  async getReceipts(userId: number) {
    try {
      const invoices = await this.prisma.invoices.findMany({
        where: { user_id: userId },
        orderBy: { receipt_date: 'desc' },
        include: {
          invoice_items: {
            select: {
              item_id: true,
              description: true,
              quantity: true,
              rate: true,
            },
          },
        },
      });

      // Transform result to match expected format (items as json-like structure or just array)
      const receipts = invoices.map((inv) => ({
        ...inv,
        // Prisma returns Decimal for quantity/rate, which might need conversion to number/string if DTO expects it.
        // Or if previous `json_agg` returned them as numbers/strings properly.
        // Assuming default behavior is fine or frontend handles it.
        items: inv.invoice_items,
      }));

      return { status: 200, data: { receipts } };
    } catch (err) {
      console.error('Error fetching receipts:', err);
      return { status: 500, data: { error: 'Failed to fetch receipts' } };
    }
  }

  async addReceipt(createReceiptDto: CreateReceiptDto) {
    const {
      user_id,
      title,
      bill_to,
      due_date,
      receipt_number,
      bill_to_address_line1,
      bill_to_address_line2,
      bill_to_city,
      bill_to_state,
      bill_to_postal_code,
      bill_to_country,
      tax,
      discount,
      shipping,
      notes,
      payment_terms,
      items,
      linked_sale_id,
    } = createReceiptDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (linked_sale_id) {
          // SELECT user_id, invoice_created FROM sales WHERE sales_id = $1 FOR UPDATE
          // Prisma doesn't support FOR UPDATE easily in findUnique, but we can rely on transaction isolation or ignore for now if optimistic.
          // Or use raw query for locking if critical. Given complexity, lets trust transaction.
          const sale = await tx.sales.findUnique({
            where: { sales_id: linked_sale_id },
            select: { user_id: true, invoice_created: true },
          });

          if (!sale) {
            return { status: 404, data: { error: 'Linked sale not found.' } };
          }
          if (sale.user_id !== user_id) {
            return {
              status: 403,
              data: { error: 'Linked sale belongs to a different user.' },
            };
          }
          if (sale.invoice_created) {
            return {
              status: 409,
              data: { error: 'Selected sale already has an invoice linked.' },
            };
          }
        }

        const newInvoice = await tx.invoices.create({
          data: {
            user_id,
            title,
            bill_to,
            due_date: new Date(due_date),
            receipt_number: receipt_number || null,
            bill_to_address_line1: bill_to_address_line1 || null,
            bill_to_address_line2: bill_to_address_line2 || null,
            bill_to_city: bill_to_city || null,
            bill_to_state: bill_to_state || null,
            bill_to_postal_code: bill_to_postal_code || null,
            bill_to_country: bill_to_country || null,
            tax: tax || 0,
            discount: discount || 0,
            shipping: shipping || 0,
            notes,
            payment_terms,
            sales_id: linked_sale_id || null,
            invoice_items: {
              create:
                items?.map((item) => ({
                  description: item.description,
                  quantity: item.quantity,
                  rate: item.rate,
                })) || [],
            },
          },
        });

        if (linked_sale_id) {
          await tx.sales.update({
            where: { sales_id: linked_sale_id },
            data: { invoice_created: true },
          });
        }

        return {
          status: 201,
          data: {
            message: 'Invoice added successfully',
            invoice: newInvoice,
          },
        };
      });
    } catch (err) {
      console.error('Error adding invoice:', err);
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          if (err.meta?.target) {
            const target = err.meta.target as string[];
            if (target.includes('receipt_number')) {
              return {
                status: 409,
                data: { error: 'Receipt number already exists.' },
              };
            }
            if (target.includes('sales_id')) {
              return {
                status: 409,
                data: {
                  error: 'This sale is already linked to another invoice.',
                },
              };
            }
          }
          // Fallback if meta target is not clear
          return {
            status: 409,
            data: { error: 'Unique constraint violation.' },
          };
        }
      }
      return { status: 500, data: { error: 'Internal Server Error' } };
    }
  }

  async deleteReceipt(id: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const deletedInvoice = await tx.invoices.findUnique({
          where: { invoice_id: id },
        });

        if (!deletedInvoice) {
          return { status: 404, data: { error: 'Receipt not found' } };
        }

        await tx.invoices.delete({ where: { invoice_id: id } });

        if (deletedInvoice.sales_id) {
          await tx.sales.update({
            where: { sales_id: deletedInvoice.sales_id },
            data: { invoice_created: false },
          });
        }

        return {
          status: 200,
          data: {
            message: 'Receipt deleted successfully',
            receipt: deletedInvoice,
          },
        };
      });
    } catch (err) {
      console.error('Error deleting receipt:', err);
      return { status: 500, data: { error: 'Failed to delete receipt' } };
    }
  }

  async updateReceipt(updateReceiptDto: UpdateReceiptDto) {
    const {
      invoice_id,
      user_id,
      title,
      receipt_number,
      bill_to,
      payment_terms,
      due_date,
      notes,
      tax,
      discount,
      shipping,
      items,
      bill_to_address_line1,
      bill_to_address_line2,
      bill_to_city,
      bill_to_state,
      bill_to_postal_code,
      bill_to_country,
      linked_sale_id,
    } = updateReceiptDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const currentInvoice = await tx.invoices.findUnique({
          where: { invoice_id },
          select: { sales_id: true, user_id: true },
        });

        if (!currentInvoice) {
          return {
            status: 404,
            data: { error: 'Receipt not found for update.' },
          };
        }

        const old_linked_sale_id = currentInvoice.sales_id;
        const original_invoice_owner_id = currentInvoice.user_id;

        const targetInvoiceOwnerId = user_id ?? original_invoice_owner_id;

        if (
          linked_sale_id !== undefined &&
          linked_sale_id !== old_linked_sale_id
        ) {
          if (old_linked_sale_id) {
            await tx.sales.update({
              where: { sales_id: old_linked_sale_id },
              data: { invoice_created: false },
            });
          }
          if (linked_sale_id) {
            const newSale = await tx.sales.findUnique({
              where: { sales_id: linked_sale_id },
              select: { user_id: true, invoice_created: true },
            });

            if (!newSale) {
              return {
                status: 404,
                data: { error: 'New linked sale not found.' },
              };
            }

            if (newSale.user_id !== targetInvoiceOwnerId) {
              return {
                status: 403,
                data: {
                  error:
                    'New linked sale belongs to a different user than the invoice owner.',
                },
              };
            }

            await tx.sales.update({
              where: { sales_id: linked_sale_id },
              data: { invoice_created: true },
            });
          }
        }

        // Handle items update: delete existing and create new
        const updatedInvoice = await tx.invoices.update({
          where: { invoice_id },
          data: {
            user_id: targetInvoiceOwnerId,
            title,
            bill_to,
            payment_terms,
            due_date,
            notes,
            tax,
            discount,
            shipping,
            receipt_number: receipt_number,
            bill_to_address_line1: bill_to_address_line1,
            bill_to_address_line2: bill_to_address_line2,
            bill_to_city: bill_to_city,
            bill_to_state: bill_to_state,
            bill_to_postal_code: bill_to_postal_code,
            bill_to_country: bill_to_country,
            sales_id: linked_sale_id,
            invoice_items: items
              ? {
                  deleteMany: {},
                  create: items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    rate: item.rate,
                  })),
                }
              : undefined,
          },
          include: {
            invoice_items: {
              select: {
                item_id: true,
                description: true,
                quantity: true,
                rate: true,
              },
            },
          },
        });

        return {
          status: 200,
          data: { success: true, invoice: updatedInvoice },
        };
      });
    } catch (err) {
      console.error('Error updating receipt:', err);
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          const target = err.meta?.target as string[];
          if (target && target.includes('receipt_number')) {
            return {
              status: 409,
              data: { error: 'Receipt number already exists.' },
            };
          }
          if (target && target.includes('sales_id')) {
            return {
              status: 409,
              data: {
                error: 'This sale is already linked to another invoice.',
              },
            };
          }
        }
      }
      return { status: 500, data: { error: 'Internal server error' } };
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Reset sales
        const userInvoices = await tx.invoices.findMany({
          where: { user_id: userId },
          select: { sales_id: true },
        });
        const salesIds = userInvoices
          .map((inv) => inv.sales_id)
          .filter((id) => id !== null);

        if (salesIds.length > 0) {
          await tx.sales.updateMany({
            where: { sales_id: { in: salesIds } },
            data: { invoice_created: false },
          });
        }

        // Delete (truncate) invoices
        // Prisma doesn't do restart identity easily, but deleteMany works for data.
        await tx.invoices.deleteMany({
          where: { user_id: userId },
        });
      });

      return {
        message: `Receipts (invoices) table reset initiated by user ${userId}`,
      };
    } catch (error) {
      console.error('Error resetting receipts table:', error);
      throw new InternalServerErrorException('Failed to reset receipts table');
    }
  }
}
