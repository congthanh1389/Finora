import type { SQLiteDatabase } from "expo-sqlite";

export type ReferentialIntegrityIssue = {
  table: "categories" | "transactions";
  rowId: number;
  field: "parent_id" | "category_id";
  referencedId: number;
  reason: "missing_reference" | "different_user" | "type_mismatch" | "unexpected_transfer_category";
};

type RawIssue = {
  row_id: number;
  referenced_id: number;
  reason: ReferentialIntegrityIssue["reason"];
};

/**
 * Read-only audit. It deliberately does not repair rows or add constraints:
 * callers must review existing findings before a migration enforces foreign keys.
 */
export async function auditReferentialIntegrity(
  db: Pick<SQLiteDatabase, "getAllAsync">,
): Promise<ReferentialIntegrityIssue[]> {
  const categoryParentRows = await db.getAllAsync<RawIssue>(
    `SELECT c.id AS row_id, c.parent_id AS referenced_id,
       CASE
         WHEN p.id IS NULL THEN 'missing_reference'
         WHEN p.user_id <> c.user_id THEN 'different_user'
         WHEN p.type <> c.type THEN 'type_mismatch'
       END AS reason
     FROM categories c
     LEFT JOIN categories p ON p.id = c.parent_id
     WHERE c.parent_id IS NOT NULL
       AND (p.id IS NULL OR p.user_id <> c.user_id OR p.type <> c.type)
     ORDER BY c.id ASC`,
  );

  const transactionCategoryRows = await db.getAllAsync<RawIssue>(
    `SELECT t.id AS row_id, t.category_id AS referenced_id,
       CASE
         WHEN t.type = 'transfer' THEN 'unexpected_transfer_category'
         WHEN c.id IS NULL THEN 'missing_reference'
         WHEN c.user_id <> t.user_id THEN 'different_user'
         WHEN c.type <> t.type THEN 'type_mismatch'
       END AS reason
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.category_id IS NOT NULL
       AND (t.type = 'transfer' OR c.id IS NULL OR c.user_id <> t.user_id OR c.type <> t.type)
     ORDER BY t.id ASC`,
  );

  return [
    ...categoryParentRows.map((row) => ({
      table: "categories" as const,
      rowId: Number(row.row_id),
      field: "parent_id" as const,
      referencedId: Number(row.referenced_id),
      reason: row.reason,
    })),
    ...transactionCategoryRows.map((row) => ({
      table: "transactions" as const,
      rowId: Number(row.row_id),
      field: "category_id" as const,
      referencedId: Number(row.referenced_id),
      reason: row.reason,
    })),
  ];
}
