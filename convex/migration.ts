import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const importData = mutation({
  args: {
    categories: v.array(
      v.object({
        name: v.string(),
        color: v.string(),
        original_id: v.string(),
      })
    ),
    recipes: v.array(
      v.object({
        title: v.string(),
        category: v.string(),
        ingredients: v.array(v.string()),
        instructions: v.array(v.string()),
        image_url: v.optional(v.string()),
        original_id: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Import categories
    for (const cat of args.categories) {
      const existing = await ctx.db
        .query("categories")
        .filter((q) => q.eq(q.field("original_id"), cat.original_id))
        .first();
      
      if (!existing) {
        await ctx.db.insert("categories", {
          name: cat.name,
          color: cat.color,
          original_id: cat.original_id,
        });
      }
    }

    // Import recipes
    for (const recipe of args.recipes) {
      const existing = await ctx.db
        .query("recipes")
        .filter((q) => q.eq(q.field("original_id"), recipe.original_id))
        .first();
      
      if (!existing) {
        await ctx.db.insert("recipes", {
          title: recipe.title,
          category: recipe.category,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          image_url: recipe.image_url,
          original_id: recipe.original_id,
        });
      }
    }
    
    return { success: true };
  },
});
