import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreatePoultryFeedDto,
  UpdatePoultryFeedDto,
} from './poultry-feeds.dto';

interface PoultryFeedFilters {
  limit?: number;
  offset?: number;
  flockId?: number;
}

@Injectable()
export class PoultryFeedsService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserIdWithFilters(
    userId: number,
    filters: PoultryFeedFilters,
  ): Promise<any[]> {
    const { limit, offset, flockId } = filters;

    try {
      const where: any = { user_id: userId };
      if (flockId !== undefined) where.flock_id = flockId;

      const feeds = await this.prisma.poultry_feeds.findMany({
        where,
        orderBy: [
          { feed_date: 'desc' },
          { created_at: 'desc' },
          { feed_id: 'desc' },
        ],
        take: limit,
        skip: offset,
      });

      return feeds;
    } catch (error) {
      console.error(
        'Error executing query in findByUserIdWithFilters (PoultryFeeds):',
        error,
      );
      throw new InternalServerErrorException(
        `Database query failed: ${error.message}`,
      );
    }
  }

  async findById(id: number): Promise<any> {
    try {
      const feed = await this.prisma.poultry_feeds.findUnique({
        where: { feed_id: id },
      });
      return feed || null;
    } catch (error) {
      console.error('Error executing query in findById (PoultryFeeds):', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createDto: CreatePoultryFeedDto): Promise<any> {
    const { user_id, flock_id, feed_given, amount_given, units, feed_date } =
      createDto;
    try {
      const newFeed = await this.prisma.poultry_feeds.create({
        data: {
          user_id,
          flock_id,
          feed_given,
          amount_given,
          units,
          feed_date: new Date(feed_date),
        },
      });
      return newFeed;
    } catch (error) {
      console.error('Error executing query in create (PoultryFeeds):', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateDto: UpdatePoultryFeedDto): Promise<any> {
    const { feed_given, amount_given, units, feed_date } = updateDto || {};
    try {
      const updateData: any = {};
      if (feed_given !== undefined) updateData.feed_given = feed_given;
      if (amount_given !== undefined) updateData.amount_given = amount_given;
      if (units !== undefined) updateData.units = units;
      if (feed_date !== undefined) updateData.feed_date = new Date(feed_date);

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const updatedFeed = await this.prisma.poultry_feeds.update({
        where: { feed_id: id },
        data: updateData,
      });

      return updatedFeed;
    } catch (error) {
      console.error('Error executing query in update (PoultryFeeds):', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.poultry_feeds.delete({ where: { feed_id: id } });
      return true;
    } catch (error) {
      console.error('Error executing query in delete (PoultryFeeds):', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.poultry_feeds.deleteMany({});
      return { message: `Poultry Feeds table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
