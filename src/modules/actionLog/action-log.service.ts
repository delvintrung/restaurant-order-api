import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActionLogEntity } from 'src/entities/action-log.entity';
import { CreateActionLogDto } from './dto/create-action-log.dto';
import { CurrentUserDto } from '../account/dto/current-user.dto';

@Injectable()
export class ActionLogService {
  constructor(
    @InjectRepository(ActionLogEntity)
    private readonly actionLogRepository: Repository<ActionLogEntity>,
  ) {}

  async create(
    createActionLogDto: CreateActionLogDto,
    currentUser: CurrentUserDto,
  ) {
    const actionLog = new ActionLogEntity();
    actionLog.action = createActionLogDto.action;
    actionLog.userId = createActionLogDto.userId;
    actionLog.restaurantId = createActionLogDto.restaurantId;
    actionLog.description = createActionLogDto.description;
    actionLog.createdBy = currentUser.role;
    actionLog.isActive = true;

    return await this.actionLogRepository.save(actionLog);
  }

  /**
   * Lấy tất cả các log hành động
   */
  async findAll() {
    return await this.actionLogRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy tất cả log hành động theo userId
   */
  async findByUserId(userId: string) {
    return await this.actionLogRepository.find({
      where: { userId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy tất cả log hành động theo action
   */
  async findByAction(action: string) {
    return await this.actionLogRepository.find({
      where: { action, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy chi tiết một log hành động
   */
  async findOne(id: string) {
    const actionLog = await this.actionLogRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!actionLog) {
      throw new Error(`Action log with ID ${id} not found`);
    }
    return actionLog;
  }

  /**
   * Xóa mềm một log hành động
   */
  async softDelete(id: string, currentUser: CurrentUserDto) {
    const actionLog = await this.findOne(id);
    actionLog.isDeleted = true;
    actionLog.updatedBy = currentUser.role;
    return await this.actionLogRepository.save(actionLog);
  }

  /**
   * Lấy tổng số hành động theo người dùng
   */
  async countByUserId(userId: string) {
    return await this.actionLogRepository.count({
      where: { userId, isDeleted: false },
    });
  }

  /**
   * Lấy tổng số hành động theo loại
   */
  async countByAction(action: string) {
    return await this.actionLogRepository.count({
      where: { action, isDeleted: false },
    });
  }

  /**
   * Lấy log từ một khoảng thời gian
   */
  async findByDateRange(startDate: Date, endDate: Date) {
    return await this.actionLogRepository
      .createQueryBuilder('log')
      .where('log.createdAt >= :startDate AND log.createdAt <= :endDate', {
        startDate,
        endDate,
      })
      .andWhere('log.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }
}
