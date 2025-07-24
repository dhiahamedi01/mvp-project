import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({ description: 'Image description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ 
    description: 'Image file',
    type: 'string',
    format: 'binary'
  })
  @IsOptional()
  @IsString()
  image?: string;
}