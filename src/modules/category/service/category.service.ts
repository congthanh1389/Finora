import type { ICategoryRepository } from "../../../core/database/repository-contracts";

type CategoryType = "income" | "expense";

export class CategoryService {
  constructor(private readonly repository: ICategoryRepository) {}

  async listCategories(userId: number, type?: CategoryType) {
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    const categories = await this.repository.listByUser(userId, type);
    return categories.filter((item) => item.isArchived === 0);
  }

  async listArchivedCategories(userId: number, type?: CategoryType) {
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    const categories = await this.repository.listByUser(userId, type);
    return categories.filter((item) => item.isArchived === 1);
  }

  async createCategory(userId: number, name: string, type: CategoryType, icon?: string) {
    const trimmed = name.trim();
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Invalid user id");
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
      icon: icon ?? "other",
      isArchived: 0,
    });
  }

  async updateCategory(userId: number, categoryId: number, name: string, icon?: string) {
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) throw new Error("Invalid category id");

    const trimmed = name.trim();
    if (!trimmed) throw new Error("Tên danh mục không được để trống.");

    const current = await this.repository.listByUser(userId);
    const category = current.find((item) => item.id === categoryId && item.isArchived === 0);
    if (!category) throw new Error("Không tìm thấy danh mục.");

    if (current.some((item) => item.id !== categoryId && item.isArchived === 0 && item.type === category.type && item.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error("Danh mục này đã tồn tại.");
    }

    return this.repository.update(userId, categoryId, trimmed, icon ?? category.icon ?? "other");
  }

  async archiveCategory(userId: number, categoryId: number) {
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) throw new Error("Invalid category id");
    return this.repository.archive(userId, categoryId);
  }

  async restoreCategory(userId: number, categoryId: number) {
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) throw new Error("Invalid category id");
    return this.repository.restore(userId, categoryId);
  }

  async deleteCategoryPermanently(userId: number, categoryId: number) {
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) throw new Error("Invalid category id");
    return this.repository.delete(userId, categoryId);
  }
}
