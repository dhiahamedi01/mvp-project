import { IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MoveCategoryDto {
  @ApiPropertyOptional({
    description: 'New parent category ID (null for root category)',
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
