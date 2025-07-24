import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ComplaintStatus, ComplaintType } from '../entities/complaint.entity';

export class CreateComplaintDto {
  @ApiProperty({ description: 'Full name of the complainant' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Phone number' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Type of complaint', enum: ComplaintType })
  @IsEnum(ComplaintType)
  complaintType: ComplaintType;

  @ApiProperty({ description: 'Complaint title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Complaint content' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Complaint attachments (multiple files)',
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

  @ApiPropertyOptional({ description: 'Request instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Request link' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({
    description: 'Complaint status',
    enum: ComplaintStatus,
  })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;
}
