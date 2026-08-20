import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail({}, { message: "Please provide a valid email" })
  @IsNotEmpty({ message: "Email is required" })
  readonly email: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  readonly password: string;

  @IsString()
  @IsNotEmpty({ message: "First name is required" })
  @MinLength(2)
  readonly firstName: string;

  @IsString()
  @IsNotEmpty({ message: "Last name is required" })
  @MinLength(2)
  readonly lastName: string;
}
