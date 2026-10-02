import type { Category, InsertCategory, Transaction } from "../../../../drizzle/schema";
import type { IFinoraRepository } from "../../../core/database/finora-repository";

export type CategoryType = Category["type"];

export type CreateCategoryInput = {
  userId: number;
  name: string;
  type: CategoryType;
  parentId?: number | null;
  icon?: string | null;
};

export type UpdateCategoryInput = Partial<Pick<CreateCategoryInput, "name" | "parentId" | "icon">>;

export class CategoryService {
  constructor(private readonly repository: IFinoraRepository) {}

  async listCategories(userId: number, type?: CategoryType): Promise<Category[]> {
    const categories = await this.repository.listCategories(userId);
    return categories.filter(
      (category) =>
        category.isArchived === 0 && (type === undefined || category.type === type),
    );
  }

  async getCategory(userId: number, categoryId: number): Promise<Category | undefined> {
    const category = await this.repository.getCategory(userId, categoryId);
    return category?.isArchived === 0 ? category : undefined;
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const name = input.name.trim();
    if (!name) throw new Error("Category name is required");

    if (input.parentId != null) {
      const parent = await this.repository.getCategory(input.userId, input.parentId);
      if (!parent || parent.isArchived !== 0) throw new Error("Parent category not found");
      if (parent.type !== input.type) {
        throw new Error("Parent category type must match category type");
      }
    }

    const insert: InsertCategory = {
      userId: input.userId,
      name,
      type: input.type,
      parentId: input.parentId ?? null,
      icon: input.icon ?? null,
      isSystem: 0,
      isArchived: 0,
    };

    return this.repository.createCategory(insert);
  }

  async updateCategory(
    userId: number,
    categoryId: number,
    input: UpdateCategoryInput,
  ): Promise<Category | undefined> {
    const category = await this.repository.getCategory(userId, categoryId);
    if (!category) return undefined;
    if (category.isSystem === 1) throw new Error("System category cannot be modified");
    if (category.isArchived !== 0) throw new Error("Category is archived");

    const patch: Partial<InsertCategory> = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new Error("Category name is required");
      patch.name = name;
    }

    if (input.parentId !== undefined) {
      if (input.parentId === categoryId) throw new Error("Category cannot be its own parent");
      if (input.parentId != null) {
        const parent = await this.repository.getCategory(userId, input.parentId);
        if (!parent || parent.isArchived !== 0) throw new Error("Parent category not found");
        if (parent.type !== category.type) {
          throw new Error("Parent category type must match category type");
        }
      }
      patch.parentId = input.parentId;
    }

    if (input.icon !== undefined) patch.icon = input.icon;

    return Object.keys(patch).length === 0
      ? category
      : this.repository.updateCategory(userId, categoryId, patch);
  }

  async archiveCategory(userId: number, categoryId: number): Promise<void> {
    const category = await this.repository.getCategory(userId, categoryId);
    if (!category) throw new Error("Category not found");
    if (category.isSystem === 1) throw new Error("System category cannot be archived");
    if (category.isArchived !== 0) return;
    await this.repository.updateCategory(userId, categoryId, { isArchived: 1 });
  }

  validateForTransaction(category: Category, transactionType: Transaction["type"]): void {
    if (category.isArchived !== 0) throw new Error("Category is archived");
    if (transactionType === "transfer") {
      throw new Error("Transfer does not use a category");
    }
    if (category.type !== transactionType) {
      throw new Error("Category type does not match transaction type");
    }
  }
}
