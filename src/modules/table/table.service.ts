import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from 'src/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { CurrentUser } from '../account/decorators/current-user.decorator';
import { CreateTableDto } from './dto/create-table.dto';
import { RestaurantTableEntity } from 'src/entities/table.entity';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableStatus } from 'src/common/enums/table-status.enum';
import { CurrentUserDto } from '../account/dto/current-user.dto';
import { ActionLogService } from '../actionLog/action-log.service';
import { CreateActionLogDto } from '../actionLog/dto/create-action-log.dto';

@Injectable()
export class RestaurantTableService {
  constructor(
    @InjectRepository(RestaurantTableEntity)
    private readonly tableRepository: Repository<RestaurantTableEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
    private readonly actionLogService: ActionLogService,
  ) {}

  async create(
    createTableDto: CreateTableDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RestaurantTableEntity> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: createTableDto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Nhà hàng với ID ${createTableDto.restaurantId} không tồn tại`,
      );
    }

    const existingTable = await this.tableRepository.findOne({
      where: {
        restaurantId: createTableDto.restaurantId,
        tableNumber: createTableDto.tableNumber,
      },
    });

    if (existingTable) {
      throw new NotFoundException(
        `Bàn số ${createTableDto.tableNumber} đã tồn tại trong nhà hàng ${createTableDto.restaurantId}`,
      );
    }

    const table = new RestaurantTableEntity();
    table.restaurantId = createTableDto.restaurantId;
    table.tableNumber = createTableDto.tableNumber;
    table.qrCodeToken = crypto.randomUUID();
    table.createdBy = user.role;
    const savedTable = await this.tableRepository.save(table);

    const actionLogDto: CreateActionLogDto = {
      userId: user.userId,
      restaurantId: savedTable.restaurantId,
      action: 'CREATE_TABLE',
      description: `Tạo bàn số ${savedTable.tableNumber}`,
    };

    await this.actionLogService.create(actionLogDto, user);

    return savedTable;
  }

  async findAllTableByRestaurant(
    restaurantId: string,
  ): Promise<RestaurantTableEntity[]> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Nhà hàng với ID ${restaurantId} không tồn tại`,
      );
    }

    return await this.tableRepository.find({
      where: { restaurantId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<RestaurantTableEntity> {
    const table = await this.tableRepository.findOne({
      where: { id },
    });
    if (!table) {
      throw new NotFoundException(`Bàn với ID ${id} không tồn tại`);
    }
    return table;
  }

  async findOneByQrCodeToken(
    qrCodeToken: string,
  ): Promise<RestaurantTableEntity> {
    const table = await this.tableRepository.findOne({
      where: { qrCodeToken },
    });
    if (!table) {
      throw new NotFoundException(`Bàn với mã QR ${qrCodeToken} không tồn tại`);
    }
    return table;
  }

  async changeStatus(
    id: string,
    status: TableStatus,
  ): Promise<RestaurantTableEntity> {
    const table = await this.findOne(id);
    table.status = status as any;
    return await this.tableRepository.save(table);
  }

  async update(
    id: string,
    updateTableDto: UpdateTableDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RestaurantTableEntity> {
    const table = await this.findOne(id);

    const payload: Partial<RestaurantTableEntity> = {
      ...(updateTableDto.tableNumber !== undefined
        ? { tableNumber: updateTableDto.tableNumber }
        : {}),
      updatedBy: user.role,
    };

    const updatedTable = this.tableRepository.merge(table, payload);
    const savedTable = await this.tableRepository.save(updatedTable);

    const actionLogDto: CreateActionLogDto = {
      userId: user.userId,
      restaurantId: savedTable.restaurantId,
      action: 'UPDATE_TABLE',
      description: `Cập nhật bàn số ${savedTable.tableNumber}`,
    };

    await this.actionLogService.create(actionLogDto, user);

    return savedTable;
  }

  async remove(id: string): Promise<{ message: string }> {
    const table = await this.findOne(id);
    await this.tableRepository.remove(table);
    return { message: `Đã xóa bàn ${table.tableNumber} thành công` };
  }
}
