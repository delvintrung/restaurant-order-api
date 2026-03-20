import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryEntity } from 'src/entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionLogModule } from '../actionLog/action-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity]), ActionLogModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
