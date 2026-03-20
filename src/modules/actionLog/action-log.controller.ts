import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActionLogService } from './action-log.service';
import { CreateActionLogDto } from './dto/create-action-log.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CurrentUser } from '../account/decorators/current-user.decorator';
import { CurrentUserDto } from '../account/dto/current-user.dto';

@ApiTags('Action Logs')
@Controller('action-logs')
@ApiBearerAuth()
export class ActionLogController {
  constructor(private readonly actionLogService: ActionLogService) {}

  /**
   * Ghi lại một hành động mới
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Ghi lại một hành động' })
  async create(
    @Body() createActionLogDto: CreateActionLogDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return await this.actionLogService.create(createActionLogDto, currentUser);
  }

  /**
   * Lấy tất cả log hành động
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy tất cả log hành động' })
  async findAll() {
    return await this.actionLogService.findAll();
  }

  /**
   * Lấy log hành động theo userId
   */
  @Get('by-user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy log hành động theo userId' })
  async findByUserId(@Param('userId') userId: string) {
    return await this.actionLogService.findByUserId(userId);
  }

  /**
   * Lấy log hành động theo loại action
   */
  @Get('by-action/:action')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy log hành động theo loại action' })
  async findByAction(@Param('action') action: string) {
    return await this.actionLogService.findByAction(action);
  }

  /**
   * Lấy log từ một khoảng thời gian
   */
  @Get('by-date-range')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy log từ một khoảng thời gian' })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.actionLogService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Lấy chi tiết một log hành động
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy chi tiết một log hành động' })
  async findOne(@Param('id') id: string) {
    return await this.actionLogService.findOne(id);
  }

  /**
   * Xóa mềm một log hành động
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa mềm một log hành động' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return await this.actionLogService.softDelete(id, currentUser);
  }

  /**
   * Thống kê tổng số hành động theo userId
   */
  @Get('count/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thống kê tổng số hành động theo userId' })
  async countByUserId(@Param('userId') userId: string) {
    return {
      count: await this.actionLogService.countByUserId(userId),
    };
  }

  /**
   * Thống kê tổng số hành động theo loại
   */
  @Get('count/action/:action')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thống kê tổng số hành động theo loại' })
  async countByAction(@Param('action') action: string) {
    return {
      count: await this.actionLogService.countByAction(action),
    };
  }
}
