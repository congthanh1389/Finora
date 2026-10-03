import type { InsertUser } from "../drizzle/schema";
import {
  createLocalUser as createStoredUser,
  getLocalUserByEmail,
  getLocalUserByOpenId,
  touchLocalUserLastSignedIn,
  upsertLocalUser,
} from "./local-store";
import { ENV } from "./_core/env";

export async function getDb() {
  return null;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const values: InsertUser = { ...user };
  if (!values.role && user.openId === ENV.ownerOpenId) values.role = "admin";
  await upsertLocalUser(values);
}

export async function getUserByOpenId(openId: string) {
  return getLocalUserByOpenId(openId);
}

export async function getUserByEmail(email: string) {
  return getLocalUserByEmail(email);
}

export async function createLocalUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  return createStoredUser(input);
}

export async function touchUserLastSignedIn(openId: string) {
  return touchLocalUserLastSignedIn(openId);
}
