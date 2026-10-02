export type CategoryType = "income" | "expense";

export type CategoryView = {
  id: number;
  userId: number | null;
  name: string;
  type: CategoryType;
  parentId: number | null;
  icon: string | null;
  isSystem: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};
