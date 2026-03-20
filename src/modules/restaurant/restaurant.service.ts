import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from 'src/entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Repository } from 'typeorm';
import { CurrentUser } from '../account/decorators/current-user.decorator';
import { CurrentUserDto } from '../account/dto/current-user.dto';
import { ActionLogService } from '../actionLog/action-log.service';
import { CreateActionLogDto } from '../actionLog/dto/create-action-log.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,

    private readonly actionLogService: ActionLogService,
  ) {}

  async create(
    createRestaurantDto: CreateRestaurantDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RestaurantEntity> {
    const restaurant = this.restaurantRepository.create({
      name: createRestaurantDto.name,
      address: createRestaurantDto.address,
      phone: createRestaurantDto.phone,
      logoUrl: createRestaurantDto.logo_url,
      createdBy: user.role,
    });
    const savedRestaurant = await this.restaurantRepository.save(restaurant);

    const actionLogDto: CreateActionLogDto = {
      userId: user.userId,
      restaurantId: savedRestaurant.id,
      action: 'CREATE_RESTAURANT',
      description: `Tạo nhà hàng mới: ${savedRestaurant.name}`,
    };

    await this.actionLogService.create(actionLogDto, user);

    return savedRestaurant;
  }

  async findAll(): Promise<RestaurantEntity[]> {
    return await this.restaurantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<RestaurantEntity> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
    });
    if (!restaurant) {
      throw new NotFoundException(`Nhà hàng với ID ${id} không tồn tại`);
    }
    return restaurant;
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RestaurantEntity> {
    const restaurant = await this.findOne(id); // Kiểm tra tồn tại trước

    const payload: Partial<RestaurantEntity> = {
      ...(updateRestaurantDto.name !== undefined
        ? { name: updateRestaurantDto.name }
        : {}),
      ...(updateRestaurantDto.address !== undefined
        ? { address: updateRestaurantDto.address }
        : {}),
      ...(updateRestaurantDto.phone !== undefined
        ? { phone: updateRestaurantDto.phone }
        : {}),
      ...(updateRestaurantDto.logo_url !== undefined
        ? { logoUrl: updateRestaurantDto.logo_url }
        : {}),
      updatedBy: user.role,
    };

    const updatedRestaurant = this.restaurantRepository.merge(
      restaurant,
      payload,
    );
    const savedRestaurant =
      await this.restaurantRepository.save(updatedRestaurant);

    const actionLogDto: CreateActionLogDto = {
      userId: user.userId,
      restaurantId: savedRestaurant.id,
      action: 'UPDATE_RESTAURANT',
      description: `Cập nhật nhà hàng: ${savedRestaurant.name}`,
    };

    await this.actionLogService.create(actionLogDto, user);

    return savedRestaurant;
  }

  async activate(
    id: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RestaurantEntity> {
    const restaurant = await this.findOne(id);
    restaurant.isActive = true;

    const actionLogDto: CreateActionLogDto = {
      userId: user.userId,
      restaurantId: user.restaurantId,
      action: 'ACTIVATE_RESTAURANT',
      description: `Kích hoạt nhà hàng: ${restaurant.name}`,
    };

    await this.actionLogService.create(actionLogDto, user);

    return await this.restaurantRepository.save(restaurant);
  }

  async deactivate(
    id: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RestaurantEntity> {
    const restaurant = await this.findOne(id);
    restaurant.isActive = false;

    const actionLogDto: CreateActionLogDto = {
      userId: user.userId,
      restaurantId: user.restaurantId,
      action: 'DEACTIVATE_RESTAURANT',
      description: `Vô hiệu hóa nhà hàng: ${restaurant.name}`,
    };

    await this.actionLogService.create(actionLogDto, user);

    return await this.restaurantRepository.save(restaurant);
  }

  async remove(id: string, user: CurrentUserDto): Promise<{ message: string }> {
    const restaurant = await this.findOne(id);
    await this.restaurantRepository.remove(restaurant);

    const actionLogDto: CreateActionLogDto = {
      userId: user.userId,
      restaurantId: user.restaurantId,
      action: 'DELETE_RESTAURANT',
      description: `Xóa nhà hàng: ${restaurant.name}`,
    };

    await this.actionLogService.create(actionLogDto, user);

    return { message: `Đã xóa nhà hàng ${restaurant.name} thành công` };
  }
}
