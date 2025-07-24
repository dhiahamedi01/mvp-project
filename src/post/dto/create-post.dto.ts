import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Post title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Post description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Post attachments (multiple files)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary'
    }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Send notification to users', default: false })
  @IsOptional()
  @IsBoolean()
  sendNotification?: boolean;

  @ApiProperty({ description: 'Author ID' })
  @IsNotEmpty()
  @IsNumber()
  authorId: number;
}