import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({
    description: 'Certificate title',
    example: 'Bachelor of Law'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Certificate description',
    example: 'Graduated with honors from University of Law'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Certificate image file',
    type: 'string',
    format: 'binary'
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Deputy Info ID this certificate belongs to',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  deputyInfoId?: number;
}