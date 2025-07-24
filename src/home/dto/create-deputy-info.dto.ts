import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateBiographyDto } from './create-biography.dto';

export class CreateDeputyInfoDto {
  @ApiProperty({
    description: 'Deputy image file',
    type: 'string',
    format: 'binary',
  })
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @ApiProperty({ description: 'Deputy name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Deputy description' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
