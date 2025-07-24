import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ServiceCategoryService } from './service-category.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { MoveCategoryDto } from './dto/move-category.dto';
import { ServiceCategory } from './entities/service-category.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import config from '../config';

@ApiTags('Service Categories')
@Controller('service-categories')
export class ServiceCategoryController {
  constructor(
    private readonly serviceCategoryService: ServiceCategoryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create a new service category' })
  @ApiResponse({
    status: 201,
    description: 'Service category created successfully.',
    type: ServiceCategory,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Service category data with image upload',
    type: CreateServiceCategoryDto,
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/service-categories`,
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Body() createServiceCategoryDto: CreateServiceCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ServiceCategory> {
    if (file) {
      createServiceCategoryDto.image = `/uploads/service-categories/${file.filename}`;
    }
    return this.serviceCategoryService.create(createServiceCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service categories' })
  @ApiResponse({
    status: 200,
    description: 'List of all service categories.',
    type: [ServiceCategory],
  })
  findAll(): Promise<ServiceCategory[]> {
    return this.serviceCategoryService.findAll();
  }

  @Get('roots')
  @ApiOperation({ summary: 'Get root categories (categories without parent)' })
  @ApiResponse({
    status: 200,
    description: 'List of root categories.',
    type: [ServiceCategory],
  })
  findRootCategories(): Promise<ServiceCategory[]> {
    return this.serviceCategoryService.findRootCategories();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get complete category tree structure' })
  @ApiResponse({
    status: 200,
    description: 'Category tree retrieved successfully.',
    type: [ServiceCategory],
  })
  findCategoryTree(): Promise<ServiceCategory[]> {
    return this.serviceCategoryService.findCategoryTree();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get category statistics' })
  @ApiResponse({
    status: 200,
    description: 'Category statistics retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        totalCategories: {
          type: 'number',
          description: 'Total number of categories',
        },
        rootCategories: {
          type: 'number',
          description: 'Number of root categories',
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum depth of category tree',
        },
        categoriesWithChildren: {
          type: 'number',
          description: 'Number of categories that have children',
        },
      },
    },
  })
  getCategoryStatistics(): Promise<{
    totalCategories: number;
    rootCategories: number;
    maxDepth: number;
    categoriesWithChildren: number;
  }> {
    return this.serviceCategoryService.getCategoryStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service category by ID' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  @ApiResponse({
    status: 200,
    description: 'Service category found.',
    type: ServiceCategory,
  })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ServiceCategory> {
    return this.serviceCategoryService.findOne(id);
  }

  @Get(':id/with-children')
  @ApiOperation({ summary: 'Get service category with all its children' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  @ApiResponse({
    status: 200,
    description: 'Service category with children found.',
    type: ServiceCategory,
  })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  findCategoryWithChildren(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceCategory> {
    return this.serviceCategoryService.findCategoryWithChildren(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update service category' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  @ApiResponse({
    status: 200,
    description: 'Service category updated successfully.',
    type: ServiceCategory,
  })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Updated service category data with optional image upload',
    type: UpdateServiceCategoryDto,
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/service-categories`,
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceCategoryDto: UpdateServiceCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ServiceCategory> {
    if (file) {
      updateServiceCategoryDto.image = `/uploads/service-categories/${file.filename}`;
    }
    return this.serviceCategoryService.update(id, updateServiceCategoryDto);
  }

  @Patch(':id/move')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Move category to a different parent' })
  @ApiParam({ name: 'id', description: 'Service category ID to move' })
  @ApiQuery({
    name: 'parentId',
    description: 'New parent category ID (optional)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Category moved successfully.',
    type: ServiceCategory,
  })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid move operation (circular reference).',
  })
  moveCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query('parentId') parentId?: string,
  ): Promise<ServiceCategory> {
    const newParentId = parentId ? parseInt(parentId) : undefined;
    return this.serviceCategoryService.moveCategory(id, newParentId);
  }

  @Post(':id/move')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Move category to a different parent (using request body)',
  })
  @ApiParam({ name: 'id', description: 'Service category ID to move' })
  @ApiResponse({
    status: 200,
    description: 'Category moved successfully.',
    type: ServiceCategory,
  })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid move operation (circular reference).',
  })
  moveCategoryWithBody(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveCategoryDto: MoveCategoryDto,
  ): Promise<ServiceCategory> {
    return this.serviceCategoryService.moveCategory(
      id,
      moveCategoryDto.parentId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete service category' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  @ApiResponse({
    status: 200,
    description: 'Service category deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete category with children.',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.serviceCategoryService.remove(id);
  }
}
