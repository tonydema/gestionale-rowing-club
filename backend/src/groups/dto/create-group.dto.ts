import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Gruppo Agonisti' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
