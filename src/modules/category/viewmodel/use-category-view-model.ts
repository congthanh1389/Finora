import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import { createCategoryDependencies } from "../category.factory";
import type { Category } from "@/drizzle/schema";

export function useCategoryViewModel() {
  const { categoryService } = useMemo(() => createCategoryDependencies(), []);
  const [type, setType] = useState<Category["type"]>("expense");
  const [categories, setCategories] = useState<Category[]>([]);
  const [archivedCategories, setArchivedCategories] = useState<Category[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("food-noodles");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingIcon, setEditingIcon] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const user = await Auth.getUserInfo();
      if (!user) {
        setCategories([]);
        return;
      }
      const [active, archived] = await Promise.all([
        categoryService.listCategories(user.id, type),
        categoryService.listArchivedCategories(user.id, type),
      ]);
      setCategories(active);
      setArchivedCategories(archived);
    } catch (err) {
      setCategories([]);
      setArchivedCategories([]);
      setError(err instanceof Error ? err.message : "Không thể tải danh mục.");
    }
  }, [categoryService, type]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  function resetForm(nextType: Category["type"]) {
    setType(nextType);
    setShowArchived(false);
    setName("");
    setSelectedIcon(nextType === "expense" ? "food" : "briefcase-outline");
    setEditingId(null);
    setEditingName("");
    setEditingIcon("");
    setError("");
  }

  async function addCategory() {
    try {
      const user = await Auth.getUserInfo();
      if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
      const created = await categoryService.createCategory(user.id, name, type, selectedIcon);
      setCategories((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name, "vi")),
      );
      setName("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể thêm danh mục.");
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingIcon(category.icon || "other");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
    setEditingIcon("");
    setError("");
  }

  async function saveEdit(categoryId: number) {
    try {
      const user = await Auth.getUserInfo();
      if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
      const updated = await categoryService.updateCategory(
        user.id,
        categoryId,
        editingName,
        editingIcon,
      );
      setCategories((current) =>
        current
          .map((item) => (item.id === categoryId ? updated : item))
          .sort((a, b) => a.name.localeCompare(b.name, "vi")),
      );
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể sửa danh mục.");
    }
  }

  async function deleteCategory(categoryId: number) {
    try {
      const user = await Auth.getUserInfo();
      if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
      await categoryService.archiveCategory(user.id, categoryId);
      const archived = categories.find((item) => item.id === categoryId);
      setCategories((current) => current.filter((item) => item.id !== categoryId));
      if (archived) setArchivedCategories((current) => [...current, { ...archived, isArchived: 1 }]);
      if (editingId === categoryId) cancelEdit();
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa danh mục.");
    }
  }

  async function restoreCategory(categoryId: number) {
    try {
      const user = await Auth.getUserInfo();
      if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
      const restored = await categoryService.restoreCategory(user.id, categoryId);
      setArchivedCategories((current) => current.filter((item) => item.id !== categoryId));
      setCategories((current) =>
        [...current, restored].sort((a, b) => a.name.localeCompare(b.name, "vi")),
      );
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể khôi phục danh mục.");
    }
  }

  async function deleteCategoryPermanently(categoryId: number) {
    try {
      const user = await Auth.getUserInfo();
      if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
      await categoryService.deleteCategoryPermanently(user.id, categoryId);
      setArchivedCategories((current) => current.filter((item) => item.id !== categoryId));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa hẳn danh mục.");
    }
  }

  return {
    type,
    categories,
    archivedCategories,
    showArchived,
    setShowArchived,
    name,
    selectedIcon,
    editingId,
    editingName,
    editingIcon,
    error,
    setName: (value: string) => {
      setName(value);
      setError("");
    },
    setError,
    setSelectedIcon,
    setEditingName: (value: string) => {
      setEditingName(value);
      setError("");
    },
    setEditingIcon: (value: string) => {
      setEditingIcon(value);
      setError("");
    },
    resetForm,
    addCategory,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteCategory,
    restoreCategory,
    deleteCategoryPermanently,
    reload: load,
  };
}
