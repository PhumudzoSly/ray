import { z } from "zod";
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string({ message: "Password is required" }).min(4, {
    message: "Please enter a valid password",
  }),
});

export const signUpSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[a-zA-Z]+$/, "First name must contain only letters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[a-zA-Z]+$/, "Last name must contain only letters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Path to the error message
  });

export const apiKeys = defineTable({
  organizationId: v.string(),
  name: v.string(),
  keyHash: v.string(), // Hashed version of the key for verification
  keyPreview: v.string(), // First 8 characters for display
  permissions: v.array(v.string()), // Array of permissions like ["read", "write", "admin"]
  createdBy: v.string(), // User ID who created the key
  createdAt: v.number(),
  lastUsed: v.optional(v.number()),
  isActive: v.boolean(),
  expiresAt: v.optional(v.number()),
})
  .index("by_organization", ["organizationId"])
  .index("by_organization_active", ["organizationId", "isActive"])
  .index("by_created_by", ["createdBy"])
  .index("by_key_hash", ["keyHash"]);

// ... existing code ...
