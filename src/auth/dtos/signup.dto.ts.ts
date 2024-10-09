import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from 'src/auth/enums/roles.enum';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter a correct email' })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  readonly password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role' }) // Validate that the role is one of the predefined values
  readonly role?: Role; // Optional, default to 'Client'
}
