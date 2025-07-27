import axios from 'axios';

// API Configuration - Use proxy in development, full URL in production
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Redirect to login (you can use navigate hook in components)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total_users: number;
  total_products: number;
  active_products: number;
  featured_products: number;
  users_by_role: Record<string, number>;
  products_by_category: Record<string, number>;
}

export interface AdminDashboardData {
  stats: AdminStats;
  recent_users: User[];
  featured_products: Product[];
  low_stock_products: Product[];
}

export interface ProductCreateAdmin {
  name: string;
  description: string;
  category: string;
  price: number;
  available_sizes: string[];
  fabric: string;
  color: string;
  stock_quantity?: number;
  is_featured?: boolean;
  is_active?: boolean;
  care_instructions?: string;
  images?: ProductImage[];
}

export interface ProductUpdateAdmin {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  available_sizes?: string[];
  fabric?: string;
  color?: string;
  stock_quantity?: number;
  is_featured?: boolean;
  is_active?: boolean;
  care_instructions?: string;
  images?: ProductImage[];
}

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available_sizes: string[];
  images: ProductImage[];
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  fabric: string;
  color: string;
  care_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  data: string;  // Base64 encoded image data
  content_type: string;  // MIME type
  filename?: string;
  alt_text?: string;
  is_primary: boolean;
}

// API Service Class
class ApiService {
  // Authentication
  async register(userData: UserCreate): Promise<User> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials: UserLogin): Promise<LoginResponse> {
    // FastAPI expects form data for OAuth2PasswordRequestForm
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;
    
    // Store token and user data
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put('/auth/me', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  // Products
  async getProducts(params?: {
    category?: string;
    featured?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<Product[]> {
    const response = await api.get('/products/', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await api.get('/products/featured');
    return response.data;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  }

  // Admin Methods
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await api.get('/admin/dashboard');
    return response.data;
  }

  async getAllUsersAdmin(skip = 0, limit = 50): Promise<User[]> {
    const response = await api.get('/admin/users', { params: { skip, limit } });
    return response.data;
  }

  async updateUserAdmin(email: string, userData: Partial<User>): Promise<User> {
    const response = await api.put(`/admin/users/${email}`, userData);
    return response.data;
  }

  async deleteUserAdmin(email: string): Promise<void> {
    await api.delete(`/admin/users/${email}`);
  }

  async createProductAdmin(productData: ProductCreateAdmin): Promise<Product> {
    const response = await api.post('/admin/products', productData);
    return response.data;
  }

  async updateProductAdmin(id: string, productData: ProductUpdateAdmin): Promise<Product> {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
  }

  async deleteProductAdmin(id: string): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  }

  async toggleProductFeatured(id: string): Promise<Product> {
    const response = await api.patch(`/admin/products/${id}/toggle-featured`);
    return response.data;
  }

  async toggleProductActive(id: string): Promise<Product> {
    const response = await api.patch(`/admin/products/${id}/toggle-active`);
    return response.data;
  }

  // Enhanced Admin Product Management
  async getAllProductsAdmin(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    search?: string;
    is_active?: boolean;
    is_featured?: boolean;
  }): Promise<Product[]> {
    const response = await api.get('/admin/products', { params });
    return response.data;
  }

  async getProductByIdAdmin(id: string): Promise<Product> {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  }

  async uploadProductImage(file: File): Promise<{
    message: string;
    filename: string;
    data: string;  // Base64 data
    content_type: string;
    size: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/admin/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteProductImage(filename: string): Promise<{ message: string }> {
    const response = await api.delete(`/admin/images/${filename}`);
    return response.data;
  }

  async bulkUpdateProducts(productIds: string[], updates: Record<string, unknown>): Promise<{
    message: string;
    updated_count: number;
  }> {
    const response = await api.post('/admin/products/bulk-update', {
      product_ids: productIds,
      updates,
    });
    return response.data;
  }

  async bulkDeleteProducts(productIds: string[]): Promise<{
    message: string;
    deleted_count: number;
  }> {
    const response = await api.post('/admin/products/bulk-delete', {
      product_ids: productIds,
    });
    return response.data;
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default api;
