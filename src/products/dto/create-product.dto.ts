import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: "Name is required" })
  @MinLength(2, { message: "Name must be at least 2 characters" })
  readonly name: string;

  @IsString()
  @IsNotEmpty({ message: "Slug is required" })
  @MinLength(2, { message: "Slug must be at least 2 characters" })
  readonly slug: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsBoolean()
  readonly isActive: boolean;

  @IsString()
  @IsNotEmpty({ message: "Products must be related with a category" })
  readonly categoryId: string;
}
