import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { Product } from '../services/api';

interface ProductsContextType {
  products: Product[];
  featuredProducts: Product[];
  loading: boolean;
  error: string | null;
  getProductsByCategory: (category: string) => Product[];
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [allProducts, featured] = await Promise.all([
        apiService.getProducts(),
        apiService.getFeaturedProducts()
      ]);
      
      setProducts(allProducts);
      setFeaturedProducts(featured);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getProductsByCategory = (category: string): Product[] => {
    return products.filter(product => product.category === category);
  };

  const refreshProducts = async () => {
    await fetchProducts();
  };

  const value: ProductsContextType = {
    products,
    featuredProducts,
    loading,
    error,
    getProductsByCategory,
    refreshProducts,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export { ProductsContext };
