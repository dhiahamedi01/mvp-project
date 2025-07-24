import { PartialType } from '@nestjs/swagger';
import { CreatePreviousWorkDto } from './create-previous-work.dto';

export class UpdatePreviousWorkDto extends PartialType(CreatePreviousWorkDto) {}