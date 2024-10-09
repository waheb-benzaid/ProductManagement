import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsMongoId,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  readonly price: number;

  @IsNotEmpty()
  @IsMongoId({ message: 'Invalid category ID' }) // Ensure it's a valid MongoDB ObjectId
  readonly categoryId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'Stock must be a positive number' })
  readonly stock: number;
}
