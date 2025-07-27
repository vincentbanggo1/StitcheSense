import Navigation from "../components/Navigation";
// Import about page images
import aboutImage from "../assets/Gown-imgs/images/image1.png";

function About() {
  return (
    <div className="about-page min-h-screen bg-white font-['Tinos']">
      <Navigation />
      
      <div className="about-content max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-8 text-gray-800">About StitchSense</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We create beautiful custom gowns for your special occasions using cutting-edge AI technology 
            to ensure the perfect fit every time.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              At StitchSense, we believe every woman deserves to feel confident and beautiful 
              in a gown that fits her perfectly. Our mission is to revolutionize the way custom 
              gowns are designed and fitted using innovative AI-powered body measurement technology.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Whether it's your wedding day, debut, or any special celebration, we're here to 
              make your dream gown a reality with precision, elegance, and unmatched quality.
            </p>
          </div>
          <div className="relative">
            <img 
              src={aboutImage} 
              alt="Beautiful gown" 
              className="rounded-lg shadow-xl w-full h-96 object-cover"
            />
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">👗</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Custom Gowns</h3>
              <p className="text-gray-600">
                Handcrafted gowns designed specifically for your body type and style preferences.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📏</span>
              </div>
              <h3 className="text-xl font-bold mb-4">AI Measurements</h3>
              <p className="text-gray-600">
                Revolutionary AI technology that captures your exact measurements for the perfect fit.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Style Consultation</h3>
              <p className="text-gray-600">
                Expert style advice to help you choose the perfect design for your special occasion.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">Why Choose StitchSense?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Quality</h3>
              <p className="text-gray-600">Premium fabrics and meticulous craftsmanship</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Innovation</h3>
              <p className="text-gray-600">AI-powered fitting for unparalleled accuracy</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Personalization</h3>
              <p className="text-gray-600">Every gown is uniquely tailored to you</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Experience</h3>
              <p className="text-gray-600">Years of expertise in gown design and fitting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
