import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schema/product.schema';
import { Category } from '../categories/schemas/category.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductServiceService', () => {
  let service: ProductService;
  let productModel: Model<Product>;
  let categoryModel: Model<Category>;

  const mockProduct = {
    _id: 'product123',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    categoryId: 'category123',
    stock: 10,
    isDeleted: false,
  };

  const mockCategory = {
    _id: 'category123',
    name: 'Test Category',
    description: 'Test Category Description',
    isDeleted: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken('Product'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockProduct),
            constructor: jest.fn().mockResolvedValue(mockProduct),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken('Category'),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productModel = module.get<Model<Product>>(getModelToken('Product'));
    categoryModel = module.get<Model<Category>>(getModelToken('Category'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      categoryId: 'category123',
      stock: 10,
    };

    it('should create a product when category exists', async () => {
      jest
        .spyOn(categoryModel, 'findOne')
        .mockResolvedValue(mockCategory as any);
      jest
        .spyOn(productModel.prototype, 'save')
        .mockResolvedValue(mockProduct as any);

      const result = await service.createProduct(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(categoryModel.findOne).toHaveBeenCalledWith({
        _id: createProductDto.categoryId,
        isDeleted: false,
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      jest.spyOn(categoryModel, 'findOne').mockResolvedValue(null);

      await expect(service.createProduct(createProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findProductById', () => {
    it('should return a product by id', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockProduct),
      } as any);

      const result = await service.findProductById('product123');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findProductById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findFiltered', () => {
    const mockPaginatedResponse = {
      products: [mockProduct],
      total: 1,
      currentPage: 1,
      totalPages: 1,
    };

    it('should return filtered products with pagination', async () => {
      jest.spyOn(productModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(1),
      } as any);

      jest.spyOn(productModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([mockProduct]),
      } as any);

      const result = await service.findFiltered(
        'category123',
        50,
        150,
        'Test',
        'Description',
        5,
        15,
        1,
        10,
      );

      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product', async () => {
      jest.spyOn(productModel, 'findById').mockResolvedValueOnce({
        ...mockProduct,
        isDeleted: false,
      } as any);

      jest.spyOn(productModel, 'findByIdAndUpdate').mockResolvedValueOnce({
        ...mockProduct,
        isDeleted: true,
      } as any);

      const result = await service.deleteProduct('product123');
      expect(result.message).toContain('successfully deleted');
    });

    it('should throw BadRequestException when product is already deleted', async () => {
      jest.spyOn(productModel, 'findById').mockResolvedValueOnce({
        ...mockProduct,
        isDeleted: true,
      } as any);

      await expect(service.deleteProduct('product123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when product does not exist', async () => {
      jest.spyOn(productModel, 'findById').mockResolvedValueOnce(null);

      await expect(service.deleteProduct('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProduct', () => {
    const updateProductDto = {
      name: 'Updated Product',
      price: 150,
    };

    it('should update a product', async () => {
      const updatedProduct = { ...mockProduct, ...updateProductDto };
      jest
        .spyOn(productModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(updatedProduct as any);

      const result = await service.updateProduct(
        'product123',
        updateProductDto,
      );
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      jest.spyOn(productModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      await expect(
        service.updateProduct('nonexistent', updateProductDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllProducts', () => {
    it('should return all products', async () => {
      jest.spyOn(productModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([mockProduct]),
      } as any);

      const result = await service.findAllProducts();
      expect(result).toEqual([mockProduct]);
    });
  });
});
