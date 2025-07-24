import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto, ServiceFieldDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

export { ServiceFieldDto };
