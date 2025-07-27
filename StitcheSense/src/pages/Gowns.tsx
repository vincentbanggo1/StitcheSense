import { Link } from "react-router";
import Navigation from "../components/Navigation";
// Import category images
import weddingGownImage from "../assets/Gown-imgs/image1.png";
import debutGownImage from "../assets/Gown-imgs/Debut-Gowns/image1.png";
import modernGownImage from "../assets/Gown-imgs/Modern-Gowns/image1.png";

function Gowns() {
  return (
    <div className="gowns-page min-h-screen bg-white font-['Tinos']">
      <Navigation />
      
      <div className="gowns-content max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-8 text-gray-800">Our Gown Collections</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our exquisite collection of custom-made gowns, perfect for every special occasion.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Wedding Gowns */}
          <div className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="relative h-80 overflow-hidden">
              <img 
                src={weddingGownImage} 
                alt="Wedding Gowns" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Wedding Gowns</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Beautiful wedding dresses designed to make your special day unforgettable. 
                From classic elegance to modern sophistication.
              </p>
              <Link 
                to="/gowns/wedding" 
                className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold no-underline transition-all duration-300 hover:from-purple-600 hover:to-purple-700 hover:shadow-lg"
              >
                View Collection
              </Link>
            </div>
          </div>
          
          {/* Debut Gowns */}
          <div className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="relative h-80 overflow-hidden">
              <img 
                src={debutGownImage} 
                alt="Debut Gowns" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Debut Gowns</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Elegant gowns for debut celebrations that capture the magic of coming-of-age. 
                Perfect for your 18th birthday milestone.
              </p>
              <Link 
                to="/gowns/debut" 
                className="inline-block bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold no-underline transition-all duration-300 hover:from-pink-600 hover:to-pink-700 hover:shadow-lg"
              >
                View Collection
              </Link>
            </div>
          </div>
          
          {/* Modern Gowns */}
          <div className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="relative h-80 overflow-hidden">
              <img 
                src={modernGownImage} 
                alt="Modern Gowns" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Modern Gowns</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Contemporary designs for modern occasions. Sleek, stylish, and sophisticated 
                gowns for the fashion-forward woman.
              </p>
              <Link 
                to="/gowns/modern" 
                className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold no-underline transition-all duration-300 hover:from-teal-600 hover:to-teal-700 hover:shadow-lg"
              >
                View Collection
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready for Your Perfect Fit?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Experience our revolutionary AI body measurement technology for the most accurate fit.
          </p>
          <Link 
            to="/ai-measurement" 
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold no-underline transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg text-lg"
          >
            Try AI Measurement
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Gowns
