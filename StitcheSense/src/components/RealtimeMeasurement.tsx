import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Measurements {
  bust: number;
  waist: number;
  hips: number;
  height: number;
}

interface MeasurementData {
  type: string;
  measurements?: Measurements;
  confidence?: number;
  error?: string;
  message?: string;
  user_id?: string;
  timestamp: number;
}

const RealtimeMeasurement: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoRetryCount, setVideoRetryCount] = useState(0);
  
  const { user } = useAuth();

  // Debug log to confirm we're using the updated component
  console.log('🔄 RealtimeMeasurement component loaded at:', new Date().toISOString());

  const startCamera = useCallback(async () => {
    try {
      // Try different video constraints - start with basic ones
      let mediaStream;
      
      try {
        // First try with specific constraints
        console.log('📹 Trying with specific constraints...');
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
      } catch (err) {
        console.log('📹 Specific constraints failed, trying basic constraints...', err);
        // Fallback to basic video constraint
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
      
      if (videoRef.current && mediaStream) {
        console.log('📹 Setting up video with stream...');
        const video = videoRef.current;
        
        // Set stream and attributes
        video.srcObject = mediaStream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        
        setStream(mediaStream);
        
        // Add comprehensive event listeners
        video.addEventListener('loadstart', () => {
          console.log('📹 Video load started');
        });
        
        video.addEventListener('loadedmetadata', () => {
          console.log('📹 Video metadata loaded', {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState,
            duration: video.duration
          });
        });
        
        video.addEventListener('loadeddata', () => {
          console.log('📹 Video data loaded');
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setVideoReady(true);
          }
        });
        
        video.addEventListener('canplay', () => {
          console.log('📹 Video can play');
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setVideoReady(true);
          }
        });
        
        video.addEventListener('playing', () => {
          console.log('📹 Video is playing');
          setVideoReady(true);
        });
        
        video.addEventListener('error', (e) => {
          console.error('📹 Video error:', e);
        });
        
        // Force load and play
        console.log('📹 Forcing video load and play...');
        video.load();
        
        // Wait a bit then try to play
        setTimeout(async () => {
          try {
            await video.play();
            console.log('📹 Video.play() succeeded');
          } catch (playErr) {
            console.log('📹 Video.play() failed (normal for autoplay policy):', playErr);
            // Try clicking to start if needed
            console.log('📹 Video should still work for capture even without play()');
          }
        }, 500);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please ensure camera permissions are granted and try again.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setVideoReady(false);
    setVideoRetryCount(0);
  }, [stream]);

  const connectWebSocket = useCallback(() => {
    // Check if user is available and authenticated
    if (!user || !user.id) {
      console.error('❌ No authenticated user available for WebSocket connection');
      setError('Please log in to use real-time measurements');
      return;
    }
    
    const userId = user.id;
    
    // Connect directly to the FastAPI server instead of through Vite proxy
    const wsUrl = `ws://localhost:8000/api/measurements/realtime/${userId}`;
    
    console.log('🔌 CONNECTING TO:', wsUrl);
    console.log('👤 Authenticated User:', { id: user.id, email: user.email });
    console.log('📍 Current location:', window.location.href);
    console.log('⏰ Connection timestamp:', new Date().toISOString());
    
    // Clean up existing connection first
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setError('');
        
        // Send initial heartbeat to keep connection alive
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'heartbeat',
            timestamp: Date.now()
          }));
          console.log('💓 Initial heartbeat sent');
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: MeasurementData = JSON.parse(event.data);
          console.log('📥 Received data:', data);
          
          switch (data.type) {
            case 'measurement_update':
              if (data.measurements) {
                setMeasurements(data.measurements);
                setConfidence(data.confidence || 0);
                setError('');
                console.log('📊 Measurements updated:', data.measurements);
              }
              break;
            case 'measurement_error':
            case 'decode_error':
            case 'processing_error':
              setError(data.error || 'Processing error occurred');
              setMeasurements(null);
              console.log('⚠️ Error received:', data.error);
              break;
            case 'connection_established':
              console.log('🎉 Connection established:', data.message);
              setError('');
              break;
            case 'heartbeat':
            case 'ping':
              console.log('💓 Heartbeat/ping received');
              // Respond to ping
              if (data.type === 'ping' && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                  type: 'pong',
                  timestamp: Date.now()
                }));
              }
              break;
            case 'pong':
              console.log('🏓 Pong received');
              break;
            default:
              console.log('📩 Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect if the close was unexpected and we're still active
        if (isActive && event.code !== 1000) {  // 1000 is normal closure
          console.log('🔄 Attempting to reconnect in 3 seconds...');
          setTimeout(() => {
            if (isActive) {
              connectWebSocket();
            }
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        setError('Connection failed. Please check if the server is running and try again.');
      };
    } catch (err) {
      console.error('❌ Failed to create WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [user, isActive]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected'); // Normal closure
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const captureAndSendFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('❌ Frame capture failed: missing refs or WebSocket not open');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Check video readiness
    if (!ctx) {
      console.log('❌ No canvas context');
      return;
    }
    
    if (!videoReady) {
      console.log('❌ Video not marked as ready');
      return;
    }
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.log('❌ Video not ready, readyState:', video.readyState);
      return;
    }
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('❌ Video dimensions not available');
      return;
    }

    console.log('📸 Capturing frame from video:', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState,
      videoReady: videoReady
    });

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and send via WebSocket
    canvas.toBlob((blob) => {
      if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result && wsRef.current?.readyState === WebSocket.OPEN) {
            try {
              const base64Data = (reader.result as string);
              console.log('📤 Sending frame data:', {
                size: base64Data.length,
                type: 'frame'
              });
              
              wsRef.current.send(JSON.stringify({
                type: 'frame',
                image: base64Data,
                timestamp: Date.now()
              }));
            } catch (err) {
              console.error('Error sending frame:', err);
            }
          }
        };
        reader.readAsDataURL(blob);
      } else {
        console.log('❌ No blob created or WebSocket not open');
      }
    }, 'image/jpeg', 0.8);
  }, [videoReady]);

  const startMeasurement = useCallback(async () => {
    try {
      setError('');
      console.log('🚀 Starting measurement process...');
      
      // Start camera first
      await startCamera();
      console.log('📹 Camera started, waiting for video to be ready...');
      
      // Wait for camera to initialize and video to be ready
      setTimeout(async () => {
        // Connect WebSocket
        connectWebSocket();
        console.log('🔌 WebSocket connection initiated...');
        
        // Wait for WebSocket connection before starting frame capture
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            // Check if video is actually ready
            const video = videoRef.current;
            const isVideoActuallyReady = video && 
                                       video.readyState >= video.HAVE_ENOUGH_DATA && 
                                       video.videoWidth > 0 && 
                                       video.videoHeight > 0 &&
                                       videoReady;
                                       
            console.log('🔍 Video readiness check:', {
              videoExists: !!video,
              readyState: video?.readyState,
              videoWidth: video?.videoWidth,
              videoHeight: video?.videoHeight,
              videoReadyState: videoReady,
              isReady: isVideoActuallyReady
            });
            
            if (isVideoActuallyReady) {
              setIsActive(true);
              
              // Start capturing frames every 1000ms (1 FPS) - slower for testing
              intervalRef.current = window.setInterval(() => {
                console.log('⏰ Frame capture interval triggered');
                captureAndSendFrame();
              }, 1000);
              console.log('🎥 Started frame capture at 1 FPS');
            } else {
              console.log('❌ Video not ready yet, waiting longer...');
              setError('Video not ready. Please wait and try again.');
              
              // Try again after a longer delay
              setTimeout(() => {
                const retryReady = video && 
                                 video.readyState >= video.HAVE_ENOUGH_DATA && 
                                 video.videoWidth > 0 && 
                                 video.videoHeight > 0 &&
                                 videoReady;
                                 
                if (retryReady) {
                  setIsActive(true);
                  setError(''); // Clear error
                  intervalRef.current = window.setInterval(() => {
                    captureAndSendFrame();
                  }, 1000);
                  console.log('🎥 Started frame capture at 1 FPS (retry)');
                } else {
                  setError('Camera initialization failed. Please refresh and try again.');
                }
              }, 3000); // Longer retry delay
            }
          } else {
            setError('Failed to establish WebSocket connection');
            console.log('❌ WebSocket not ready:', wsRef.current?.readyState);
          }
        }, 2000); // Increased timeout for better connection stability
      }, 2000); // Increased timeout for camera initialization
      
    } catch (err) {
      console.error('Error starting measurement:', err);
      setError('Failed to start measurement');
    }
  }, [startCamera, connectWebSocket, captureAndSendFrame, videoReady]);

  const stopMeasurement = useCallback(() => {
    setIsActive(false);
    
    // Stop frame capture
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Disconnect WebSocket
    disconnectWebSocket();
    
    // Stop camera
    stopCamera();
    
    // Clear measurements
    setMeasurements(null);
    setConfidence(0);
    setError('');
    
    console.log('🛑 Measurement stopped');
  }, [disconnectWebSocket, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMeasurement();
    };
  }, [stopMeasurement]);

  // Monitor video readiness and retry if needed
  useEffect(() => {
    if (stream && videoRef.current && !videoReady && videoRetryCount < 5) {
      const video = videoRef.current;
      console.log('🔄 Monitoring video readiness, retry count:', videoRetryCount);
      
      const retryTimer = setTimeout(() => {
        if (video.readyState < video.HAVE_ENOUGH_DATA || video.videoWidth === 0) {
          console.log('🔄 Retrying video load...', {
            readyState: video.readyState,
            videoWidth: video.videoWidth,
            retryCount: videoRetryCount
          });
          
          video.load();
          setVideoRetryCount(prev => prev + 1);
        }
      }, 2000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [stream, videoReady, videoRetryCount]);

  // Format measurements for display
  const formatMeasurement = (value: number) => {
    return `${value.toFixed(1)} cm`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Real-time Body Measurements</h2>
        
        {/* Status indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg border-2 text-center font-medium ${
            isConnected 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="text-sm uppercase tracking-wide mb-1">WebSocket</div>
            <div className="text-lg">{isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
          </div>
          <div className={`p-4 rounded-lg border-2 text-center font-medium ${
            stream 
              ? 'bg-blue-50 border-blue-200 text-blue-800' 
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            <div className="text-sm uppercase tracking-wide mb-1">Camera</div>
            <div className="text-lg">{stream ? '📹 Active' : '📷 Inactive'}</div>
          </div>
          <div className={`p-4 rounded-lg border-2 text-center font-medium ${
            videoReady && (videoRef.current?.readyState ?? 0) >= 3 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="text-sm uppercase tracking-wide mb-1">Video Ready</div>
            <div className="text-lg">
              {videoReady && (videoRef.current?.readyState ?? 0) >= 3 ? '✅ Ready' : '⏳ Loading'}
            </div>
          </div>
          <div className={`p-4 rounded-lg border-2 text-center font-medium ${
            isActive 
              ? 'bg-purple-50 border-purple-200 text-purple-800' 
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            <div className="text-sm uppercase tracking-wide mb-1">Status</div>
            <div className="text-lg">{isActive ? '📊 Measuring' : '⏸️ Idle'}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          {!isActive ? (
            <>
              <button 
                onClick={startMeasurement}
                disabled={!user}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  !user 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {!user ? 'Please Log In' : 'Start Measurement'}
              </button>
              
              {/* Camera only button for testing */}
              <button 
                onClick={async () => {
                  console.log('🎥 Testing camera only...');
                  await startCamera();
                }}
                className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg"
              >
                Test Camera
              </button>
              
              {stream && (
                <>
                  <button 
                    onClick={() => {
                      console.log('🧪 Testing frame capture...');
                      
                      // Force a comprehensive check
                      const video = videoRef.current;
                      if (video) {
                        console.log('🔍 Manual video check:', {
                          videoExists: !!video,
                          readyState: video.readyState,
                          videoWidth: video.videoWidth,
                          videoHeight: video.videoHeight,
                          videoReadyState: videoReady,
                          srcObject: !!video.srcObject,
                          paused: video.paused,
                          ended: video.ended,
                          currentTime: video.currentTime
                        });
                        
                        // Try to play video manually if needed
                        if (video.paused) {
                          console.log('🎬 Video is paused, trying to play...');
                          video.play().then(() => {
                            console.log('🎬 Video play successful');
                            setTimeout(() => captureAndSendFrame(), 1000);
                          }).catch(err => {
                            console.log('🎬 Video play failed:', err);
                            // Try capture anyway
                            captureAndSendFrame();
                          });
                        } else {
                          captureAndSendFrame();
                        }
                      }
                    }}
                    className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg"
                  >
                    Test Capture
                  </button>
                  
                  <button 
                    onClick={() => {
                      console.log('🔄 Force video reload button clicked');
                      const video = videoRef.current;
                      if (video && stream) {
                        video.load(); // Force reload
                        video.srcObject = stream; // Reassign stream
                        video.play().catch(err => console.log('🎬 Force play failed:', err));
                        console.log('🔄 Video force reload attempted');
                      }
                    }}
                    className="px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg"
                  >
                    🔄 Reload Video
                  </button>
                </>
              )}
            </>
          ) : (
            <button 
              onClick={stopMeasurement}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Stop Measurement
            </button>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video feed */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Live Camera Feed</h3>
            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-auto max-w-2xl mx-auto block cursor-pointer"
                style={{
                  aspectRatio: '4/3',
                  maxHeight: '480px'
                }}
                onClick={async () => {
                  // Manual play on click to overcome autoplay restrictions
                  const video = videoRef.current;
                  if (video && video.paused) {
                    try {
                      await video.play();
                      console.log('🎬 Video started playing after click');
                    } catch (err) {
                      console.log('🎬 Click play failed:', err);
                    }
                  }
                }}
              />
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-lg">Camera feed will appear here</p>
                  </div>
                </div>
              )}
              {stream && !videoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">⏳</div>
                    <p className="text-lg">Loading camera...</p>
                    <p className="text-sm">Click to help start video</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Measurements display */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700">Current Measurements</h3>
            {measurements ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                  <div className="text-sm font-medium text-pink-600 uppercase tracking-wide">Bust</div>
                  <div className="text-2xl font-bold text-pink-800">{formatMeasurement(measurements.bust)}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-600 uppercase tracking-wide">Waist</div>
                  <div className="text-2xl font-bold text-blue-800">{formatMeasurement(measurements.waist)}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm font-medium text-purple-600 uppercase tracking-wide">Hips</div>
                  <div className="text-2xl font-bold text-purple-800">{formatMeasurement(measurements.hips)}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-600 uppercase tracking-wide">Height</div>
                  <div className="text-2xl font-bold text-green-800">{formatMeasurement(measurements.height)}</div>
                </div>
                <div className="col-span-2 bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <div className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Confidence</div>
                  <div className="text-2xl font-bold text-indigo-800">{(confidence * 100).toFixed(1)}%</div>
                  <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-4xl text-gray-400 mb-4">📏</div>
                <p className="text-lg text-gray-600">
                  {isActive ? 'Analyzing pose...' : 'Start measurement to see results'}
                </p>
              </div>
            )}
            
            {/* Instructions */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">📋 Instructions</h4>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Ensure good lighting
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Stand arms-length from camera
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Wear form-fitting clothes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Stand still for accurate measurements
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Face the camera directly
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default RealtimeMeasurement;
