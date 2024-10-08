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
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

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
  @Roles(Role.Admin, Role.Manager, Role.Client)
  async getAllProducts() {
    return this.productsService.findAllProducts();
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
