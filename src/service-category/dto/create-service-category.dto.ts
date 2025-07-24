import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ 
    description: 'Category image file',
    type: 'string',
    format: 'binary'
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Parent category ID (optional for root categories)' })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}