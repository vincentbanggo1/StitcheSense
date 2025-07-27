import Navigation from "../components/Navigation";
import { useProducts } from "../hooks/useProducts";
import { Link } from "react-router";
import type { ProductImage } from "../services/api";
// Import images
import heroImage from "../assets/Gown-imgs/images/image.png";
import galleryImage1 from "../assets/Gown-imgs/images/image1.png";
import galleryImage2 from "../assets/Gown-imgs/images/image2.png";
import galleryImage3 from "../assets/Gown-imgs/images/image3.png";

function Home() {
  const { featuredProducts, loading } = useProducts();
  
  // Helper function to convert Base64 to data URL
  const getImageDataUrl = (image: ProductImage): string => {
    // Check if data already includes data URL prefix
    if (image.data.startsWith('data:')) {
      return image.data;
    }
    return `data:${image.content_type};base64,${image.data}`;
  };
  
  return (
    <div className="home-page min-h-screen bg-white font-['Tinos']">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative flex justify-center items-center h-screen w-full">
        <img 
          className="w-full h-full object-cover" 
          src={heroImage} 
          alt="Model" 
        />
        <div className="absolute top-1/2 left-1/5 transform -translate-x-1/2 -translate-y-1/2 text-white">
          <h1 className="text-4xl font-bold mb-4 ml-[40%]">Fit and Find</h1>
          <h1 className="text-4xl font-bold mb-4 ml-[35%]">Your Own Gown!</h1>
          <p className="text-xl mb-5">Explore our curated collection of stylish gowns tailored to your unique taste.</p>
          <button className="px-16 py-3 bg-[#255F38] text-white border-none rounded-md text-base font-medium cursor-pointer transition-all duration-300 shadow-lg ml-[40%] hover:bg-[#1F7D53] hover:scale-110">
            Fit Now
          </button>
        </div>
      </div>

      {/* Works Section */}
      <div className="text-center my-20">
        <h2 className="text-3xl font-bold mb-8">Explore Our Works</h2>
        
        {/* Image Gallery */}
        <div className="flex justify-around mt-20">
          <div className="flex flex-col items-center">
            <img 
              className="rounded-lg h-[500px] w-[340px] object-cover mb-4" 
              src={galleryImage1} 
              alt="Gown Style 1" 
            />
            <h3 className="text-lg font-semibold">Classic Elegance</h3>
          </div>
          <div className="flex flex-col items-center">
            <img 
              className="rounded-lg h-[500px] w-[340px] object-cover mb-4" 
              src={galleryImage2} 
              alt="Gown Style 2" 
            />
            <h3 className="text-lg font-semibold">Modern Romance</h3>
          </div>
          <div className="flex flex-col items-center">
            <img 
              className="rounded-lg h-[500px] w-[340px] object-cover mb-4" 
              src={galleryImage3} 
              alt="Gown Style 3" 
            />
            <h3 className="text-lg font-semibold">Timeless Beauty</h3>
          </div>
        </div>

        {/* Featured Products Section */}
        {!loading && featuredProducts.length > 0 && (
          <div className="mt-20 max-w-7xl mx-auto px-8">
            <h2 className="text-3xl font-bold mb-8">Featured Gowns</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.slice(0, 3).map((product) => (
                <div key={product._id} className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={product.images && product.images.length > 0 
                        ? (() => {
                            try {
                              const imageToUse = product.images.find(img => img.is_primary) || product.images[0];
                              const imageUrl = getImageDataUrl(imageToUse);
                              return (imageUrl && imageUrl.length > 50) ? imageUrl : galleryImage1;
                            } catch (error) {
                              console.error('Error processing image:', error);
                              return galleryImage1;
                            }
                          })()
                        : galleryImage1
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{product.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-purple-600">${product.price}</span>
                      <Link 
                        to={`/gowns/${product.category}`}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:from-purple-600 hover:to-purple-700 hover:shadow-md no-underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link 
                to="/gowns"
                className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:from-purple-600 hover:to-purple-700 hover:shadow-lg no-underline"
              >
                View All Gowns
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
