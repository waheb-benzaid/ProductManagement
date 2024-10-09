import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategory = {
    _id: 'category123',
    name: 'Test Category',
    description: 'Test Description',
    isDeleted: false,
  };

  const mockCategoryService = {
    createCategory: jest.fn(),
    findAllCategories: jest.fn(),
    findCategoryById: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCategory', () => {
    const createCategoryDto: CreateCategoryDto = {
      name: 'Test Category',
      description: 'Test Description',
    };

    it('should create a new category', async () => {
      jest.spyOn(service, 'createCategory').mockResolvedValue(mockCategory);

      const result = await controller.createCategory(createCategoryDto);

      expect(result).toEqual(mockCategory);
      expect(service.createCategory).toHaveBeenCalledWith(createCategoryDto);
    });

    it('should handle errors during category creation', async () => {
      jest
        .spyOn(service, 'createCategory')
        .mockRejectedValue(new Error('Creation failed'));

      await expect(
        controller.createCategory(createCategoryDto),
      ).rejects.toThrow('Creation failed');
    });
  });

  describe('getAllCategories', () => {
    it('should return an array of categories', async () => {
      const categories = [mockCategory];
      jest.spyOn(service, 'findAllCategories').mockResolvedValue(categories);

      const result = await controller.getAllCategories();

      expect(result).toEqual(categories);
      expect(service.findAllCategories).toHaveBeenCalled();
    });

    it('should return empty array when no categories exist', async () => {
      jest.spyOn(service, 'findAllCategories').mockResolvedValue([]);

      const result = await controller.getAllCategories();

      expect(result).toEqual([]);
      expect(service.findAllCategories).toHaveBeenCalled();
    });
  });

  describe('getCategoryById', () => {
    it('should return a single category', async () => {
      jest.spyOn(service, 'findCategoryById').mockResolvedValue(mockCategory);

      const result = await controller.getCategoryById('category123');

      expect(result).toEqual(mockCategory);
      expect(service.findCategoryById).toHaveBeenCalledWith('category123');
    });

    it('should throw NotFoundException for non-existent category', async () => {
      jest
        .spyOn(service, 'findCategoryById')
        .mockRejectedValue(new NotFoundException('Category not found'));

      await expect(controller.getCategoryById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCategory', () => {
    const updateCategoryDto: UpdateCategoryDto = {
      name: 'Updated Category',
      description: 'Updated Description',
    };

    it('should update an existing category', async () => {
      const updatedCategory = { ...mockCategory, ...updateCategoryDto };
      jest.spyOn(service, 'updateCategory').mockResolvedValue(updatedCategory);

      const result = await controller.updateCategory(
        'category123',
        updateCategoryDto,
      );

      expect(result).toEqual(updatedCategory);
      expect(service.updateCategory).toHaveBeenCalledWith(
        'category123',
        updateCategoryDto,
      );
    });

    it('should throw NotFoundException for non-existent category', async () => {
      jest
        .spyOn(service, 'updateCategory')
        .mockRejectedValue(new NotFoundException('Category not found'));

      await expect(
        controller.updateCategory('nonexistent', updateCategoryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCategory', () => {
    it('should delete an existing category', async () => {
      jest.spyOn(service, 'deleteCategory').mockResolvedValue(undefined);

      await controller.deleteCategory('category123');

      expect(service.deleteCategory).toHaveBeenCalledWith('category123');
    });

    it('should throw NotFoundException for non-existent category', async () => {
      jest
        .spyOn(service, 'deleteCategory')
        .mockRejectedValue(new NotFoundException('Category not found'));

      await expect(controller.deleteCategory('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Testing Role-based access
  describe('Role-based access', () => {
    it('should have Roles decorator for createCategory', () => {
      const roles = Reflect.getMetadata('roles', controller.createCategory);
      expect(roles).toContain('Admin');
      expect(roles).toContain('Manager');
    });

    it('should have Roles decorator for getAllCategories', () => {
      const roles = Reflect.getMetadata('roles', controller.getAllCategories);
      expect(roles).toContain('Admin');
      expect(roles).toContain('Manager');
      expect(roles).toContain('Client');
    });

    it('should have Roles decorator for getCategoryById', () => {
      const roles = Reflect.getMetadata('roles', controller.getCategoryById);
      expect(roles).toContain('Admin');
      expect(roles).toContain('Manager');
      expect(roles).toContain('Client');
    });

    it('should have Roles decorator for updateCategory', () => {
      const roles = Reflect.getMetadata('roles', controller.updateCategory);
      expect(roles).toContain('Admin');
      expect(roles).toContain('Manager');
    });

    it('should have Roles decorator for deleteCategory', () => {
      const roles = Reflect.getMetadata('roles', controller.deleteCategory);
      expect(roles).toContain('Admin');
    });
  });
});
