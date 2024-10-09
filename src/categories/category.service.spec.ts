import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryModel: Model<Category>;

  const mockCategory = {
    _id: 'category123',
    name: 'Test Category',
    description: 'Test Description',
    isDeleted: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getModelToken('Category'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockCategory),
            constructor: jest.fn().mockResolvedValue(mockCategory),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryModel = module.get<Model<Category>>(getModelToken('Category'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should successfully create a category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        description: 'Test Description',
      };

      jest
        .spyOn(categoryModel.prototype, 'save')
        .mockResolvedValueOnce(mockCategory as any);

      const result = await service.createCategory(createCategoryDto);

      expect(result).toEqual(mockCategory);
      expect(categoryModel.prototype.save).toHaveBeenCalled();
    });

    describe('findAllCategories', () => {
      it('should return all non-deleted categories', async () => {
        const categories = [mockCategory];

        jest.spyOn(categoryModel, 'find').mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(categories),
        } as any);

        const result = await service.findAllCategories();

        expect(result).toEqual(categories);
        expect(categoryModel.find).toHaveBeenCalledWith({ isDeleted: false });
      });

      it('should return empty array when no categories exist', async () => {
        jest.spyOn(categoryModel, 'find').mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce([]),
        } as any);

        const result = await service.findAllCategories();

        expect(result).toEqual([]);
        expect(categoryModel.find).toHaveBeenCalledWith({ isDeleted: false });
      });
    });

    describe('findCategoryById', () => {
      it('should return a category by id', async () => {
        jest.spyOn(categoryModel, 'findById').mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockCategory),
        } as any);

        const result = await service.findCategoryById('category123');

        expect(result).toEqual(mockCategory);
        expect(categoryModel.findById).toHaveBeenCalledWith('category123');
      });

      it('should throw NotFoundException when category not found', async () => {
        jest.spyOn(categoryModel, 'findById').mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(null),
        } as any);

        await expect(service.findCategoryById('nonexistent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateCategory', () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category',
        description: 'Updated Description',
      };

      it('should successfully update a category', async () => {
        const updatedCategory = { ...mockCategory, ...updateCategoryDto };

        jest
          .spyOn(categoryModel, 'findByIdAndUpdate')
          .mockResolvedValueOnce(updatedCategory as any);

        const result = await service.updateCategory(
          'category123',
          updateCategoryDto,
        );

        expect(result).toEqual(updatedCategory);
        expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'category123',
          updateCategoryDto,
          { new: true },
        );
      });

      it('should throw NotFoundException when updating non-existent category', async () => {
        jest
          .spyOn(categoryModel, 'findByIdAndUpdate')
          .mockResolvedValueOnce(null);

        await expect(
          service.updateCategory('nonexistent', updateCategoryDto),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteCategory', () => {
      it('should successfully soft delete a category', async () => {
        const deletedCategory = { ...mockCategory, isDeleted: true };

        jest
          .spyOn(categoryModel, 'findByIdAndUpdate')
          .mockResolvedValueOnce(deletedCategory as any);

        await service.deleteCategory('category123');

        expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'category123',
          { isDeleted: true },
          { new: true },
        );
      });

      it('should throw NotFoundException when deleting non-existent category', async () => {
        jest
          .spyOn(categoryModel, 'findByIdAndUpdate')
          .mockResolvedValueOnce(null);

        await expect(service.deleteCategory('nonexistent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
