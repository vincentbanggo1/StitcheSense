import Navigation from "../components/Navigation";
import { useProducts } from "../hooks/useProducts";
import type { Product, ProductImage } from "../services/api";
// Import fallback images for products that don't have images
import weddingGown1 from "../assets/Gown-imgs/image1.png";
import weddingGown2 from "../assets/Gown-imgs/image2.png";
import weddingGown3 from "../assets/Gown-imgs/image3.png";
import weddingGown4 from "../assets/Gown-imgs/image4.png";
import weddingGown5 from "../assets/Gown-imgs/image5.png";
import weddingGown6 from "../assets/Gown-imgs/image6.png";

function WeddingGowns() {
  const { getProductsByCategory, loading, error } = useProducts();
  
  // Get wedding gowns from API
  const weddingGowns = getProductsByCategory("wedding");
  
  // Fallback images array for products without images
  const fallbackImages = [weddingGown1, weddingGown2, weddingGown3, weddingGown4, weddingGown5, weddingGown6];
  
  // Helper function to convert Base64 to data URL
  const getImageDataUrl = (image: ProductImage): string => {
    // Check if data already includes data URL prefix
    if (image.data.startsWith('data:')) {
      return image.data;
    }
    return `data:${image.content_type};base64,${image.data}`;
  };
  
  // Function to get image URL or fallback
  const getImageUrl = (product: Product, index: number) => {
    if (product.images && product.images.length > 0) {
      // Use the primary image or first available image from backend
      const primaryImage = product.images.find(img => img.is_primary);
      const imageToUse = primaryImage || product.images[0];
      try {
        const imageUrl = getImageDataUrl(imageToUse);
        if (imageUrl && imageUrl.length > 50) { // Basic validation that we have actual image data
          return imageUrl;
        }
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
    return fallbackImages[index % fallbackImages.length];
  };

  if (loading) {
    return (
      <div className="wedding-gowns-page min-h-screen bg-white font-['Tinos']">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading wedding gowns...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wedding-gowns-page min-h-screen bg-white font-['Tinos']">
        <Navigation />
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Gowns</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wedding-gowns-page min-h-screen bg-white font-['Tinos']">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-8 text-gray-800">Wedding Gowns Collection</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Make your dream wedding a reality with our exquisite collection of wedding gowns. 
            Each dress is crafted with love and attention to detail, ensuring you look and feel perfect on your special day.
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex text-gray-500 text-sm">
            <a href="/gowns" className="hover:text-purple-500">Gowns</a>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Wedding Gowns</span>
          </nav>
        </div>

        {weddingGowns.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-600 mb-4">No Wedding Gowns Available</h3>
            <p className="text-gray-500">Please check back later for new arrivals.</p>
          </div>
        ) : (
          <>
            {/* Gowns Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {weddingGowns.map((gown, index) => (
                <div key={gown._id} className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="relative h-96 overflow-hidden">
                    <img 
                      src={getImageUrl(gown, index)} 
                      alt={gown.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-purple-500 hover:text-white">
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{gown.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{gown.description}</p>
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-purple-600">${gown.price}</span>
                      <span className="text-sm text-gray-500 ml-2">• {gown.fabric}</span>
                    </div>
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">Available Sizes: </span>
                      <div className="flex gap-1 mt-1">
                        {gown.available_sizes.map((size) => (
                          <span key={size} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:from-purple-600 hover:to-purple-700 hover:shadow-md">
                        Try On
                      </button>
                      <button className="border border-purple-500 text-purple-500 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-purple-500 hover:text-white">
                        Add to Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Found Your Dream Dress?</h2>
              <p className="text-lg text-gray-600 mb-6">
                Get the perfect fit with our AI measurement technology and schedule a consultation with our experts.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:from-purple-600 hover:to-purple-700 hover:shadow-lg">
                  Get AI Measurements
                </button>
                <button className="border-2 border-purple-500 text-purple-500 px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:bg-purple-500 hover:text-white">
                  Schedule Consultation
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WeddingGowns
