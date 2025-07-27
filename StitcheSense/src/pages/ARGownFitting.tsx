import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router';

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
  const [isARActive, setIsARActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [measurements, setMeasurements] = useState(userMeasurements);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const toggleAR = () => {
    setIsARActive(!isARActive);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setIsProcessing(true);
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Simulate AI measurement processing
        setTimeout(() => {
          setMeasurements({
            bust: 34 + Math.random() * 4,
            waist: 26 + Math.random() * 4,
            hips: 36 + Math.random() * 4,
            height: 64 + Math.random() * 8
          });
          setIsProcessing(false);
        }, 2000);
        
        console.log('Photo captured for fitting analysis');
      }
    }
  };

  return (
    <div className="ar-gown-fitting-page min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 font-['Tinos']">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-8 text-gray-800">AR Gown Fitting</h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Experience the future of gown fitting with augmented reality. Try on gowns virtually 
            and see how they look with your exact measurements in real-time.
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex text-gray-500 text-sm">
            <Link to="/gowns" className="hover:text-purple-500">Gowns</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">AR Fitting</span>
          </nav>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Camera Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Virtual Try-On</h2>
            
            <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-96 object-cover"
              />
              
              {isARActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Simple AR Overlay */}
                  <div className="relative">
                    <div className="w-48 h-64 border-4 border-purple-500 border-opacity-70 rounded-lg bg-purple-200 bg-opacity-30 flex items-center justify-center">
                      <div className="text-center text-purple-700">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-sm font-semibold">Gown Preview</p>
                      </div>
                    </div>
                    {/* Measurement Points */}
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}

              {!cameraStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600">Camera loading...</p>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg font-semibold">Processing measurements...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={toggleAR}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  isARActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isARActive ? 'Stop AR Try-On' : 'Start AR Try-On'}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={capturePhoto}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md"
                >
                  {isProcessing ? 'Processing...' : 'Capture & Measure'}
                </button>
                <button
                  onClick={() => setMeasurements(undefined)}
                  className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:bg-gray-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Measurements Panel */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Your Measurements</h3>
              
              {measurements ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Bust:</span>
                    <span className="text-xl font-bold text-purple-600">{measurements.bust.toFixed(1)}"</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Waist:</span>
                    <span className="text-xl font-bold text-purple-600">{measurements.waist.toFixed(1)}"</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Hips:</span>
                    <span className="text-xl font-bold text-purple-600">{measurements.hips.toFixed(1)}"</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-medium text-gray-700">Height:</span>
                    <span className="text-xl font-bold text-purple-600">{measurements.height.toFixed(1)}"</span>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-green-700">Measurements Complete</span>
                    </div>
                    <p className="text-sm text-green-600">Your measurements have been captured and saved for gown fitting.</p>
                  </div>

                  {/* Size Recommendations */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-700 mb-2">Recommended Sizes</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <p>Wedding Gowns: Size 8-10</p>
                      <p>Debut Gowns: Size 8</p>
                      <p>Modern Gowns: Size M-L</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">
                    No measurements available. Capture a photo to get your AI-powered measurements.
                  </p>
                  <Link 
                    to="/ai-measurement"
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Try AI Body Measurement →
                  </Link>
                </div>
              )}
            </div>

            {/* Fitting Options */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h4 className="text-xl font-bold mb-4 text-gray-800">Fitting Options</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-purple-600" defaultChecked />
                  <span className="text-gray-700">Show size recommendations</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-purple-600" defaultChecked />
                  <span className="text-gray-700">Display fit analysis</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-purple-600" />
                  <span className="text-gray-700">Enable pose detection</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-purple-600" />
                  <span className="text-gray-700">Save fitting session</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* AR Features */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold mb-8 text-gray-800 text-center">AR Fitting Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-800">Virtual Try-On</h4>
              <p className="text-gray-600">
                See how gowns look on you in real-time with advanced AR overlay technology.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-800">AI Measurements</h4>
              <p className="text-gray-600">
                Get precise body measurements automatically detected by our AI technology.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-800">Fit Analysis</h4>
              <p className="text-gray-600">
                Receive detailed fitting recommendations and size suggestions for perfect fit.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Order Your Perfect Gown?</h2>
          <p className="text-xl mb-8 opacity-90">
            Use your AR fitting results to order a custom gown that fits perfectly.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link 
              to="/gowns"
              className="inline-block bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300 no-underline"
            >
              Browse Gowns
            </Link>
            <Link 
              to="/ai-measurement"
              className="inline-block bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-purple-600 transition-colors duration-300 no-underline"
            >
              Get AI Measurements
            </Link>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ARGownFitting;