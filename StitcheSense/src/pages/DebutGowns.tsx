import Navigation from "../components/Navigation";
// Import debut gown images
import debutGown1 from "../assets/Gown-imgs/Debut-Gowns/image1.png";
import debutGown2 from "../assets/Gown-imgs/Debut-Gowns/image2.png";
import debutGown3 from "../assets/Gown-imgs/Debut-Gowns/image3.png";
import debutGown4 from "../assets/Gown-imgs/Debut-Gowns/image4.png";
import debutGown5 from "../assets/Gown-imgs/Debut-Gowns/image5.png";
import debutGown6 from "../assets/Gown-imgs/Debut-Gowns/image6.png";

function DebutGowns() {
  const debutGowns = [
    { id: 1, name: "Princess Dreams", description: "Perfect for your 18th birthday celebration with elegant details", image: debutGown1 },
    { id: 2, name: "Fairy Tale", description: "Magical ball gown that makes you feel like royalty", image: debutGown2 },
    { id: 3, name: "Graceful Elegance", description: "Sophisticated design with delicate embellishments", image: debutGown3 },
    { id: 4, name: "Royal Beauty", description: "Stunning silhouette with intricate beadwork", image: debutGown4 },
    { id: 5, name: "Enchanted Evening", description: "Dreamy gown perfect for your special debut night", image: debutGown5 },
    { id: 6, name: "Timeless Grace", description: "Classic design with modern touches", image: debutGown6 },
  ];

  return (
    <div className="debut-gowns-page min-h-screen bg-white font-['Tinos']">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-8 text-gray-800">Debut Gowns Collection</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Celebrate your coming of age with our stunning debut gown collection. 
            Each gown is designed to make your 18th birthday celebration truly magical and unforgettable.
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex text-gray-500 text-sm">
            <a href="/gowns" className="hover:text-pink-500">Gowns</a>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Debut Gowns</span>
          </nav>
        </div>

        {/* Gowns Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {debutGowns.map((gown) => (
            <div key={gown.id} className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="relative h-96 overflow-hidden">
                <img 
                  src={gown.image} 
                  alt={gown.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-pink-500 hover:text-white">
                    View Details
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800">{gown.name}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{gown.description}</p>
                <div className="flex justify-between items-center">
                  <button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:from-pink-600 hover:to-pink-700 hover:shadow-md">
                    Try On
                  </button>
                  <button className="border border-pink-500 text-pink-500 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-pink-500 hover:text-white">
                    Add to Wishlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready for Your Debut?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Make your 18th birthday celebration perfect with our AI measurement technology and expert styling consultation.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:from-pink-600 hover:to-pink-700 hover:shadow-lg">
              Get AI Measurements
            </button>
            <button className="border-2 border-pink-500 text-pink-500 px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:bg-pink-500 hover:text-white">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebutGowns
