import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    color: v.string(),
    // We can keep original supabase id for reference if needed during migration, or just create it
    original_id: v.optional(v.string()), 
  }),
  recipes: defineTable({
    title: v.string(),
    category: v.string(), // category name, same as before
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()),
    image_url: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")), // Convex storage ID
    original_id: v.optional(v.string()),
  }).index("by_category", ["category"]),
});
