"""
Enhanced installation script for StitcheSense AR features
Installs TensorFlow and sets up AR augmentation capabilities
"""

import subprocess
import sys
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        logger.error("Python 3.8 or higher is required for TensorFlow 2.13")
        return False
    logger.info(f"Python version {version.major}.{version.minor}.{version.micro} - Compatible")
    return True


def install_requirements():
    """Install all requirements including TensorFlow"""
    logger.info("Installing requirements...")
    
    try:
        # Upgrade pip first
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        
        # Install requirements
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        
        logger.info("Requirements installed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install requirements: {e}")
        return False


def check_gpu_availability():
    """Check if GPU is available for TensorFlow"""
    try:
        import tensorflow as tf
        
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            logger.info(f"GPU detected: {len(gpus)} device(s)")
            for i, gpu in enumerate(gpus):
                logger.info(f"  GPU {i}: {gpu}")
            
            # Enable memory growth to avoid allocating all GPU memory
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            
            return True
        else:
            logger.info("No GPU detected, using CPU for TensorFlow operations")
            return False
            
    except ImportError:
        logger.warning("TensorFlow not installed, skipping GPU check")
        return False
    except Exception as e:
        logger.warning(f"Error checking GPU availability: {e}")
        return False


def verify_tensorflow_installation():
    """Verify TensorFlow installation and basic functionality"""
    try:
        import tensorflow as tf
        import tensorflow_hub as hub
        
        logger.info(f"TensorFlow version: {tf.__version__}")
        logger.info(f"TensorFlow Hub version: {hub.__version__}")
        
        # Test basic TensorFlow operations
        x = tf.constant([[1.0, 2.0], [3.0, 4.0]])
        y = tf.constant([[1.0, 1.0], [0.0, 1.0]])
        result = tf.matmul(x, y)
        
        logger.info("TensorFlow basic operations test: PASSED")
        
        # Check if CUDA is available (for GPU support)
        if tf.test.is_built_with_cuda():
            logger.info("TensorFlow built with CUDA support")
            if tf.test.is_gpu_available():
                logger.info("GPU is available for TensorFlow")
            else:
                logger.info("GPU not available, but CUDA support is built-in")
        else:
            logger.info("TensorFlow built without CUDA support (CPU only)")
        
        return True
        
    except ImportError as e:
        logger.error(f"TensorFlow import failed: {e}")
        return False
    except Exception as e:
        logger.error(f"TensorFlow verification failed: {e}")
        return False


def verify_opencv_installation():
    """Verify OpenCV installation"""
    try:
        import cv2
        logger.info(f"OpenCV version: {cv2.__version__}")
        
        # Test basic OpenCV operations
        img = cv2.imread("static/test_image.jpg") if os.path.exists("static/test_image.jpg") else None
        if img is not None:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            logger.info("OpenCV basic operations test: PASSED")
        else:
            logger.info("OpenCV import successful (no test image available)")
        
        return True
        
    except ImportError as e:
        logger.error(f"OpenCV import failed: {e}")
        return False
    except Exception as e:
        logger.error(f"OpenCV verification failed: {e}")
        return False


def verify_mediapipe_installation():
    """Verify MediaPipe installation"""
    try:
        import mediapipe as mp
        logger.info(f"MediaPipe version: {mp.__version__}")
        
        # Test MediaPipe pose initialization
        mp_pose = mp.solutions.pose
        pose = mp_pose.Pose()
        logger.info("MediaPipe pose initialization: PASSED")
        pose.close()
        
        return True
        
    except ImportError as e:
        logger.error(f"MediaPipe import failed: {e}")
        return False
    except Exception as e:
        logger.error(f"MediaPipe verification failed: {e}")
        return False


def setup_directories():
    """Set up necessary directories for AR features"""
    directories = [
        "static/ar_sessions",
        "static/ar_templates",
        "static/user_fittings",
        "logs/ar_logs",
        "uploads/ar_frames"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {directory}")


def create_ar_config():
    """Create AR configuration file"""
    ar_config = """
# AR Augmentation Configuration
AR_CONFIG = {
    "tensorflow": {
        "model_cache_dir": "models/tensorflow",
        "movenet_model_url": "https://tfhub.dev/google/movenet/singlepose/lightning/4",
        "posenet_model_url": "https://tfhub.dev/google/tfjs-model/posenet/mobilenet/float/075/1/default/1",
        "bodypix_model_url": "https://tfhub.dev/tensorflow/tfjs-model/bodypix/mobilenet/float/075/1/default/1"
    },
    "mediapipe": {
        "pose_confidence": 0.5,
        "tracking_confidence": 0.5,
        "model_complexity": 2
    },
    "processing": {
        "max_frame_size": 1920,
        "jpeg_quality": 85,
        "max_session_duration": 3600,  # 1 hour
        "max_concurrent_sessions": 10
    },
    "dress_templates": {
        "cache_enabled": True,
        "max_custom_templates": 50,
        "default_opacity": 0.7
    }
}
"""
    
    config_path = "app/core/ar_config.py"
    with open(config_path, "w") as f:
        f.write(ar_config)
    
    logger.info(f"Created AR configuration file: {config_path}")


def test_ar_service():
    """Test AR augmentation service initialization"""
    try:
        from app.services.ar_augmentation_service import ar_service
        from app.services.tensorflow_pose_service import tf_pose_estimator
        
        logger.info("AR augmentation service imported successfully")
        
        # Test dress templates
        import asyncio
        async def test_templates():
            templates = await ar_service.get_dress_templates()
            logger.info(f"Available dress templates: {len(templates)}")
            return True
        
        result = asyncio.run(test_templates())
        if result:
            logger.info("AR service basic functionality test: PASSED")
        
        return True
        
    except Exception as e:
        logger.error(f"AR service test failed: {e}")
        return False


def print_installation_summary(success_flags):
    """Print installation summary"""
    print("\n" + "="*60)
    print("STITCHESENSE AR INSTALLATION SUMMARY")
    print("="*60)
    
    print(f"Python Version Check:      {'✓ PASSED' if success_flags['python'] else '✗ FAILED'}")
    print(f"Requirements Installation: {'✓ PASSED' if success_flags['requirements'] else '✗ FAILED'}")
    print(f"TensorFlow Verification:   {'✓ PASSED' if success_flags['tensorflow'] else '✗ FAILED'}")
    print(f"OpenCV Verification:       {'✓ PASSED' if success_flags['opencv'] else '✗ FAILED'}")
    print(f"MediaPipe Verification:    {'✓ PASSED' if success_flags['mediapipe'] else '✗ FAILED'}")
    print(f"GPU Availability:          {'✓ AVAILABLE' if success_flags['gpu'] else '○ CPU ONLY'}")
    print(f"AR Service Test:           {'✓ PASSED' if success_flags['ar_service'] else '✗ FAILED'}")
    
    overall_success = all([
        success_flags['python'],
        success_flags['requirements'],
        success_flags['tensorflow'],
        success_flags['opencv'],
        success_flags['mediapipe']
    ])
    
    print("\n" + "-"*60)
    if overall_success:
        print("🎉 INSTALLATION SUCCESSFUL!")
        print("\nYou can now run the StitcheSense AR server:")
        print("  python main.py")
        print("\nAR endpoints will be available at:")
        print("  http://localhost:8000/api/ar/")
        print("  WebSocket: ws://localhost:8000/api/ar/ws/ar-fitting/{session_id}")
    else:
        print("❌ INSTALLATION INCOMPLETE")
        print("\nPlease fix the failed components before running the AR server.")
    
    print("="*60)


def main():
    """Main installation function"""
    logger.info("Starting StitcheSense AR installation...")
    
    success_flags = {
        'python': False,
        'requirements': False,
        'tensorflow': False,
        'opencv': False,
        'mediapipe': False,
        'gpu': False,
        'ar_service': False
    }
    
    # Check Python version
    success_flags['python'] = check_python_version()
    if not success_flags['python']:
        print_installation_summary(success_flags)
        return
    
    # Install requirements
    success_flags['requirements'] = install_requirements()
    
    # Verify installations
    if success_flags['requirements']:
        success_flags['tensorflow'] = verify_tensorflow_installation()
        success_flags['opencv'] = verify_opencv_installation()
        success_flags['mediapipe'] = verify_mediapipe_installation()
        success_flags['gpu'] = check_gpu_availability()
    
    # Set up directories and configuration
    setup_directories()
    create_ar_config()
    
    # Test AR service (only if core components are working)
    if success_flags['tensorflow'] and success_flags['opencv'] and success_flags['mediapipe']:
        success_flags['ar_service'] = test_ar_service()
    
    # Print summary
    print_installation_summary(success_flags)


if __name__ == "__main__":
    main()
