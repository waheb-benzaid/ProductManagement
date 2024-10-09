import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductSchema } from './schema/product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { CategorySchema } from 'src/categories/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
    AuthModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductsModule {}
