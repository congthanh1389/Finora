import { describe, expect, it, vi } from "vitest";
import type { ICategoryRepository } from "../../../../core/database/repository-contracts";
import { CategoryService } from "../category.service";

const repository = {
  listByUser: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  archive: vi.fn(),
  restore: vi.fn(),
  delete: vi.fn(),
} satisfies Record<keyof ICategoryRepository, ReturnType<typeof vi.fn>>;

function makeCategory(overrides = {}) {
  const now = new Date();
  return {
    id: 1,
    userId: 1,
    name: "Nhà Cửa",
    type: "expense" as const,
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
    const current = makeCategory();
    const updated = makeCategory({
      name: "Gia đình",
      icon: "account-group-outline",
    });

    repository.listByUser.mockResolvedValue([current]);
    repository.update.mockResolvedValue(updated);

    const service = new CategoryService(repository as unknown as ICategoryRepository);
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


describe("CategoryService.deleteCategoryPermanently", () => {
  it("validates identifiers and delegates permanent deletion", async () => {
    repository.delete.mockResolvedValue(undefined);

    const service = new CategoryService(repository as unknown as ICategoryRepository);
    await service.deleteCategoryPermanently(1, 7);

    expect(repository.delete).toHaveBeenCalledWith(1, 7);
  });

  it("rejects invalid identifiers", async () => {
    const service = new CategoryService(repository as unknown as ICategoryRepository);

    await expect(service.deleteCategoryPermanently(0, 7)).rejects.toThrow("Invalid user id");
    await expect(service.deleteCategoryPermanently(1, 0)).rejects.toThrow("Invalid category id");
  });
});
