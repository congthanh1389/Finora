import { DeviceBudgetRepository } from "./repository/device-budget.repository";
import { BudgetService } from "./service/budget.service";

export function createBudgetDependencies() {
  const budgetRepository = new DeviceBudgetRepository();
  const budgetService = new BudgetService(budgetRepository);

  return { budgetRepository, budgetService };
}
