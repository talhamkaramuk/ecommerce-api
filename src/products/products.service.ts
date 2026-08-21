import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { slug: createProductDto.slug },
    });

    if (existingProduct) {
      throw new ConflictException("This product already exists");
    }

    const product = await this.prisma.product.create({
      data: { ...createProductDto },
    });

    return product;
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return product;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.product.delete({
      where: { id },
    });

    return { success: true, message: "Product deleted successfully" };
  }
}
