import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestDto, RequestFieldDto } from './create-request.dto';

export class UpdateRequestDto extends PartialType(CreateRequestDto) {}
export { RequestFieldDto };