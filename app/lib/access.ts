"use client";

import { isAdmin } from "./admin";
import { useRole, type Role } from "./roles";
import { useVip } from "./vip";

export function canOpenAdmin(email?: string | null) {
  return isAdmin(email);
}

export function canReadTickets(email?: string | null, vip?: boolean) {
  return isAdmin(email) || Boolean(vip);
}

export function useTicketAccess(email?: string | null) {
  const vip = useVip(email);
  const role = useRole(email);
  return {
    role,
    vip,
    unlocked: canReadTickets(email, vip),
    desk: canOpenAdmin(email),
  };
}

export function nextPathFor(role: Role) {
  if (role === "admin") return "/admin";
  return "/";
}
