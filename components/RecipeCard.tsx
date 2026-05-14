
import React from 'react';
import { Link } from 'react-router-dom';
import { Recipe } from '../types';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const categoriesDb = useQuery(api.categories.getCategories) || [];
  const getImageUrl = useQuery(api.recipes.getImageUrl, recipe.imageId ? { imageId: recipe.imageId as any } : "skip");
  
  const categoryInfo = categoriesDb.find(c => c.name === recipe.category);
  const color = categoryInfo?.color || '#f97316';

  const resolvedImageUrl = getImageUrl || recipe.image_url || `https://picsum.photos/seed/${recipe.id}/400/300`;

  const getContrastColor = (hexColor: string) => {
    if (!hexColor) return '#ffffff';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? '#000000' : '#ffffff';
  };

  const textColor = getContrastColor(color);

  return (
    <Link 
      to={`/recipe/${recipe.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img src={resolvedImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm" style={{ backgroundColor: color, color: textColor }}>
            {recipe.category}
          </span>
        </div>
      </div>
      <div className="p-4 flex-grow">
        <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">{recipe.title}</h3>
        <p className="text-gray-400 text-xs mt-2 italic">{recipe.ingredients.length} ingrédients</p>
      </div>
    </Link>
  );
};

export default RecipeCard;