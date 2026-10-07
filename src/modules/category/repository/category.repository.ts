import type { ICategoryRepository, NewCategory } from "../../../core/database/repository-contracts";
import {
  archiveDeviceCategory,
  restoreDeviceCategory,
  deleteDeviceCategory,
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

  async update(userId: number, categoryId: number, name: string, icon?: string) {
    return updateDeviceCategory(userId, categoryId, name, icon);
  }

  async archive(userId: number, categoryId: number) {
    return archiveDeviceCategory(userId, categoryId);
  }

  async restore(userId: number, categoryId: number) {
    return restoreDeviceCategory(userId, categoryId);
  }

  async delete(userId: number, categoryId: number) {
    return deleteDeviceCategory(userId, categoryId);
  }
}
