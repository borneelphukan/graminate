import { Module } from '@nestjs/common';
import { FlockModule } from './flock/flock.module';
import { PoultryHealthModule } from './poultry-health/poultry-health.module';
import { PoultryEggsModule } from './poultry-eggs/poultry-eggs.module';
import { PoultryFeedsModule } from './poultry-feeds/poultry-feeds.module';

@Module({
  imports: [
    FlockModule,
    PoultryHealthModule,
    PoultryEggsModule,
    PoultryFeedsModule,
  ],
})
export class PoultryModule {}
