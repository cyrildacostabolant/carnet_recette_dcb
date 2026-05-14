import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if category already exists
    const existing = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    
    if (existing) {
      throw new Error("Category already exists");
    }

    return await ctx.db.insert("categories", {
      name: args.name,
      color: args.color,
    });
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Category not found");

    const oldName = existing.name;

    await ctx.db.patch(args.id, {
      name: args.name,
      color: args.color,
    });

    if (oldName !== args.name) {
      // update recipes
      const recipesToUpdate = await ctx.db
        .query("recipes")
        .withIndex("by_category", (q) => q.eq("category", oldName))
        .collect();
      
      for (const r of recipesToUpdate) {
        await ctx.db.patch(r._id, { category: args.name });
      }
    }
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
