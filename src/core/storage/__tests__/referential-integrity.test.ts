import { describe, expect, it, vi } from "vitest";
import type { SQLiteDatabase } from "expo-sqlite";

import { auditReferentialIntegrity } from "../referential-integrity";

describe("auditReferentialIntegrity", () => {
  it("reports missing, cross-user, and mismatched category references without mutating data", async () => {
    const getAllAsync = vi.fn(async (sql: string) => {
      if (sql.includes("FROM categories c")) {
        return [
          { row_id: 12, referenced_id: 404, reason: "missing_reference" },
          { row_id: 13, referenced_id: 8, reason: "different_user" },
          { row_id: 14, referenced_id: 9, reason: "type_mismatch" },
        ];
      }
      return [
        { row_id: 21, referenced_id: 404, reason: "missing_reference" },
        { row_id: 22, referenced_id: 8, reason: "different_user" },
        { row_id: 23, referenced_id: 9, reason: "type_mismatch" },
        { row_id: 24, referenced_id: 10, reason: "unexpected_transfer_category" },
      ];
    });
    const db = { getAllAsync } as unknown as Pick<SQLiteDatabase, "getAllAsync">;

    const issues = await auditReferentialIntegrity(db);

    expect(issues).toEqual([
      { table: "categories", rowId: 12, field: "parent_id", referencedId: 404, reason: "missing_reference" },
      { table: "categories", rowId: 13, field: "parent_id", referencedId: 8, reason: "different_user" },
      { table: "categories", rowId: 14, field: "parent_id", referencedId: 9, reason: "type_mismatch" },
      { table: "transactions", rowId: 21, field: "category_id", referencedId: 404, reason: "missing_reference" },
      { table: "transactions", rowId: 22, field: "category_id", referencedId: 8, reason: "different_user" },
      { table: "transactions", rowId: 23, field: "category_id", referencedId: 9, reason: "type_mismatch" },
      { table: "transactions", rowId: 24, field: "category_id", referencedId: 10, reason: "unexpected_transfer_category" },
    ]);
    expect(getAllAsync).toHaveBeenCalledTimes(2);
  });

  it("returns an empty list when all references are valid", async () => {
    const getAllAsync = vi.fn(async () => []);
    const db = { getAllAsync } as unknown as Pick<SQLiteDatabase, "getAllAsync">;

    await expect(auditReferentialIntegrity(db)).resolves.toEqual([]);
    expect(getAllAsync).toHaveBeenCalledTimes(2);
  });
});
