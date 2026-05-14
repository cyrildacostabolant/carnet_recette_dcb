import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getRecipes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("recipes").order("desc").collect();
  },
});

export const getRecipe = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createRecipe = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()),
    imageId: v.optional(v.id("_storage")),
    image_url: v.optional(v.string()), // For legacy mapping or external URLs
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("recipes", {
      title: args.title,
      category: args.category,
      ingredients: args.ingredients,
      instructions: args.instructions,
      imageId: args.imageId,
      image_url: args.image_url,
    });
  },
});

export const updateRecipe = mutation({
  args: {
    id: v.id("recipes"),
    title: v.string(),
    category: v.string(),
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()),
    imageId: v.optional(v.id("_storage")),
    image_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
    return id;
  },
});

export const deleteRecipe = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    // Optionally delete the associated image
    const recipe = await ctx.db.get(args.id);
    if (recipe?.imageId) {
      await ctx.storage.delete(recipe.imageId);
    }
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = query({
  args: { imageId: v.optional(v.id("_storage")) },
  handler: async (ctx, args) => {
    if (!args.imageId) return null;
    return await ctx.storage.getUrl(args.imageId);
  },
});
