import React, { useState } from 'react';
import { Link } from 'react-router';
import ARTest from '../components/ARComponents/ARTest';

interface ARGownFittingProps {
  gownModel?: string;
  userMeasurements?: {
    bust: number;
    waist: number;
    hips: number;
    height: number;
  };
}

const ARGownFitting: React.FC<ARGownFittingProps> = ({ 
  gownModel, 
  userMeasurements 
}) => {
  const [showARTest, setShowARTest] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-purple-600">
            StitcheSense
          </Link>
          <div className="flex space-x-6">
            <Link to="/home" className="text-gray-600 hover:text-purple-600">
              Home
            </Link>
            <Link to="/gowns" className="text-gray-600 hover:text-purple-600">
              Gowns
            </Link>
            <Link to="/ai-measurement" className="text-gray-600 hover:text-purple-600">
              AI Measurement
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AR Gown Fitting Experience
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Try on our beautiful gowns virtually using advanced AR technology. 
            See how different styles look on you in real-time with precise fitting and measurements.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">👗</div>
            <h3 className="text-xl font-semibold mb-2">Virtual Try-On</h3>
            <p className="text-gray-600">
              Experience our gowns in real-time with advanced AR technology
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">📏</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Measurements</h3>
            <p className="text-gray-600">
              Get accurate body measurements while trying on different styles
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">Multiple Styles</h3>
            <p className="text-gray-600">
              Choose from wedding dresses, evening gowns, cocktail dresses and more
            </p>
          </div>
        </div>

        {/* Current User Measurements */}
        {userMeasurements && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Measurements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userMeasurements.bust}"</div>
                <div className="text-sm text-gray-600">Bust</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userMeasurements.waist}"</div>
                <div className="text-sm text-gray-600">Waist</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userMeasurements.hips}"</div>
                <div className="text-sm text-gray-600">Hips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userMeasurements.height}"</div>
                <div className="text-sm text-gray-600">Height</div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Gown Model */}
        {gownModel && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Selected Gown</h2>
            <p className="text-gray-600">Gown Model: <span className="font-medium">{gownModel}</span></p>
          </div>
        )}

        {/* Action Section */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Ready to Start Your AR Fitting?</h2>
            <p className="text-gray-600 mb-6">
              Click below to begin your virtual fitting experience. Make sure you have good lighting and stand about 6 feet from your camera.
            </p>
            
            <button
              onClick={() => setShowARTest(true)}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors mr-4"
            >
              Start AR Fitting
            </button>
            
            <Link
              to="/ai-measurement"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors inline-block"
            >
              Get Measurements First
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">How to Use AR Fitting</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Before You Start:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Ensure good lighting in your room</li>
                <li>Stand 6-8 feet away from your camera</li>
                <li>Wear fitted clothing for best results</li>
                <li>Make sure your full body is visible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">During the Session:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Stand still for accurate pose detection</li>
                <li>Try different dress styles by clicking templates</li>
                <li>View real-time measurements</li>
                <li>Take screenshots of your favorites</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AR Test Modal */}
      {showARTest && (
        <ARTest onClose={() => setShowARTest(false)} />
      )}
    </div>
  );
};

export default ARGownFitting;