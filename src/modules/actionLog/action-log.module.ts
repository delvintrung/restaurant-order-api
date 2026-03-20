import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionLogEntity } from 'src/entities/action-log.entity';
import { ActionLogController } from './action-log.controller';
import { ActionLogService } from './action-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActionLogEntity])],
  controllers: [ActionLogController],
  providers: [ActionLogService],
  exports: [ActionLogService],
})
export class ActionLogModule {}
