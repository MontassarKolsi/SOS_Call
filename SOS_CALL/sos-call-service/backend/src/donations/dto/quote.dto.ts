import { IsInt, Min } from 'class-validator';
export class QuoteDto {
  @IsInt()
  @Min(1)
  orderAmount: number;
}
