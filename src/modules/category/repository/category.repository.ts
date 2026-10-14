import type { ICategoryRepository, NewCategory } from "../../../core/database/repository-contracts";
import {
  archiveDeviceCategory,
  createDeviceCategory,
  listDeviceCategories,
  updateDeviceCategory,
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

  async update(userId: number, categoryId: number, name: string) {
    return updateDeviceCategory(userId, categoryId, name);
  }

  async archive(userId: number, categoryId: number) {
    return archiveDeviceCategory(userId, categoryId);
  }
}
