import { describe, expect, it, vi } from "vitest";
import { CategoryRepository } from "../../repository/category.repository";
import { CategoryService } from "../category.service";

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

    vi.spyOn(CategoryRepository.prototype, "listByUser").mockResolvedValue([current]);
    const update = vi
      .spyOn(CategoryRepository.prototype, "update")
      .mockResolvedValue(updated);

    const service = new CategoryService();
    const result = await service.updateCategory(1, 1, "Gia đình", "account-group-outline");

    expect(update).toHaveBeenCalledWith(1, 1, "Gia đình", "account-group-outline");
    expect(result.name).toBe("Gia đình");
    expect(result.icon).toBe("account-group-outline");
  });
});
