import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsArray,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateMemberDto {
  @ApiProperty({ example: 'mrossi' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'user@canottaggio.it', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Mario' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Rossi' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'RSSMRA90A01H501U' })
  @IsString()
  @IsNotEmpty()
  fiscalCode: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: 'Roma' })
  @IsString()
  @IsNotEmpty()
  placeOfBirth: string;

  @ApiProperty({ example: 'Via Roma 1' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Roma' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '00100' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ example: '3331234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'uuid-del-gruppo', required: false })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsDateString()
  @IsOptional()
  medicalCertExpiry?: string;

  @ApiProperty({
    enum: Role,
    isArray: true,
    example: [Role.ATLETA],
    description: 'User roles - defaults to [ATLETA]',
    required: false,
  })
  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  roles?: Role[];
}
