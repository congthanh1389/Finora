import { CategoryRepository } from "../repository/category.repository";
import type { Category } from "../../../../drizzle/schema";

export class CategoryService {
  constructor(private readonly repository = new CategoryRepository()) {}

  async listCategories(userId: number, type?: Category["type"]) {
    const categories = await this.repository.listByUser(userId, type);
    return categories.filter((item) => item.isArchived === 0);
  }

  async createCategory(userId: number, name: string, type: Category["type"]) {
    const trimmed = name.trim();
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!trimmed) throw new Error("Tên danh mục không được để trống.");

    const existing = await this.repository.listByUser(userId, type);
    if (existing.some((item) => item.isArchived === 0 && item.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error("Danh mục này đã tồn tại.");
    }

    return this.repository.create({
      userId,
      name: trimmed,
      type,
      parentId: null,
      icon: type === "income" ? "04_reports_report" : "01_finance_wallet",
      isArchived: 0,
    });
  }
}
