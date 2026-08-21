import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: "Name is required" })
  @MinLength(2, { message: "Name must be at least 2 characters" })
  readonly name: string;

  @IsString()
  @IsNotEmpty({ message: "Slug is required" })
  @MinLength(2, { message: "Slug must be at least 2 characters" })
  readonly slug: string;

  @IsOptional()
  @IsString()
  readonly parentCategoryId: string;
}
