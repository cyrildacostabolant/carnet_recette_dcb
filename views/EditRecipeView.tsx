
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

const EditRecipeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const categoriesDb = useQuery(api.categories.getCategories) || [];
  const recipe = useQuery(api.recipes.getRecipe, id ? { id: id as Id<"recipes"> } : "skip");
  
  const updateRecipe = useMutation(api.recipes.updateRecipe);
  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);
  const getImageUrl = useQuery(api.recipes.getImageUrl, recipe?.imageId ? { imageId: recipe.imageId } : "skip");

  const categories = categoriesDb.map(c => ({ id: c._id, name: c.name }));

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title);
      setCategory(recipe.category);
      setIngredients(recipe.ingredients || ['']);
      setInstructions(recipe.instructions || ['']);
      // Image
      if (getImageUrl) {
         setExistingImageUrl(getImageUrl);
         setImagePreview(getImageUrl);
      } else if (recipe.image_url) {
         setExistingImageUrl(recipe.image_url);
         setImagePreview(recipe.image_url);
      }
    } else if (recipe === null) {
      navigate('/');
    }
  }, [recipe, getImageUrl, navigate]);

  const processFile = (file: File) => {
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleFieldChange = (idx: number, val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleRemoveField = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => {
    if (list.length > 1) {
      setter(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !id) return;
    setLoading(true);

    try {
      let imageId = recipe?.imageId;
      let imageUrl = existingImageUrl;

      if (imageFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });

        if (!result.ok) {
           throw new Error("Erreur lors de l'upload de l'image");
        }
        
        const { storageId } = await result.json();
        imageId = storageId;
        imageUrl = ''; // We clear image_url if we are now using storageId
      }

      await updateRecipe({
        id: id as Id<"recipes">,
        title: title.trim(),
        category,
        ingredients: ingredients.filter(i => i.trim()),
        instructions: instructions.filter(i => i.trim()),
        imageId,
        image_url: imageUrl,
      });

      alert('Recette mise à jour !');
      navigate(`/recipe/${id}`);
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour:", err);
      alert(err.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto overflow-hidden animate-fadeIn">
      <div className="bg-orange-500 p-8 text-white">
        <h1 className="text-3xl font-black">Modifier la recette</h1>
        <p className="opacity-90">Mettez à jour vos informations culinaires.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase">Nom de la recette</label>
            <input 
              value={title} onChange={e => setTitle(e.target.value)} 
              placeholder="Titre de la pépite" 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase">Catégorie</label>
            <select 
              value={category} onChange={e => setCategory(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
            >
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 uppercase">Photo de la recette</label>
          <div className={`relative min-h-[12rem] border-2 border-dashed rounded-2xl flex items-center justify-center overflow-hidden transition-all ${imagePreview ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
            {imagePreview ? (
              <div className="w-full h-full relative group">
                <img src={imagePreview} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-4">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-orange-500 px-4 py-2 rounded-xl font-bold text-sm shadow-xl">Changer (Galerie)</button>
                    <button type="button" onClick={() => cameraInputRef.current?.click()} className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl">Prendre photo</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 w-full sm:w-auto flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <i className="fas fa-images text-2xl text-gray-400 group-hover:text-orange-500 mb-2"></i>
                  <span className="text-sm font-bold text-gray-600">Galerie</span>
                </button>
                <button 
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 w-full sm:w-auto flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <i className="fas fa-camera text-2xl text-gray-400 group-hover:text-orange-500 mb-2"></i>
                  <span className="text-sm font-bold text-gray-600">Photo</span>
                </button>
              </div>
            )}
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
            <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="font-bold text-gray-700 uppercase flex justify-between">
            Ingrédients 
            <button type="button" onClick={() => setIngredients([...ingredients, ''])} className="text-orange-500 text-xs">+ Ajouter</button>
          </label>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex space-x-2">
              <input 
                value={ing} onChange={e => handleFieldChange(i, e.target.value, setIngredients)} 
                className="flex-grow px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
              />
              <button type="button" onClick={() => handleRemoveField(i, setIngredients, ingredients)} className="text-gray-300 hover:text-red-500">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <label className="font-bold text-gray-700 uppercase flex justify-between">
            Instructions 
            <button type="button" onClick={() => setInstructions([...instructions, ''])} className="text-orange-500 text-xs">+ Ajouter</button>
          </label>
          {instructions.map((step, i) => (
            <div key={i} className="flex space-x-2">
              <textarea 
                value={step} onChange={e => handleFieldChange(i, e.target.value, setInstructions)} 
                className="flex-grow px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 h-24 focus:ring-2 focus:ring-orange-500 outline-none" 
              />
              <button type="button" onClick={() => handleRemoveField(i, setInstructions, instructions)} className="text-gray-300 hover:text-red-500">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={loading} className={`flex-[2] py-4 rounded-2xl font-black text-lg text-white shadow-lg transition-all ${loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}>
            {loading ? 'Enregistrement...' : 'Mettre à jour'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRecipeView;
