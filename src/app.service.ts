import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return "Hello World!";
  }

  getUsers() {
    return this.prisma.user.findMany();
  }

  getCategories() {
    return this.prisma.category.findMany();
  }

  getProducts() {
    return this.prisma.product.findMany();
  }
}
