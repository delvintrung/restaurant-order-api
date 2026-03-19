import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemEntity } from 'src/entities/menu-item.entity';
import { CategoryEntity } from 'src/entities/category.entity';
import { RestaurantEntity } from 'src/entities/restaurant.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { CurrentUserDto } from '../account/dto/current-user.dto';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepository: Repository<MenuItemEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
  ) {}

  async create(
    createMenuItemDto: CreateMenuItemDto,
    currentUser: CurrentUserDto,
  ): Promise<MenuItemEntity> {
    await this.ensureCategoryExists(createMenuItemDto.categoryId);

    if (createMenuItemDto.restaurantId) {
      await this.ensureRestaurantExists(createMenuItemDto.restaurantId);
    }

    const menuItem = this.menuItemRepository.create({
      categoryId: createMenuItemDto.categoryId,
      restaurantId: createMenuItemDto.restaurantId ?? null,
      name: createMenuItemDto.name,
      description: createMenuItemDto.description,
      price: createMenuItemDto.price,
      imageUrl: createMenuItemDto.imageUrl,
      isAvailable: createMenuItemDto.isAvailable ?? true,
      createdBy: currentUser.role,
    });

    return this.menuItemRepository.save(menuItem);
  }

  async findAll(): Promise<MenuItemEntity[]> {
    return this.menuItemRepository.find({
      relations: {
        category: true,
        restaurant: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MenuItemEntity> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: {
        category: true,
        restaurant: true,
      },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return menuItem;
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
    currentUser: CurrentUserDto,
  ): Promise<MenuItemEntity> {
    const menuItem = await this.findOne(id);

    if (updateMenuItemDto.categoryId) {
      await this.ensureCategoryExists(updateMenuItemDto.categoryId);
      menuItem.categoryId = updateMenuItemDto.categoryId;
    }

    if (updateMenuItemDto.restaurantId) {
      await this.ensureRestaurantExists(updateMenuItemDto.restaurantId);
      menuItem.restaurantId = updateMenuItemDto.restaurantId;
    }

    if (updateMenuItemDto.name !== undefined) {
      menuItem.name = updateMenuItemDto.name;
    }

    if (updateMenuItemDto.description !== undefined) {
      menuItem.description = updateMenuItemDto.description;
    }

    if (updateMenuItemDto.price !== undefined) {
      menuItem.price = updateMenuItemDto.price;
    }

    if (updateMenuItemDto.imageUrl !== undefined) {
      menuItem.imageUrl = updateMenuItemDto.imageUrl;
    }

    if (updateMenuItemDto.isAvailable !== undefined) {
      menuItem.isAvailable = updateMenuItemDto.isAvailable;
    }

    menuItem.updatedBy = currentUser.userId;

    await this.menuItemRepository.save(menuItem);
    return this.findOne(menuItem.id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const menuItem = await this.findOne(id);
    await this.menuItemRepository.remove(menuItem);

    return { message: `Menu item ${id} deleted successfully` };
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
  }

  private async ensureRestaurantExists(restaurantId: string): Promise<void> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found`,
      );
    }
  }
}
