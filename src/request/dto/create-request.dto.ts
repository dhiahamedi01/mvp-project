import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '../entities/request.entity';

export class RequestFieldDto {
  @ApiProperty({ description: 'Field ID' })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Field content' })
  @IsNotEmpty()
  @IsString()
  content: string;

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
  required: boolean;
}

export class CreateRequestDto {
  @ApiProperty({ description: 'Full name of requester' })
  @IsOptional()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'Request attachments (multiple files)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({
    description: 'Request fields',
    type: [RequestFieldDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestFieldDto)
  fields?: RequestFieldDto[];

  @ApiPropertyOptional({ description: 'Request status', enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ description: 'Request instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Request link' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Service ID' })
  @IsNotEmpty()
  @IsNumber()
  serviceId: number;
}
