import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserWithSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const settings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    return { user, settings };
  },
});

export const createUserWithSettings = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    companyName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new Error("User already exists");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      companyName: args.companyName,
      createdAt: Date.now(),
    });

    await ctx.db.insert("settings", {
      userId: userId,
      incomeCategories: ["Salary", "Freelance", "Investments", "Other Income"],
      expenseCategories: [
        "Rent",
        "Utilities",
        "Food",
        "Transport",
        "Entertainment",
        "Shopping",
        "Health",
        "Other",
      ],
      savingsTarget: 0,
      warningThreshold: 0,
      reinvestmentRules: [],
    });

    return userId;
  },
});
