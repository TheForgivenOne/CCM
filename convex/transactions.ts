import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return transactions;
  },
});

export const getByUserAndType = query({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("income"), v.literal("expense")),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .collect();
    return transactions;
  },
});

export const getById = query({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
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
    recurringEnd: v.optional(v.number()),
    parentId: v.optional(v.id("transactions")),
  },
  handler: async (ctx, args) => {
    const transactionId = await ctx.db.insert("transactions", {
      userId: args.userId,
      amount: args.amount,
      type: args.type,
      category: args.category,
      description: args.description,
      date: args.date,
      recurring: args.recurring,
      recurringEnd: args.recurringEnd,
      parentId: args.parentId,
      createdAt: Date.now(),
    });
    return transactionId;
  },
});

export const update = mutation({
  args: {
    id: v.id("transactions"),
    amount: v.number(),
    type: v.union(v.literal("income"), v.literal("expense")),
    category: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      amount: args.amount,
      type: args.type,
      category: args.category,
      description: args.description,
      date: args.date,
    });
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

function getNextDate(currentDate: number, recurring: string): number {
  const date = new Date(currentDate);
  switch (recurring) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "biweekly":
      date.setDate(date.getDate() + 14);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.getTime();
}

export const generateRecurring = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = Date.now();
    const recurringTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.neq(q.field("recurring"), null),
          q.or(
            q.eq(q.field("recurringEnd"), null),
            q.gte(q.field("recurringEnd"), today)
          )
        )
      )
      .collect();

    const newTransactions: string[] = [];

    for (const t of recurringTransactions) {
      if (!t.recurring) continue;

      let nextDate = getNextDate(t.date, t.recurring);

      while (nextDate <= today) {
        const existing = await ctx.db
          .query("transactions")
          .withIndex("by_user_and_date", (q) =>
            q.eq("userId", args.userId).eq("date", nextDate)
          )
          .filter((q) => q.eq(q.field("parentId"), t._id))
          .collect();

        if (existing.length === 0) {
          const newId = await ctx.db.insert("transactions", {
            userId: args.userId,
            amount: t.amount,
            type: t.type,
            category: t.category,
            description: t.description,
            date: nextDate,
            recurring: null,
            recurringEnd: null,
            parentId: t._id,
            createdAt: Date.now(),
          });
          newTransactions.push(newId);
        }

        nextDate = getNextDate(nextDate, t.recurring);
      }
    }

    return newTransactions;
  },
});

export const getBalance = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    }

    return income - expense;
  },
});

export const getAllTimeHigh = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();

    let maxBalance = 0;
    let runningBalance = 0;

    for (const t of transactions) {
      if (t.type === "income") {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }

      if (runningBalance > maxBalance) {
        maxBalance = runningBalance;
      }
    }

    return maxBalance;
  },
});
