import Navigation from "../components/Navigation";
import { useState } from "react";
// Import about page images from images2 folder
import heroImage from "../assets/Gown-imgs/images2/image1.png";
import workshopImage from "../assets/Gown-imgs/images2/image2.png";
import gownDetailImage from "../assets/Gown-imgs/images2/image3.png";
import qualityImage from "../assets/Gown-imgs/images2/image4.png";
import bridalImage from "../assets/Gown-imgs/images2/image5.png";
import map1 from "../assets/Gown-imgs/images2/image6.png";
import map2 from "../assets/Gown-imgs/images2/image7.png";


function About() {
  // Add the missing state for the contact form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  // Add the missing event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
    alert('Thank you for your message! We will get back to you soon.');
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      message: ''
    });
  };

  return (
    <div className="about-page min-h-screen bg-white font-['Tinos']">
      <Navigation />
      
        {/* Hero Section */}
      <div className="relative flex justify-center items-center w-full h-screen">
        <img 
          className="w-full h-full object-cover" 
          src={heroImage} 
          alt="Elegant Wedding Gown Model" 
        />
        <div className="absolute top-1/2 left-3/5 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <h1 className="text-6xl font-bold mb-4">Welcome to StitchSense</h1>
          <p className="text-2xl">A collaboration with Jo Rubio Atelier</p>
        </div>
      </div>

      {/* About Section */}
      <div className="flex justify-center text-center my-12 px-8">
        <h2 className="text-5xl font-normal leading-relaxed max-w-6xl">
          We've partnered with Jo Rubio Atelier to bring you the future of garment fitting.
          Our AI-powered body measurement technology ensures exceptional accuracy and 3D garment 
          fitting, while Jo Rubio's expert craftsmanship guarantees a garment that is both beautiful 
          and ethically made. We believe in transparency, 
          showcasing the seamless integration of technology and artistry in every piece
        </h2>
      </div>

      {/* Workshop Section */}
      <div className="flex w-full bg-stone-200">
        <img 
          className="w-1/2 h-screen object-cover" 
          src={workshopImage} 
          alt="Workshop Interior" 
        />
        <div className="w-1/2 flex flex-col justify-center px-8 ml-8">
          <p className="text-xl mb-3">OUR WORKSHOP</p>
          <h2 className="text-4xl font-normal mb-5">Our ethical approach.</h2>
          <p className="text-xl leading-relaxed">
            We collaborate with the skilled artisans at Jo Rubio Atelier, where each garment is meticulously crafted by hand. We build strong, personal relationships with 
            the atelier's team, ensuring that every piece is created in an environment that values fair practices and exceptional quality. We believe in transparency, 
            sharing the story behind each garment and the dedicated individuals who bring it to life
          </p>
        </div>
      </div>

      {/* Image Break */}
      <div className="w-full h-160">
        <img 
          className="w-full h-full object-cover" 
          src={gownDetailImage} 
          alt="Elegant Gown Detail" 
        />
      </div>

      {/* Quality Section */}
      <div className="flex w-full bg-stone-200">
        <div className="w-1/2 flex flex-col justify-center px-8 ml-8">
          <p className="text-xl mb-3">OUR QUALITY</p>
          <h2 className="text-4xl font-normal mb-5">Designed to last.</h2>
          <p className="text-xl leading-relaxed">
            We don't chase trends. We partner with Jo Rubio Atelier to create bespoke garments that are designed
            to be cherished for a lifetime. By utilizing the finest materials and expert craftsmanship, we ensure that your investment
            in a StitchSense garment is an investment in enduring style and quality.
          </p>
        </div>
        <img 
          className="w-1/2 h-screen object-cover" 
          src={qualityImage} 
          alt="Quality Craftsmanship" 
        />
      </div>

      {/* Another Image Break */}
      <div className="w-full h-160">
        <img 
          className="w-full h-full object-cover" 
          src={bridalImage} 
          alt="Bridal Collection" 
        />
      </div>

      {/* Store Locations */}
      <div className="w-full mt-20 px-8">
        <h1 className="text-4xl font-normal text-center mb-8">Where are our Stores?</h1>
        <div className="flex justify-around mb-8">
          <div className="w-187 h-80rounded-lg overflow-hidden shadow-lg">
            <img 
              src={map1} 
              alt="Map of Meycauayan, Bulacan" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-187 h-80 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={map2} 
              alt="Map of Makati, Philippines" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex justify-around text-center">
          <div className="flex items-center justify-center space-x-2">
            <p className="max-w-80">924 MacArthur Hwy, Meycauayan, 3020 Bulacan</p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <p className="max-w-80">Unit 4050 E Bigasan St. Palanan, Makati, Philippines, 1235</p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="flex justify-center my-16">
        <div className="bg-white p-12 rounded-lg shadow-lg w-full max-w-2xl mx-8">
          <h1 className="text-4xl text-gray-800 mb-8">CONTACT US</h1>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-gray-700 font-bold">Full Name</p>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full p-3 border border-gray-300 rounded-md text-base focus:border-blue-500 focus:outline-none transition-colors duration-300"
              />
            </div>
            <div>
              <p className="mb-2 text-gray-700 font-bold">Email</p>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-md text-base focus:border-blue-500 focus:outline-none transition-colors duration-300"
              />
            </div>
            <div>
              <p className="mb-2 text-gray-700 font-bold">Phone number</p>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full p-3 border border-gray-300 rounded-md text-base focus:border-blue-500 focus:outline-none transition-colors duration-300"
              />
            </div>
            <div>
              <p className="mb-2 text-gray-700 font-bold">Message</p>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter your message"
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-md text-base focus:border-blue-500 focus:outline-none transition-colors duration-300 resize-y min-h-32"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white p-3 rounded-md text-lg cursor-pointer transition-all duration-300 shadow-md hover:bg-blue-700 hover:scale-105 mt-4"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
