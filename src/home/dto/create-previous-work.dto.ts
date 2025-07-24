import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreatePreviousWorkDto {
  @ApiProperty({
    description: 'Previous work title',
    example: 'Infrastructure Development Project'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Previous work description',
    example: 'Led the development of major infrastructure projects in the region'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Array of attachment file paths',
    example: ['/uploads/home/attachment1.jpg', '/uploads/home/attachment2.pdf']
  })
  @IsArray()
  attachments: string[];

  @ApiProperty({
    description: 'Deputy Info ID this previous work belongs to',
    example: 1
  })
  deputyInfoId?: number;
}