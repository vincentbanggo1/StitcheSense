import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router';
import { apiService, type Product, type ProductCreateAdmin, type ProductUpdateAdmin, type ProductImage } from '../services/api';

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  available_sizes: string[];
  fabric: string;
  color: string;
  stock_quantity: string;
  is_featured: boolean;
  is_active: boolean;
  care_instructions: string;
  images: File[];
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  category: 'wedding',
  price: '',
  available_sizes: ['M'], // Default to medium size
  fabric: '',
  color: '',
  stock_quantity: '',
  is_featured: false,
  is_active: true,
  care_instructions: '',
  images: [],
};

const AdminProductManager: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
  });
  
  // Image upload states
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllProductsAdmin({
        search: filters.search || undefined,
        category: filters.category || undefined,
        is_active: filters.status ? filters.status === 'active' : undefined,
      });
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.category, filters.status]);

  const filterProducts = useCallback(() => {
    let filtered = [...products];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.status) {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(product => product.is_active === isActive);
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const handleCreateProduct = async () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      available_sizes: product.available_sizes,
      fabric: product.fabric,
      color: product.color,
      stock_quantity: product.stock_quantity.toString(),
      is_featured: product.is_featured,
      is_active: product.is_active,
      care_instructions: product.care_instructions || '',
      images: [], // Reset images for editing
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await apiService.deleteProductAdmin(productId);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  // Helper function to create data URL from Base64 image data
  const getImageDataUrl = (image: ProductImage): string => {
    return `data:${image.content_type};base64,${image.data}`;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = 'Valid price is required';
    }
    if (!formData.available_sizes || formData.available_sizes.length === 0) {
      errors.available_sizes = 'At least one size is required';
    }
    if (!formData.fabric.trim()) errors.fabric = 'Fabric is required';
    if (!formData.color.trim()) errors.color = 'Color is required';
    if (!formData.stock_quantity || isNaN(Number(formData.stock_quantity)) || Number(formData.stock_quantity) < 0) {
      errors.stock_quantity = 'Valid stock quantity is required';
    }
    // Only require images for new products, not when editing
    if (!editingProduct && (!formData.images || formData.images.length === 0)) {
      errors.images = 'At least one product image is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      // First, upload images if any
      let imageData: ProductImage[] = [];
      if (formData.images.length > 0) {
        const uploadPromises = formData.images.map(file => apiService.uploadProductImage(file));
        const uploadResults = await Promise.all(uploadPromises);
        imageData = uploadResults.map((result, index) => ({
          data: result.data,
          content_type: result.content_type,
          filename: result.filename,
          is_primary: index === 0, // First image is primary
          alt_text: `${formData.name} - Image ${index + 1}`
        }));
      }

      const productData: ProductCreateAdmin | ProductUpdateAdmin = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        available_sizes: formData.available_sizes,
        fabric: formData.fabric,
        color: formData.color,
        stock_quantity: Number(formData.stock_quantity),
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        care_instructions: formData.care_instructions || undefined,
        images: imageData,
      };

      if (editingProduct) {
        await apiService.updateProductAdmin(editingProduct._id, productData);
      } else {
        await apiService.createProductAdmin(productData as ProductCreateAdmin);
      }

      await fetchProducts();
      setShowForm(false);
      alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;

    try {
      setUploading(true);
      const uploadPromises = Array.from(files).map(file => apiService.uploadProductImage(file));
      await Promise.all(uploadPromises);
      setShowImageUpload(false);
      alert('Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedProducts.size) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.size} products?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedProducts).map(id => apiService.deleteProductAdmin(id));
      await Promise.all(deletePromises);
      await fetchProducts();
      setSelectedProducts(new Set());
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Failed to delete some products');
    }
  };

  // Show loading while auth is being verified
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Redirect if not admin (only after loading is complete)
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-2 text-gray-600">Manage your gown catalog</p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filters */}
              <select 
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="wedding">Wedding</option>
                <option value="debut">Debut</option>
                <option value="modern">Modern</option>
              </select>

              <select 
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={handleCreateProduct}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Product
              </button>
              <button 
                onClick={() => setShowImageUpload(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Upload Images
              </button>
              {selectedProducts.size > 0 && (
                <button 
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete Selected ({selectedProducts.size})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            {filteredProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-6 p-4">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedProducts.size > 0 
                      ? `${selectedProducts.size} products selected` 
                      : `${filteredProducts.length} products total`}
                  </span>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2h8a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  {products.length === 0 
                    ? 'Get started by creating your first product' 
                    : 'Try adjusting your search or filter criteria'}
                </p>
                <button 
                  onClick={handleCreateProduct}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="relative">
                      {/* Product Image */}
                      <div className="aspect-w-4 aspect-h-3 bg-gray-200">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={(() => {
                              const imageToUse = product.images.find(img => img.is_primary) || product.images[0];
                              return getImageDataUrl(imageToUse);
                            })()}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center bg-gray-200">
                            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                      </div>

                      {/* Featured Badge */}
                      {product.is_featured && (
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute bottom-2 right-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Category:</span>
                        <span className="text-sm text-gray-900 capitalize">{product.category}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Price:</span>
                        <span className="text-lg font-bold text-pink-600">₱{product.price.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-gray-500">Stock:</span>
                        <span className={`text-sm font-medium ${
                          product.stock_quantity <= 5 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {product.stock_quantity} units
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-pink-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Products</div>
                <div className="text-2xl font-semibold text-gray-900">{products.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Active Products</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.is_active).length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Featured</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.is_featured).length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Low Stock</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.stock_quantity <= 5).length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          formErrors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter product name"
                      />
                      {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          formErrors.category ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="wedding">Wedding</option>
                        <option value="debut">Debut</option>
                        <option value="modern">Modern</option>
                      </select>
                      {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          formErrors.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                      />
                      {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          formErrors.stock_quantity ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter stock quantity"
                        min="0"
                      />
                      {formErrors.stock_quantity && <p className="text-red-500 text-sm mt-1">{formErrors.stock_quantity}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fabric</label>
                      <input
                        type="text"
                        value={formData.fabric}
                        onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          formErrors.fabric ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter fabric type"
                      />
                      {formErrors.fabric && <p className="text-red-500 text-sm mt-1">{formErrors.fabric}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          formErrors.color ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter color"
                      />
                      {formErrors.color && <p className="text-red-500 text-sm mt-1">{formErrors.color}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Sizes</label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'].map((size) => (
                        <label key={size} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.available_sizes.includes(size)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  available_sizes: [...formData.available_sizes, size] 
                                });
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  available_sizes: formData.available_sizes.filter(s => s !== size) 
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{size}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.available_sizes && <p className="text-red-500 text-sm mt-1">{formErrors.available_sizes}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Images {!editingProduct && <span className="text-red-500">*</span>}
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      formErrors.images ? 'border-red-300' : 'border-gray-300'
                    }`}>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            setFormData({ 
                              ...formData, 
                              images: Array.from(e.target.files) 
                            });
                          }
                        }}
                        className="hidden"
                        id="product-images-upload"
                      />
                      <label htmlFor="product-images-upload" className="cursor-pointer">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Click to upload product images</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each - Multiple files allowed</p>
                        </div>
                      </label>
                    </div>
                    
                    {formData.images.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Selected Images ({formData.images.length}):
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {formData.images.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = formData.images.filter((_, i) => i !== index);
                                  setFormData({ ...formData, images: newImages });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {formErrors.images && <p className="text-red-500 text-sm mt-1">{formErrors.images}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                        formErrors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter product description"
                    />
                    {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
                    <textarea
                      value={formData.care_instructions}
                      onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter care instructions (optional)"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create')} Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload Modal */}
        {showImageUpload && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Product Images</h3>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Click to upload images</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                      </div>
                    </label>
                  </div>

                  {uploading && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Uploading images...</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowImageUpload(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductManager;
