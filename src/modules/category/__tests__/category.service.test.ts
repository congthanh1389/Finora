import { describe, expect, it } from "vitest";
import type { Category } from "../../../../drizzle/schema";
import type { IFinoraRepository } from "../../../core/database/finora-repository";
import { CategoryService } from "../service/category.service";

function category(
  id: number,
  type: Category["type"],
  overrides: Partial<Category> = {},
): Category {
  return {
    id,
    userId: 1,
    name: `Category ${id}`,
    type,
    parentId: null,
    icon: null,
    isSystem: 0,
    isArchived: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function repositoryMock(categories: Category[]): IFinoraRepository {
  return {
    listAccounts: async () => [],
    getAccount: async () => undefined,
    createAccount: async () => {
      throw new Error("not implemented");
    },
    updateAccount: async () => undefined,
    archiveAccount: async () => {},
    listCategories: async (userId) =>
      categories.filter((item) => item.userId === userId || item.isSystem === 1),
    getCategory: async (userId, categoryId) =>
      categories.find(
        (item) =>
          item.id === categoryId &&
          (item.userId === userId || item.isSystem === 1),
      ),
    createCategory: async (input) => {
      const created = category(categories.length + 1, input.type, input as Partial<Category>);
      categories.push(created);
      return created;
    },
    updateCategory: async (userId, categoryId, input) => {
      const item = categories.find(
        (candidate) =>
          candidate.id === categoryId &&
          candidate.userId === userId &&
          candidate.isSystem === 0,
      );
      if (!item) return undefined;
      Object.assign(item, input);
      return item;
    },
    listTransactions: async () => [],
    getTransaction: async () => undefined,
    createTransaction: async () => {
      throw new Error("not implemented");
    },
    updateTransaction: async () => undefined,
    deleteTransaction: async () => {},
  };
}

describe("CategoryService", () => {
  it("lists only active categories and can filter by type", async () => {
    const categories = [
      category(1, "expense"),
      category(2, "income"),
      category(3, "expense", { isArchived: 1 }),
      category(4, "expense", { userId: null, isSystem: 1 }),
    ];
    const service = new CategoryService(repositoryMock(categories));

    await expect(service.listCategories(1, "expense")).resolves.toHaveLength(2);
  });

  it("creates a custom category with a normalized name", async () => {
    const categories: Category[] = [];
    const service = new CategoryService(repositoryMock(categories));

    await expect(
      service.createCategory({
        userId: 1,
        name: "  Ăn uống  ",
        type: "expense",
      }),
    ).resolves.toMatchObject({
      name: "Ăn uống",
      type: "expense",
      isSystem: 0,
      isArchived: 0,
    });
  });

  it("rejects a parent category with a different type", async () => {
    const categories = [category(1, "income")];
    const service = new CategoryService(repositoryMock(categories));

    await expect(
      service.createCategory({
        userId: 1,
        name: "Ăn uống",
        type: "expense",
        parentId: 1,
      }),
    ).rejects.toThrow("Parent category type must match category type");
  });

  it("does not allow modifying or archiving system categories", async () => {
    const categories = [
      category(1, "expense", { userId: null, isSystem: 1 }),
    ];
    const service = new CategoryService(repositoryMock(categories));

    await expect(
      service.updateCategory(1, 1, { name: "New name" }),
    ).rejects.toThrow("System category cannot be modified");

    await expect(service.archiveCategory(1, 1)).rejects.toThrow(
      "System category cannot be archived",
    );
  });

  it("archives custom categories without deleting their history", async () => {
    const categories = [category(1, "expense")];
    const service = new CategoryService(repositoryMock(categories));

    await service.archiveCategory(1, 1);

    expect(categories[0].isArchived).toBe(1);
    await expect(service.getCategory(1, 1)).resolves.toBeUndefined();
  });

  it("requires category type to match income/expense transactions", () => {
    const service = new CategoryService(repositoryMock([]));
    const expenseCategory = category(1, "expense");

    expect(() =>
      service.validateForTransaction(expenseCategory, "expense"),
    ).not.toThrow();

    expect(() =>
      service.validateForTransaction(expenseCategory, "income"),
    ).toThrow("Category type does not match transaction type");

    expect(() =>
      service.validateForTransaction(expenseCategory, "transfer"),
    ).toThrow("Transfer does not use a category");
  });
});
