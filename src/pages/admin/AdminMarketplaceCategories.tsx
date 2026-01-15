import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const AdminMarketplaceCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Hardcoded category slugs that cannot be edited or deleted
  const HARDCODED_CATEGORY_SLUGS = [
    'motors',
    'property-sale',
    'property-rent',
    'mobile-tablets',
    'electronics',
    'furniture-garden',
    'fashion',
    'pets',
    'kids-babies',
    'jobs',
    'services',
    'business-industrial',
    'hobbies'
  ];
  
  const isHardcodedCategory = (slug: string) => HARDCODED_CATEGORY_SLUGS.includes(slug);
  
  // Category form state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    display_order: 0,
    is_active: true,
  });

  // Subcategory form state
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [selectedCategoryForSubcat, setSelectedCategoryForSubcat] = useState<string>('');
  const [subcategoryForm, setSubcategoryForm] = useState({
    category_id: '',
    name: '',
    slug: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: categoriesData } = await supabase
        .from('marketplace_categories')
        .select('*')
        .order('display_order');

      const { data: subcategoriesData } = await supabase
        .from('marketplace_subcategories')
        .select('*')
        .order('display_order');

      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('marketplace_categories')
          .update(categoryForm)
          .eq('id', editingCategory.id);
        if (error) throw error;
        alert('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('marketplace_categories')
          .insert([categoryForm]);
        if (error) throw error;
        alert('Category created successfully');
      }
      setCategoryDialogOpen(false);
      resetCategoryForm();
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubcategory) {
        const { error } = await supabase
          .from('marketplace_subcategories')
          .update(subcategoryForm)
          .eq('id', editingSubcategory.id);
        if (error) throw error;
        alert('Subcategory updated successfully');
      } else {
        const { error } = await supabase
          .from('marketplace_subcategories')
          .insert([subcategoryForm]);
        if (error) throw error;
        alert('Subcategory created successfully');
      }
      setSubcategoryDialogOpen(false);
      resetSubcategoryForm();
      fetchData();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert('Error saving subcategory');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure? This will also delete all subcategories and listings under this category.')) return;
    
    try {
      const { error } = await supabase
        .from('marketplace_categories')
        .delete()
        .eq('id', categoryId);
      if (error) throw error;
      alert('Category deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const deleteSubcategory = async (subcategoryId: string) => {
    if (!confirm('Are you sure? This will affect all listings under this subcategory.')) return;
    
    try {
      const { error } = await supabase
        .from('marketplace_subcategories')
        .delete()
        .eq('id', subcategoryId);
      if (error) throw error;
      alert('Subcategory deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('Error deleting subcategory');
    }
  };

  const openEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setCategoryDialogOpen(true);
  };

  const openEditSubcategory = (subcategory: any) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      category_id: subcategory.category_id,
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description || '',
      display_order: subcategory.display_order,
      is_active: subcategory.is_active,
    });
    setSubcategoryDialogOpen(true);
  };

  const openAddSubcategory = (categoryId: string) => {
    setSelectedCategoryForSubcat(categoryId);
    setSubcategoryForm({
      category_id: categoryId,
      name: '',
      slug: '',
      description: '',
      display_order: 0,
      is_active: true,
    });
    setSubcategoryDialogOpen(true);
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      icon: '',
      display_order: 0,
      is_active: true,
    });
  };

  const resetSubcategoryForm = () => {
    setEditingSubcategory(null);
    setSelectedCategoryForSubcat('');
    setSubcategoryForm({
      category_id: '',
      name: '',
      slug: '',
      description: '',
      display_order: 0,
      is_active: true,
    });
  };

  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-black font-comfortaa">Marketplace Categories</h2>
            <p className="text-gray-600 font-roboto mt-1">Manage marketplace categories and subcategories</p>
          </div>
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetCategoryForm} className="bg-black hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-comfortaa">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
                <DialogDescription className="font-roboto">
                  {editingCategory ? 'Update category details' : 'Create a new marketplace category'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Category Name *
                  </label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g., Motors, Property, Jobs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Slug *
                  </label>
                  <Input
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="e.g., motors, property-sale, jobs"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 font-roboto">Used in URLs (lowercase, no spaces)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Description
                  </label>
                  <Textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Icon (emoji or icon name)
                  </label>
                  <Input
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="e.g., 🚗, 🏠, 💼"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                      Display Order
                    </label>
                    <Input
                      type="number"
                      value={categoryForm.display_order}
                      onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-7">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm font-medium text-gray-700 font-roboto">Active</label>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-black hover:bg-gray-800">
                    {editingCategory ? 'Update' : 'Create'} Category
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 font-comfortaa mb-1">About Category Management</h3>
              <p className="text-sm text-blue-800 font-roboto">
                <strong>Main Categories (12 total)</strong> are hardcoded in the frontend for consistent UI/UX and cannot be edited or deleted here. 
                However, you have full control over <strong>subcategories</strong> - you can add, edit, and remove them as needed. 
                Subcategories help organize listings within each main category (e.g., "Cars for Sale" and "Motorcycles" under Motors).
              </p>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-roboto w-12"></TableHead>
                <TableHead className="font-roboto">Name</TableHead>
                <TableHead className="font-roboto">Slug</TableHead>
                <TableHead className="font-roboto">Icon</TableHead>
                <TableHead className="font-roboto">Order</TableHead>
                <TableHead className="font-roboto">Status</TableHead>
                <TableHead className="font-roboto">Subcategories</TableHead>
                <TableHead className="font-roboto">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500 font-roboto">
                    No categories found. Create your first category!
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => {
                  const categorySubcats = getSubcategoriesForCategory(category.id);
                  const isExpanded = expandedCategories.has(category.id);
                  
                  return (
                    <React.Fragment key={category.id}>
                      <TableRow>
                        <TableCell>
                          {categorySubcats.length > 0 && (
                            <button onClick={() => toggleCategory(category.id)} className="p-1 hover:bg-gray-100 rounded">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium font-roboto">{category.name}</TableCell>
                        <TableCell className="font-roboto text-sm text-gray-600">{category.slug}</TableCell>
                        <TableCell className="text-xl">{category.icon}</TableCell>
                        <TableCell className="font-roboto">{category.display_order}</TableCell>
                        <TableCell>
                          <Badge className={category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-roboto">
                          <div className="flex items-center gap-2">
                            <span>{categorySubcats.length}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAddSubcategory(category.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {isHardcodedCategory(category.slug) ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                                  System Category
                                </Badge>
                              </div>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditCategory(category)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteCategory(category.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Subcategories */}
                      {isExpanded && categorySubcats.map((subcat) => (
                        <TableRow key={subcat.id} className="bg-gray-50">
                          <TableCell></TableCell>
                          <TableCell className="pl-8 font-roboto text-sm">
                            <span className="text-gray-500 mr-2">└</span>
                            {subcat.name}
                          </TableCell>
                          <TableCell className="font-roboto text-sm text-gray-600">{subcat.slug}</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="font-roboto text-sm">{subcat.display_order}</TableCell>
                          <TableCell>
                            <Badge className={subcat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {subcat.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditSubcategory(subcat)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSubcategory(subcat.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Subcategory Dialog */}
        <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-comfortaa">
                {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
              </DialogTitle>
              <DialogDescription className="font-roboto">
                {editingSubcategory ? 'Update subcategory details' : 'Create a new subcategory'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubcategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                  Parent Category *
                </label>
                <select
                  value={subcategoryForm.category_id}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-roboto"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                  Subcategory Name *
                </label>
                <Input
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  placeholder="e.g., Apartments, Villas, Cars"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                  Slug *
                </label>
                <Input
                  value={subcategoryForm.slug}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, slug: e.target.value })}
                  placeholder="e.g., apartments, villas, cars"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                  Description
                </label>
                <Textarea
                  value={subcategoryForm.description}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    value={subcategoryForm.display_order}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, display_order: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <input
                    type="checkbox"
                    checked={subcategoryForm.is_active}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700 font-roboto">Active</label>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setSubcategoryDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-black hover:bg-gray-800">
                  {editingSubcategory ? 'Update' : 'Create'} Subcategory
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMarketplaceCategories;
