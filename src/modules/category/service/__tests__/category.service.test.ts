import { describe, expect, it, vi } from "vitest";
import type { Category } from "../../../../../../drizzle/schema";
import type { ICategoryRepository } from "../../../../core/database/repository-contracts";
import { CategoryService } from "../category.service";

function makeCategory(overrides: Partial<Category> = {}): Category {
  const now = new Date();
  return {
    id: 1,
    userId: 1,
    name: "Nhà Cửa",
    type: "expense",
    parentId: null,
    icon: "home-outline",
    isArchived: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("CategoryService.updateCategory", () => {
  it("updates both category name and icon", async () => {
    const repository: ICategoryRepository = {
      create: vi.fn(),
      listByUser: vi.fn(async () => [makeCategory()]),
      update: vi.fn(async (_userId, _categoryId, name, icon) =>
        makeCategory({ name, icon }),
      ),
      archive: vi.fn(),
    };
    const service = new CategoryService(repository);

    const result = await service.updateCategory(
      1,
      1,
      "Gia đình",
      "account-group-outline",
    );

    expect(repository.update).toHaveBeenCalledWith(
      1,
      1,
      "Gia đình",
      "account-group-outline",
    );
    expect(result.name).toBe("Gia đình");
    expect(result.icon).toBe("account-group-outline");
  });
});
