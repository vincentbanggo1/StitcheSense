import Navigation from "../components/Navigation";
// Import modern gown images
import modernGown1 from "../assets/Gown-imgs/Modern-Gowns/image1.png";
import modernGown2 from "../assets/Gown-imgs/Modern-Gowns/image2.png";
import modernGown3 from "../assets/Gown-imgs/Modern-Gowns/image3.png";
import modernGown4 from "../assets/Gown-imgs/Modern-Gowns/image4.png";
import modernGown5 from "../assets/Gown-imgs/Modern-Gowns/image5.png";
import modernGown6 from "../assets/Gown-imgs/Modern-Gowns/image6.png";

function ModernGowns() {
  const modernGowns = [
    { id: 1, name: "Contemporary Chic", description: "Sleek modern design for today's fashion-forward woman", image: modernGown1 },
    { id: 2, name: "Minimalist Beauty", description: "Clean lines and sophisticated simplicity", image: modernGown2 },
    { id: 3, name: "Urban Elegance", description: "Perfect blend of comfort and style", image: modernGown3 },
    { id: 4, name: "Designer Statement", description: "Bold contemporary design that makes an impression", image: modernGown4 },
    { id: 5, name: "Artistic Expression", description: "Unique modern silhouette with artistic flair", image: modernGown5 },
    { id: 6, name: "Future Classic", description: "Modern design destined to become timeless", image: modernGown6 },
  ];

  return (
    <div className="modern-gowns-page min-h-screen bg-white font-['Tinos']">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-8 text-gray-800">Modern Gowns Collection</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Embrace contemporary elegance with our modern gown collection. 
            These designs feature cutting-edge style and sophisticated details for the fashion-forward woman.
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex text-gray-500 text-sm">
            <a href="/gowns" className="hover:text-teal-500">Gowns</a>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Modern Gowns</span>
          </nav>
        </div>

        {/* Gowns Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {modernGowns.map((gown) => (
            <div key={gown.id} className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="relative h-96 overflow-hidden">
                <img 
                  src={gown.image} 
                  alt={gown.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-teal-500 hover:text-white">
                    View Details
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800">{gown.name}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{gown.description}</p>
                <div className="flex justify-between items-center">
                  <button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:from-teal-600 hover:to-teal-700 hover:shadow-md">
                    Try On
                  </button>
                  <button className="border border-teal-500 text-teal-500 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-teal-500 hover:text-white">
                    Add to Wishlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Discover Your Modern Style</h2>
          <p className="text-lg text-gray-600 mb-6">
            Experience the perfect fit with our innovative AI measurement technology and contemporary design consultation.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:from-teal-600 hover:to-teal-700 hover:shadow-lg">
              Get AI Measurements
            </button>
            <button className="border-2 border-teal-500 text-teal-500 px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:bg-teal-500 hover:text-white">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernGowns
