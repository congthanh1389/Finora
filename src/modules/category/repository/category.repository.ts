import type { ICategoryRepository, NewCategory } from "../../../core/database/repository-contracts";
import {
  createDeviceCategory,
  listDeviceCategories,
  ensureDefaultDeviceCategories,
} from "../../../core/storage/device-store";

export class CategoryRepository implements ICategoryRepository {
  async create(input: NewCategory) {
    return createDeviceCategory({
      ...input,
      parentId: input.parentId ?? null,
      icon: input.icon ?? null,
      isArchived: input.isArchived ?? 0,
    });
  }

  async listByUser(userId: number, type?: NewCategory["type"]) {
    return listDeviceCategories(userId, type);
  }

  async ensureDefaults(userId: number) {
    return ensureDefaultDeviceCategories(userId);
  }
}
