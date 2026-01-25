import { IsString, IsDateString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentTypeNew {
  ABBONAMENTO_ANNUALE = 'ABBONAMENTO_ANNUALE',
  LEZIONE = 'LEZIONE',
  RIMBORSO = 'RIMBORSO',
  ALTRO = 'ALTRO',
}

export enum TransactionType {
  ENTRATA = 'ENTRATA',
  USCITA = 'USCITA',
}

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: PaymentTypeNew })
  @IsEnum(PaymentTypeNew)
  type: PaymentTypeNew;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsBoolean()
  isPaid: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coachId?: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
