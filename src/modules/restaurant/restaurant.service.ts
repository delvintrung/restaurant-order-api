import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from 'src/entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Repository } from 'typeorm';
import { CurrentUser } from '../account/decorators/current-user.decorator';
import { AccountEntity } from 'src/entities/account.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
  ) {}

  async create(
    createRestaurantDto: CreateRestaurantDto,
    @CurrentUser() user: AccountEntity,
  ): Promise<RestaurantEntity> {
    const restaurant = this.restaurantRepository.create({
      name: createRestaurantDto.name,
      address: createRestaurantDto.address,
      phone: createRestaurantDto.phone,
      logoUrl: createRestaurantDto.logo_url,
      createdBy: user.role,
    });
    return await this.restaurantRepository.save(restaurant);
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
    @CurrentUser() user: AccountEntity,
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
      updatedBy: user.id,
    };

    const updatedRestaurant = this.restaurantRepository.merge(
      restaurant,
      payload,
    );
    return await this.restaurantRepository.save(updatedRestaurant);
  }

  async remove(id: string): Promise<{ message: string }> {
    const restaurant = await this.findOne(id);
    await this.restaurantRepository.remove(restaurant);
    return { message: `Đã xóa nhà hàng ${restaurant.name} thành công` };
  }
}
