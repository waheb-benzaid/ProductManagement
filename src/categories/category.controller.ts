import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private categoriesService: CategoryService) {}

  @Post()
  @Roles(Role.Admin, Role.Manager)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  @Roles(Role.Admin, Role.Manager, Role.Client)
  async getAllCategories() {
    return this.categoriesService.findAllCategories();
  }

  @Get('/:id')
  @Roles(Role.Admin, Role.Manager, Role.Client)
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.findCategoryById(id);
  }

  @Patch('/:id')
  @Roles(Role.Admin, Role.Manager)
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  async deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }
}
