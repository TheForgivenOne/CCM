import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    companyName: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  transactions: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    type: v.union(v.literal("income"), v.literal("expense")),
    category: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
    recurring: v.optional(
      v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("biweekly"),
        v.literal("monthly"),
        v.literal("yearly"),
        v.null()
      )
    ),
    recurringEnd: v.optional(v.union(v.number(), v.null())),
    parentId: v.optional(v.id("transactions")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_type", ["userId", "type"]),

  settings: defineTable({
    userId: v.id("users"),
    incomeCategories: v.array(v.string()),
    expenseCategories: v.array(v.string()),
    savingsTarget: v.number(),
    warningThreshold: v.number(),
    reinvestmentRules: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        threshold: v.number(),
        target: v.string(),
        enabled: v.boolean(),
      })
    ),
  }).index("by_user", ["userId"]),
});
