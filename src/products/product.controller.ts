import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Product } from './schema/product.schema';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private productsService: ProductService) {}

  @Post()
  @Roles(Role.Admin, Role.Manager)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  async getAllProducts(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('name') name?: string,
    @Query('description') description?: string,
    @Query('minStock') minStock?: number,
    @Query('maxStock') maxStock?: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{
    products: Product[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    return this.productsService.findFiltered(
      category,
      minPrice,
      maxPrice,
      name,
      description,
      minStock,
      maxStock,
      page,
      limit,
    );
  }

  @Get('/:id')
  @Roles(Role.Admin, Role.Manager, Role.Client)
  async getProductById(@Param('id') id: string) {
    return this.productsService.findProductById(id);
  }

  @Patch('/:id')
  @Roles(Role.Admin, Role.Manager)
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
