import { Injectable } from '@nestjs/common';
import { CurrentUser } from '../account/decorators/current-user.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryEntity } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CurrentUserDto } from '../account/dto/current-user.dto';
import { ActionLogService } from '../actionLog/action-log.service';
import { CreateActionLogDto } from '../actionLog/dto/create-action-log.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly actionLogService: ActionLogService,
  ) {}

  //   create
  async create(
    createCategoryDto: CreateCategoryDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    console.log('Creating category:', currentUser);
    const category = new CategoryEntity();
    category.name = createCategoryDto.name;
    category.priority = createCategoryDto.priority;
    category.restaurantId = createCategoryDto.restaurantId;
    category.createdBy = currentUser.role;
    const savedCategory = await this.categoryRepository.save(category);

    const actionLogDto: CreateActionLogDto = {
      userId: currentUser.userId,
      restaurantId: createCategoryDto.restaurantId,
      action: 'CREATE_CATEGORY',
      description: `Tạo danh mục: ${savedCategory.name}`,
    };

    await this.actionLogService.create(actionLogDto, currentUser);

    return savedCategory;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    category.name = updateCategoryDto.name ?? category.name;
    category.priority = updateCategoryDto.priority ?? category.priority;
    category.updatedBy = currentUser.role;
    const updatedCategory = await this.categoryRepository.save(category);

    const actionLogDto: CreateActionLogDto = {
      userId: currentUser.userId,
      restaurantId: updatedCategory.restaurantId,
      action: 'UPDATE_CATEGORY',
      description: `Cập nhật danh mục: ${updatedCategory.name}`,
    };

    await this.actionLogService.create(actionLogDto, currentUser);

    return updatedCategory;
  }

  async findAll() {
    return await this.categoryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  }
}
