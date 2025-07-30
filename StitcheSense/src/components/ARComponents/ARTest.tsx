import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface DressTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  config: {
    bodice_color?: [number, number, number];
    skirt_color?: [number, number, number];
    opacity: number;
  };
}

interface Measurements {
  shoulder_width?: number;
  torso_length?: number;
  hip_width?: number;
  arm_length?: number;
  confidence_score?: number;
  [key: string]: number | string | undefined;
}

interface ARTestProps {
  onClose?: () => void;
}

const ARTest: React.FC<ARTestProps> = ({ onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [dressTemplates, setDressTemplates] = useState<DressTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DressTemplate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [processedFrame, setProcessedFrame] = useState<string>('');
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [frameCount, setFrameCount] = useState<number>(0);
  const [lastFrameTime, setLastFrameTime] = useState<number>(Date.now());
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const processingQueueRef = useRef<boolean>(false);

  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    loadDressTemplates();
    return () => {
      cleanup();
    };
  }, []);

  const loadDressTemplates = async () => {
    try {
      const response = await axios.get(`${API_BASE}/ar/dress-templates`);
      if (response.data.success) {
        setDressTemplates(response.data.templates);
        if (response.data.templates.length > 0) {
          setSelectedTemplate(response.data.templates[0]);
        }
      }
    } catch (err) {
      setError('Failed to load dress templates');
      console.error('Error loading templates:', err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Generate session ID and connect
      const newSessionId = `ar_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      connectWebSocket(newSessionId);
      
      return newSessionId;
    } catch (error) {
      setError('Failed to access camera');
      console.error('Camera error:', error);
      throw error;
    }
  };

  const connectWebSocket = (sessionId: string) => {
    const wsUrl = `ws://localhost:8000/api/ar/ws/ar-fitting/${sessionId}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError('');
      
      // Send a test ping message to verify connection
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
          console.log('Sent ping message to test connection');
        }
      }, 500);
    };
    
    ws.onmessage = (event) => {
      try {
        console.log('Received WebSocket message:', event.data);
        const data = JSON.parse(event.data);
        
        if (data.type === 'frame_result') {
          setIsProcessing(false);
          processingQueueRef.current = false;
          
          // Update FPS calculation
          const now = Date.now();
          const timeDiff = now - lastFrameTime;
          const newFps = Math.round(1000 / timeDiff);
          setFps(newFps);
          setLastFrameTime(now);
          setFrameCount(prev => prev + 1);
          
          console.log('Frame processing result:', {
            success: data.data.success,
            message: data.data.message,
            has_frame: !!data.data.frame,
            has_measurements: !!data.data.measurements
          });
          
          if (data.data.success) {
            setProcessedFrame(data.data.frame);
            if (data.data.measurements) {
              setMeasurements(data.data.measurements);
            }
          } else {
            setError(data.data.message || 'Processing failed');
            console.error('Backend processing error:', data.data.message);
          }
        } else if (data.type === 'pong') {
          // Keepalive response
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
        setError('WebSocket message parsing failed');
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('WebSocket connection failed');
      setIsConnected(false);
    };
    
    wsRef.current = ws;
  };

  const startARSession = async () => {
    try {
      setError('');
      await startCamera();
      
      // Start real-time processing with requestAnimationFrame
      const startProcessing = () => {
        processFrame();
        animationFrameRef.current = requestAnimationFrame(startProcessing);
      };
      
      setTimeout(() => {
        startProcessing();
      }, 1000);
      
    } catch (error) {
      setError('Failed to start AR session');
      console.error('AR session error:', error);
    }
  };

  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current || !wsRef.current || !selectedTemplate) {
      console.log('processFrame skipped:', {
        hasVideo: !!videoRef.current,
        hasCanvas: !!canvasRef.current,
        hasWebSocket: !!wsRef.current,
        hasTemplate: !!selectedTemplate,
        wsReadyState: wsRef.current?.readyState
      });
      return;
    }

    // Skip frame if still processing previous one
    if (processingQueueRef.current || isProcessing) {
      console.log('Frame skipped - already processing');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 with optimized quality for speed
    const frameData = canvas.toDataURL('image/jpeg', 0.6); // Reduced quality for faster processing
    
    if (wsRef.current.readyState === WebSocket.OPEN) {
      processingQueueRef.current = true;
      setIsProcessing(true);
      
      const message = {
        type: 'frame',
        frame_data: frameData,
        dress_config: {
          type: selectedTemplate.type,
          ...selectedTemplate.config
        }
      };
      
      console.log('Sending frame to backend:', {
        type: message.type,
        frame_size: frameData.length,
        dress_type: selectedTemplate.type,
        canvas_size: `${canvas.width}x${canvas.height}`,
        video_size: `${video.videoWidth}x${video.videoHeight}`
      });
      
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.log('WebSocket not ready, state:', wsRef.current.readyState);
    }
  };

  const changeDress = (template: DressTemplate) => {
    setSelectedTemplate(template);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'change_dress',
        dress_config: {
          type: template.type,
          ...template.config
        }
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const cleanup = () => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsConnected(false);
    setProcessedFrame('');
    setMeasurements(null);
    processingQueueRef.current = false;
  };

  const stopARSession = () => {
    cleanup();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">AR Dress Fitting Test</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Controls</h3>
              <div className="space-y-2">
                {!isConnected ? (
                  <button
                    onClick={startARSession}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Start AR Session
                  </button>
                ) : (
                  <button
                    onClick={stopARSession}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Stop AR Session
                  </button>
                )}
                
                <div className="text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
                
                {isProcessing && (
                  <div className="text-sm text-blue-600">
                    Processing frame...
                  </div>
                )}
                
                {/* Performance Display */}
                {isConnected && (
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    <div>FPS: {fps}</div>
                    <div>Frames: {frameCount}</div>
                    <div className={`${processingQueueRef.current ? 'text-orange-600' : 'text-green-600'}`}>
                      {processingQueueRef.current ? 'Processing...' : 'Ready'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dress Templates */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Dress Templates</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dressTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => changeDress(template)}
                    className={`w-full text-left p-3 rounded border ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                    <div className="text-xs text-gray-500">Type: {template.type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Measurements */}
            {measurements && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Measurements</h3>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  {Object.entries(measurements).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span>{typeof value === 'number' ? value.toFixed(1) : String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Video Feed */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Camera Feed</h3>
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          </div>

          {/* AR Result */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">AR Result</h3>
              <div className="relative">
                {processedFrame ? (
                  <img
                    src={processedFrame}
                    alt="AR Processed Frame"
                    className="w-full h-64 object-cover bg-black rounded"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500">
                      {isConnected ? 'Processing...' : 'Start AR session to see results'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click "Start AR Session" to begin</li>
            <li>Allow camera access when prompted</li>
            <li>Stand in front of the camera with good lighting</li>
            <li>Select different dress templates to try them on</li>
            <li>The AR result will show the dress overlaid on your pose</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ARTest;
