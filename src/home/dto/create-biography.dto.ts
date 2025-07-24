import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBiographyDto {
  @ApiProperty({
    description: 'Biography description',
    example: 'Detailed biography of the deputy...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Biography image URL',
    example: '/uploads/home/biography-image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({
    description: 'Deputy Info ID this biography belongs to',
    example: 1,
  })
  @IsNumber()
  @Transform(({ value }) => Number(value || 1))
  deputyInfoId?: number;
}
