import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schema/product.schema';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductService {
  constructor(@InjectModel('Product') private productModel: Model<Product>) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = new this.productModel(createProductDto);
    return newProduct.save();
  }

  async findFiltered(
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    name?: string,
    description?: string,
    minStock?: number,
    maxStock?: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    products: Product[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const filter: any = {};

    // Filter by category
    if (category) {
      filter['categoryId'] = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter['price'] = {};
      if (minPrice) filter['price'].$gte = minPrice;
      if (maxPrice) filter['price'].$lte = maxPrice;
    }

    // Filter by name (case-insensitive search)
    if (name) {
      filter['name'] = { $regex: new RegExp(name, 'i') }; // Case-insensitive regex
    }

    // Filter by description (case-insensitive search)
    if (description) {
      filter['description'] = { $regex: new RegExp(description, 'i') }; // Case-insensitive regex
    }

    // Filter by stock range
    if (minStock || maxStock) {
      filter['stock'] = {};
      if (minStock) filter['stock'].$gte = minStock;
      if (maxStock) filter['stock'].$lte = maxStock;
    }

    // Calculate pagination
    const total = await this.productModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);
    const products = await this.productModel
      .find(filter)
      .populate('categoryId')
      .skip((page - 1) * limit) // Skip the records of previous pages
      .limit(limit) // Limit the results to the specified number
      .exec();

    return { products, total, currentPage: page, totalPages };
  }

  async findAllProducts(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findProductById(productId: string): Promise<Product> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return product;
  }

  async updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      updateProductDto,
      { new: true },
    );
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return updatedProduct;
  }

  async deleteProduct(productId: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(productId);
    if (!result) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
  }
}
