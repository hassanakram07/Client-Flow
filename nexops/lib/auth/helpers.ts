import { User } from "@/lib/types";
import { db } from "@/lib/db/store";

export interface Session {
  user: User;
  tenantId: string;
}

// Demo credentials for each role
export const DEMO_CREDENTIALS = [
  {
    email: "sophia@meridianagency.com",
    password: "demo1234",
    label: "Admin — Sophia Reyes",
    role: "admin" as const,
  },
  {
    email: "marcus@meridianagency.com",
    password: "demo1234",
    label: "Team — Marcus Webb",
    role: "team" as const,
  },
  {
    email: "ethan@halcyonventures.com",
    password: "demo1234",
    label: "Client — Ethan Blackwell (Halcyon Ventures)",
    role: "client" as const,
  },
  {
    email: "naomi@stratalogistics.com",
    password: "demo1234",
    label: "Client — Naomi Chen (Strata Logistics)",
    role: "client" as const,
  },
];

// Validate credentials — always accepts password "demo1234" for demo users
export function validateCredentials(email: string, password: string): User | null {
  if (password !== "demo1234") return null;
  return db.getUserByEmail(email);
}

// Route user to correct area after login
export function getPostLoginRedirect(user: User): string {
  switch (user.role) {
    case "admin":
    case "team":
      return "/admin/dashboard";
    case "client":
      return "/portal/dashboard";
    default:
      return "/login";
  }
}

// Check if user can access a given path
export function canAccessPath(user: User | null, path: string): boolean {
  if (!user) {
    return path.startsWith("/login") || path.startsWith("/signup") || path === "/";
  }
  if (path.startsWith("/admin")) {
    return user.role === "admin" || user.role === "team";
  }
  if (path.startsWith("/portal")) {
    return user.role === "client";
  }
  return true;
}

// Format user initials for avatar fallback
export function getUserInitials(name: string): string {
  return name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
