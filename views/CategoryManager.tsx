
import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

const CategoryManager: React.FC = () => {
  const categoriesDb = useQuery(api.categories.getCategories);
  
  const createCategory = useMutation(api.categories.createCategory);
  const updateCategory = useMutation(api.categories.updateCategory);
  const deleteCategoryMutation = useMutation(api.categories.deleteCategory);

  const categories = categoriesDb?.map(c => ({
    id: c._id as string,
    name: c.name,
    color: c.color
  })) || [];

  const loading = categoriesDb === undefined;

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#f97316');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        const normalizedNewName = newName.trim();
        await updateCategory({
          id: editingId as Id<"categories">,
          name: normalizedNewName,
          color: newColor
        });

        setEditingId(null);
        setNewName('');
        setNewColor('#f97316');
      } else {
        // Mode Ajout
        await createCategory({
          name: newName.trim(),
          color: newColor
        });
        
        setNewName('');
        setNewColor('#f97316');
      }
    } catch (error: any) {
      alert(error.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cat: { id: string, name: string, color: string }) => {
    setEditingId(cat.id);
    setNewName(cat.name);
    setNewColor(cat.color);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewName('');
    setNewColor('#f97316');
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ? Les recettes associées resteront mais n'auront plus de couleur personnalisée.")) return;
    await deleteCategoryMutation({ id: id as Id<"categories"> });
    if (editingId === id) cancelEdit();
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h1 className="text-2xl font-black mb-6 flex items-center">
          <i className={`fas ${editingId ? 'fa-pen' : 'fa-tags'} mr-3 text-orange-500`}></i>
          {editingId ? 'Modifier la catégorie' : 'Gérer les catégories'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="flex gap-2">
            <input 
              type="text" placeholder="Nom (Ex: Brunch)" required
              className="flex-grow px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
              value={newName} onChange={e => setNewName(e.target.value)}
              disabled={isSubmitting}
            />
            <input 
              type="color" className="w-12 h-10 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
              value={newColor} onChange={e => setNewColor(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`flex-grow py-2 rounded-xl font-bold text-white transition-colors flex items-center justify-center ${
                editingId 
                  ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300' 
                  : 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300'
              }`}
            >
              {isSubmitting && <i className="fas fa-spinner animate-spin mr-2"></i>}
              {editingId ? 'Mettre à jour' : 'Ajouter la catégorie'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={cancelEdit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </form>

        <div className="space-y-3">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Catégories existantes</h2>
          {loading ? (
            <div className="space-y-2">
              <div className="animate-pulse h-12 bg-gray-100 rounded-xl"></div>
              <div className="animate-pulse h-12 bg-gray-100 rounded-xl"></div>
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-400 py-4 italic">Aucune catégorie pour le moment.</p>
          ) : categories.map(cat => (
            <div key={cat.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${editingId === cat.id ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div>
                <span className={`font-bold ${editingId === cat.id ? 'text-blue-700' : 'text-gray-700'}`}>{cat.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleEdit(cat)} 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${editingId === cat.id ? 'text-blue-500 bg-white shadow-sm' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}
                  title="Modifier"
                >
                  <i className="fas fa-pen text-xs"></i>
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)} 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Supprimer"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
