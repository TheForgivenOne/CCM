import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    return settings;
  },
});

export const create = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settingsId = await ctx.db.insert("settings", {
      userId: args.userId,
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
    return settingsId;
  },
});

export const update = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        incomeCategories: args.incomeCategories,
        expenseCategories: args.expenseCategories,
        savingsTarget: args.savingsTarget,
        warningThreshold: args.warningThreshold,
        reinvestmentRules: args.reinvestmentRules,
      });
      return await ctx.db.get(existing._id);
    } else {
      const settingsId = await ctx.db.insert("settings", {
        userId: args.userId,
        incomeCategories: args.incomeCategories,
        expenseCategories: args.expenseCategories,
        savingsTarget: args.savingsTarget,
        warningThreshold: args.warningThreshold,
        reinvestmentRules: args.reinvestmentRules,
      });
      return await ctx.db.get(settingsId);
    }
  },
});
