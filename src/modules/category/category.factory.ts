import { CategoryRepository } from "./repository/category.repository";
import { CategoryService } from "./service/category.service";

export function createCategoryDependencies() {
  const categoryRepository = new CategoryRepository();
  const categoryService = new CategoryService(categoryRepository);

  return { categoryRepository, categoryService };
}
