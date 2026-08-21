import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new ConflictException("This category already exists");
    }

    const category = await this.prisma.category.create({
      data: { ...createCategoryDto },
    });

    return category;
  }

  async findAll() {
    return await this.prisma.category.findMany();
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parentCategory: true,
        subCategories: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return category;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.category.delete({
      where: { id },
    });

    return { success: true, message: "Category deleted successfully" };
  }
}
