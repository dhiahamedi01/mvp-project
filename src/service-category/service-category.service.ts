import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, IsNull } from 'typeorm';
import { ServiceCategory } from './entities/service-category.entity';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';

@Injectable()
export class ServiceCategoryService {
  constructor(
    @InjectRepository(ServiceCategory)
    private serviceCategoryRepository: Repository<ServiceCategory>,
    private dataSource: DataSource,
  ) {}

  async create(
    createServiceCategoryDto: CreateServiceCategoryDto,
  ): Promise<ServiceCategory> {
    const { parentId, ...categoryData } = createServiceCategoryDto;

    // Validate input
    if (!categoryData.name || categoryData.name.trim().length === 0) {
      throw new BadRequestException(
        'Category name is required and cannot be empty',
      );
    }

    const trimmedName = categoryData.name.trim();

    let parent: ServiceCategory | null = null;
    if (parentId) {
      parent = await this.findOne(parentId);
    }

    // Check for duplicate names at the same level
    await this.checkDuplicateName(trimmedName, parentId);

    const serviceCategory = this.serviceCategoryRepository.create({
      ...categoryData,
      name: trimmedName,
      parent,
    });

    return await this.serviceCategoryRepository.save(serviceCategory);
  }

  async findAll(): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository.find({
      relations: ['services', 'parent', 'children'],
    });
  }

  async findOne(id: number): Promise<ServiceCategory> {
    const serviceCategory = await this.serviceCategoryRepository.findOne({
      where: { id },
      relations: ['services', 'parent', 'children'],
    });

    if (!serviceCategory) {
      throw new NotFoundException('Service category not found');
    }

    return serviceCategory;
  }

  async update(
    id: number,
    updateServiceCategoryDto: UpdateServiceCategoryDto,
  ): Promise<ServiceCategory> {
    const category = await this.findOne(id);
    const { parentId, ...categoryData } = updateServiceCategoryDto;

    // Validate input
    if (
      categoryData.name !== undefined &&
      (!categoryData.name || categoryData.name.trim().length === 0)
    ) {
      throw new BadRequestException('Category name cannot be empty');
    }

    // Prevent circular reference
    if (parentId && parentId === id) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    // Check if the new parent would create a circular reference
    if (parentId) {
      const isDescendant = await this.isDescendant(id, parentId);
      if (isDescendant) {
        throw new BadRequestException(
          'Cannot set parent to a descendant category',
        );
      }
    }

    let parent: ServiceCategory | null = null;
    if (parentId !== undefined) {
      if (parentId === null) {
        parent = null;
      } else {
        parent = await this.findOne(parentId);
      }
    }

    // Check for duplicate names if name is being updated
    if (categoryData.name !== undefined) {
      const trimmedName = categoryData.name.trim();
      const newParentId =
        parentId !== undefined ? parentId : category.parent?.id;
      await this.checkDuplicateName(trimmedName, newParentId, id);
    }

    // Only update parent if parentId was explicitly provided
    const updateData = { ...categoryData };
    if (categoryData.name !== undefined) {
      updateData.name = categoryData.name.trim();
    }
    if (parentId !== undefined) {
      Object.assign(updateData, { parent });
    }

    await this.serviceCategoryRepository.update(id, updateData);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const serviceCategory = await this.findOne(id);

    // Check if category has children
    if (serviceCategory.children && serviceCategory.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with child categories. Please delete or move child categories first.',
      );
    }

    await this.serviceCategoryRepository.remove(serviceCategory);
  }

  async findRootCategories(): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository.find({
      where: { parent: IsNull() },
      relations: ['children', 'services'],
    });
  }

  async findCategoryTree(): Promise<ServiceCategory[]> {
    // More efficient approach: load all categories at once and build tree in memory
    const allCategories = await this.serviceCategoryRepository.find({
      relations: ['parent', 'services'],
    });

    // Create a map for quick lookup
    const categoryMap = new Map<
      number,
      ServiceCategory & { children: ServiceCategory[] }
    >();
    const rootCategories: ServiceCategory[] = [];

    // Initialize all categories with empty children array
    allCategories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build the tree structure
    allCategories.forEach((category) => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      if (category.parent) {
        const parent = categoryMap.get(category.parent.id);
        if (parent) {
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }

  async findCategoryWithChildren(id: number): Promise<ServiceCategory> {
    const category = await this.findOne(id);
    await this.loadCategoryChildren(category);
    return category;
  }

  async moveCategory(
    categoryId: number,
    newParentId?: number | null,
  ): Promise<ServiceCategory> {
    return this.dataSource.transaction(async (manager) => {
      const category = await manager.findOne(ServiceCategory, {
        where: { id: categoryId },
        relations: ['parent', 'children'],
      });

      if (!category) {
        throw new NotFoundException('Service category not found');
      }

      // Prevent circular reference
      if (newParentId && newParentId === categoryId) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      // Check if the new parent would create a circular reference
      if (newParentId !== undefined && newParentId !== null) {
        const isDescendant = await this.isDescendant(categoryId, newParentId);
        if (isDescendant) {
          throw new BadRequestException(
            'Cannot move category to a descendant category',
          );
        }
      }

      let newParent: ServiceCategory | null = null;
      if (newParentId !== undefined && newParentId !== null) {
        newParent = await manager.findOne(ServiceCategory, {
          where: { id: newParentId },
        });
        if (!newParent) {
          throw new NotFoundException('Parent category not found');
        }
      }

      category.parent = newParent;
      return await manager.save(ServiceCategory, category);
    });
  }

  private async loadCategoryChildren(
    category: ServiceCategory,
    maxDepth: number = 10,
    currentDepth: number = 0,
  ): Promise<void> {
    // Prevent infinite recursion
    if (currentDepth >= maxDepth) {
      return;
    }

    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        const fullChild = await this.serviceCategoryRepository.findOne({
          where: { id: child.id },
          relations: ['children', 'services'],
        });
        if (fullChild) {
          Object.assign(child, fullChild);
          await this.loadCategoryChildren(child, maxDepth, currentDepth + 1);
        }
      }
    }
  }

  private async checkDuplicateName(
    name: string,
    parentId?: number | null,
    excludeId?: number,
  ): Promise<void> {
    const whereCondition: any = {
      name: name,
    };

    if (parentId) {
      whereCondition.parent = { id: parentId };
    } else {
      whereCondition.parent = null;
    }

    if (excludeId) {
      whereCondition.id = Not(excludeId);
    }

    const existingCategory = await this.serviceCategoryRepository.findOne({
      where: whereCondition,
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Category with name '${name}' already exists at this level`,
      );
    }
  }

  private async isDescendant(
    ancestorId: number,
    descendantId: number,
    visited: Set<number> = new Set(),
  ): Promise<boolean> {
    // Prevent infinite loops
    if (visited.has(descendantId)) {
      return false;
    }
    visited.add(descendantId);

    const descendant = await this.serviceCategoryRepository.findOne({
      where: { id: descendantId },
      relations: ['parent'],
    });

    if (!descendant || !descendant.parent) {
      return false;
    }

    if (descendant.parent.id === ancestorId) {
      return true;
    }

    return this.isDescendant(ancestorId, descendant.parent.id, visited);
  }

  async getCategoryStatistics(): Promise<{
    totalCategories: number;
    rootCategories: number;
    maxDepth: number;
    categoriesWithChildren: number;
  }> {
    const allCategories = await this.serviceCategoryRepository.find({
      relations: ['parent', 'children'],
    });

    const totalCategories = allCategories.length;
    const rootCategories = allCategories.filter((cat) => !cat.parent).length;
    const categoriesWithChildren = allCategories.filter(
      (cat) => cat.children && cat.children.length > 0,
    ).length;

    // Calculate max depth
    let maxDepth = 0;
    const calculateDepth = (
      categoryId: number,
      currentDepth: number = 0,
    ): number => {
      const category = allCategories.find((cat) => cat.id === categoryId);
      if (!category || !category.children || category.children.length === 0) {
        return currentDepth;
      }

      let maxChildDepth = currentDepth;
      for (const child of category.children) {
        const childDepth = calculateDepth(child.id, currentDepth + 1);
        maxChildDepth = Math.max(maxChildDepth, childDepth);
      }
      return maxChildDepth;
    };

    const rootCats = allCategories.filter((cat) => !cat.parent);
    for (const rootCat of rootCats) {
      const depth = calculateDepth(rootCat.id);
      maxDepth = Math.max(maxDepth, depth);
    }

    return {
      totalCategories,
      rootCategories,
      maxDepth,
      categoriesWithChildren,
    };
  }
}
