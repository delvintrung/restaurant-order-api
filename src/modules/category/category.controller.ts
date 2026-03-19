import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CurrentUser } from '../account/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from '../account/decorators/role.decorator';
import { CategoryService } from './category.service';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@ApiTags('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Chỉ cho phép admin tạo category
  @ApiOperation({ summary: 'Create a new category' })
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.categoryService.create(createCategoryDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  findAll() {
    return this.categoryService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Chỉ cho phép admin cập nhật category
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.categoryService.update(
      updateCategoryDto.id,
      updateCategoryDto,
      currentUser,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  findOne(@Body('id') id: string) {
    return this.categoryService.findOne(id);
  }
}
