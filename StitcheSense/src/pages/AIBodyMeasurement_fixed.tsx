import Navigation from "../components/Navigation";
import RealtimeMeasurement from "../components/RealtimeMeasurement";
import { useState } from "react";

function AIBodyMeasurement() {
  const [mode, setMode] = useState<'upload' | 'realtime'>('realtime');

  return (
    <div className="ai-measurement-page min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 font-['Tinos']">
      <Navigation />
      
      {/* Mode Toggle */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-2 shadow-lg">
            <button
              onClick={() => setMode('realtime')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                mode === 'realtime'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-500'
              }`}
            >
              🎥 Real-Time Camera
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                mode === 'upload'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-500'
              }`}
            >
              📸 Upload Photo
            </button>
          </div>
        </div>
      </div>
      
      {mode === 'realtime' ? (
        <RealtimeMeasurement />
      ) : (
        <div className="max-w-7xl mx-auto px-8 py-16">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-8 text-gray-800">AI Body Measurement</h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Upload a photo to get accurate body measurements using our AI technology.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Camera Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Photo Upload Interface</h2>
              
              <div className="relative bg-gray-100 rounded-xl h-96 mb-6 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">Upload photo interface will be here</p>
                  <p className="text-sm text-gray-500">Please select an image to upload</p>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-purple-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-105">
                  Upload Photo for Measurement
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:bg-gray-200">
                    Test Camera
                  </button>
                  <button className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:bg-gray-200">
                    View History
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mt-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{width: '0%'}}></div>
                </div>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">How It Works</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Position Yourself</h4>
                      <p className="text-gray-600">Stand 6 feet away from your camera in good lighting, wearing fitted clothing.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Upload Photo</h4>
                      <p className="text-gray-600">Take or upload a clear full-body photo showing your complete silhouette.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">AI Processing</h4>
                      <p className="text-gray-600">Our AI analyzes your photo and calculates precise body measurements.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Review Results</h4>
                      <p className="text-gray-600">Confirm your measurements and save them for your custom gown design.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Pro Tips for Best Results
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Ensure bright, even lighting without shadows</li>
                  <li>• Wear form-fitting clothes (leggings and fitted top work best)</li>
                  <li>• Make sure your full body is visible in the camera frame</li>
                  <li>• Stand on a plain background (avoid patterns or clutter)</li>
                  <li>• Keep your phone or camera stable during measurement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIBodyMeasurement;
