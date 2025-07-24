import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceFieldDto {
  @ApiProperty({ description: 'Field ID' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  id: number;

  @ApiProperty({ description: 'Field label' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({ description: 'Field placeholder' })
  @IsNotEmpty()
  @IsString()
  placeholder: string;

  @ApiProperty({ description: 'Field type' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Whether field is required' })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === 'true';
    return Boolean(value);
  })
  required: boolean;
}

export class CreateServiceDto {
  @ApiProperty({ description: 'Service title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Service description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Service image file',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Request form type' })
  @IsOptional()
  @IsString()
  requestFormType: string;

  @ApiPropertyOptional({ description: 'Whether service can have attachments' })
  @IsOptional()
  @IsString()
  canHaveAttachment?: string;

  @ApiProperty({ description: 'Service category ID' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  serviceCategoryId: number;

  @IsOptional()
  @IsString()
  fields?: string;
}
