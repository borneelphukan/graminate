import { Module } from '@nestjs/common';
import { CattleMilkModule } from './cattle-milk/cattle-milk.module';
import { CattleRearingModule } from './cattle-rearing/cattle-rearing.module';

@Module({
  imports: [CattleRearingModule, CattleMilkModule],
})
export class CattleModule {}
