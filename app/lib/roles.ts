"use client";

import { isAdmin } from "./admin";
import { useVip } from "./vip";

export type Role = "guest" | "user" | "vip" | "admin";

export function useRole(email?: string | null): Role {
  const vip = useVip(email);
  if (!email) return "guest";
  if (isAdmin(email)) return "admin";
  if (vip) return "vip";
  return "user";
}

export function roleLabel(role: Role) {
  if (role === "admin") return "Admin";
  if (role === "vip") return "VIP";
  if (role === "user") return "Member";
  return "Guest";
}
