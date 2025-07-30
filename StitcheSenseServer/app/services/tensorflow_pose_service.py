"""
Advanced pose estimation and body analysis
Enhanced AR capabilities with optional TensorFlow models
"""

try:
    import tensorflow as tf
    import tensorflow_hub as hub
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    tf = None
    hub = None

import numpy as np
import cv2
from typing import Dict, Any, Tuple, List, Optional
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class PoseKeypoint:
    """Individual pose keypoint with coordinates and confidence"""
    x: float
    y: float
    confidence: float


@dataclass
class PoseEstimation:
    """Complete pose estimation result"""
    keypoints: List[PoseKeypoint]
    overall_confidence: float
    bounding_box: Tuple[int, int, int, int]  # x, y, width, height
    person_segmentation: Optional[np.ndarray] = None


class TensorFlowPoseEstimator:
    """Advanced pose estimation using TensorFlow models (optional)"""
    
    def __init__(self):
        self.models_loaded = False
        self.movenet_model = None
        self.posenet_model = None
        self.body_pix_model = None
        self.tensorflow_available = TENSORFLOW_AVAILABLE
        
        # MoveNet keypoint mapping
        self.movenet_keypoints = [
            'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
            'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
        ]
        
        # Initialize models only if TensorFlow is available
        if TENSORFLOW_AVAILABLE:
            self._load_models()
        else:
            logger.warning("TensorFlow not available - AR will use MediaPipe only")
    
    def _load_models(self):
        """Load TensorFlow models for pose estimation"""
        if not TENSORFLOW_AVAILABLE:
            logger.warning("TensorFlow not available, skipping model loading")
            return
            
        try:
            # Load MoveNet Lightning (fast inference)
            logger.info("Loading MoveNet Lightning model...")
            self.movenet_model = hub.load("https://tfhub.dev/google/movenet/singlepose/lightning/4")
            
            # Note: Disabling PoseNet and BodyPix for now to avoid complexity
            # self.posenet_model = hub.load("https://tfhub.dev/google/tfjs-model/posenet/mobilenet/float/075/1/default/1")
            # self.body_pix_model = hub.load("https://tfhub.dev/tensorflow/tfjs-model/bodypix/mobilenet/float/075/1/default/1")
            
            self.models_loaded = True
            logger.info("TensorFlow models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load TensorFlow models: {e}")
            self.models_loaded = False
    
    async def estimate_pose_movenet(self, image: np.ndarray) -> PoseEstimation:
        """Estimate pose using MoveNet model"""
        if not TENSORFLOW_AVAILABLE or not self.models_loaded or self.movenet_model is None:
            raise RuntimeError("MoveNet model not available - TensorFlow not installed")
        
        try:
            # Preprocess image
            input_image = self._preprocess_image_for_movenet(image)
            
            # Run inference
            outputs = self.movenet_model.signatures['serving_default'](input_image)
            keypoints = outputs['output_0'].numpy()
            
            # Process results
            pose_estimation = self._process_movenet_output(keypoints[0, 0], image.shape)
            
            return pose_estimation
            
        except Exception as e:
            logger.error(f"MoveNet pose estimation failed: {e}")
            raise
    
    async def estimate_pose_posenet(self, image: np.ndarray) -> PoseEstimation:
        """Estimate pose using PoseNet model (disabled for now)"""
        raise RuntimeError("PoseNet model not available in this version")
    
    async def segment_person(self, image: np.ndarray) -> np.ndarray:
        """Segment person from background using fallback method"""
        logger.info("Using fallback person segmentation (no TensorFlow)")
        return self._fallback_person_segmentation(image)
    
    def _preprocess_image_for_movenet(self, image: np.ndarray):
        """Preprocess image for MoveNet model"""
        if not TENSORFLOW_AVAILABLE:
            raise RuntimeError("TensorFlow not available")
            
        # Resize to 192x192 for Lightning model
        resized = cv2.resize(image, (192, 192))
        
        # Convert BGR to RGB
        rgb_image = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        
        # Normalize to [0, 1]
        normalized = rgb_image.astype(np.float32) / 255.0
        
        # Add batch dimension
        input_tensor = tf.expand_dims(normalized, axis=0)
        
        return tf.cast(input_tensor, dtype=tf.int32)
    
    def _preprocess_image_for_posenet(self, image: np.ndarray):
        """Preprocess image for PoseNet model (disabled)"""
        raise RuntimeError("PoseNet not available in this version")
    
    def _preprocess_image_for_bodypix(self, image: np.ndarray):
        """Preprocess image for BodyPix model (disabled)"""
        raise RuntimeError("BodyPix not available in this version")
    
    def _process_movenet_output(self, keypoints: np.ndarray, image_shape: Tuple[int, int, int]) -> PoseEstimation:
        """Process MoveNet model output"""
        h, w, _ = image_shape
        
        # Convert keypoints to PoseKeypoint objects
        pose_keypoints = []
        total_confidence = 0
        
        for i, kp in enumerate(keypoints):
            y, x, confidence = kp
            
            # Convert normalized coordinates to pixel coordinates
            pixel_x = int(x * w)
            pixel_y = int(y * h)
            
            pose_keypoints.append(PoseKeypoint(pixel_x, pixel_y, confidence))
            total_confidence += confidence
        
        # Calculate overall confidence
        overall_confidence = total_confidence / len(keypoints)
        
        # Calculate bounding box
        valid_points = [kp for kp in pose_keypoints if kp.confidence > 0.3]
        if valid_points:
            min_x = min(kp.x for kp in valid_points)
            max_x = max(kp.x for kp in valid_points)
            min_y = min(kp.y for kp in valid_points)
            max_y = max(kp.y for kp in valid_points)
            
            # Add padding
            padding = 20
            bounding_box = (
                max(0, min_x - padding),
                max(0, min_y - padding),
                min(w, max_x - min_x + 2 * padding),
                min(h, max_y - min_y + 2 * padding)
            )
        else:
            bounding_box = (0, 0, w, h)
        
        return PoseEstimation(
            keypoints=pose_keypoints,
            overall_confidence=overall_confidence,
            bounding_box=bounding_box
        )
    
    def _process_posenet_output(self, outputs: Dict[str, Any], image_shape: Tuple[int, int, int]) -> PoseEstimation:
        """Process PoseNet model output"""
        h, w, _ = image_shape
        
        # Extract keypoints and scores
        keypoints = outputs['keypoints'].numpy()[0]
        keypoint_scores = outputs['keypoint_scores'].numpy()[0]
        
        # Convert to PoseKeypoint objects
        pose_keypoints = []
        total_confidence = 0
        
        for i, (kp, score) in enumerate(zip(keypoints, keypoint_scores)):
            y, x = kp
            
            # Convert coordinates to pixel space
            pixel_x = int(x * w / 257)  # PoseNet uses 257x257 input
            pixel_y = int(y * h / 257)
            
            pose_keypoints.append(PoseKeypoint(pixel_x, pixel_y, score))
            total_confidence += score
        
        # Calculate overall confidence
        overall_confidence = total_confidence / len(keypoints)
        
        # Calculate bounding box (similar to MoveNet)
        valid_points = [kp for kp in pose_keypoints if kp.confidence > 0.3]
        if valid_points:
            min_x = min(kp.x for kp in valid_points)
            max_x = max(kp.x for kp in valid_points)
            min_y = min(kp.y for kp in valid_points)
            max_y = max(kp.y for kp in valid_points)
            
            padding = 20
            bounding_box = (
                max(0, min_x - padding),
                max(0, min_y - padding),
                min(w, max_x - min_x + 2 * padding),
                min(h, max_y - min_y + 2 * padding)
            )
        else:
            bounding_box = (0, 0, w, h)
        
        return PoseEstimation(
            keypoints=pose_keypoints,
            overall_confidence=overall_confidence,
            bounding_box=bounding_box
        )
    
    def _process_segmentation_mask(self, segmentation: np.ndarray, image_shape: Tuple[int, int, int]) -> np.ndarray:
        """Process person segmentation mask"""
        h, w, _ = image_shape
        
        # Resize mask to match image dimensions
        mask = cv2.resize(segmentation[0], (w, h))
        
        # Threshold to create binary mask
        binary_mask = (mask > 0.5).astype(np.uint8) * 255
        
        return binary_mask
    
    def _fallback_person_segmentation(self, image: np.ndarray) -> np.ndarray:
        """Fallback person segmentation using traditional CV methods"""
        # Simple background subtraction or edge-based segmentation
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Use adaptive thresholding
        binary = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Morphological operations to clean up
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
        
        return binary
    
    async def enhance_pose_with_tensorflow(self, mediapipe_pose, image: np.ndarray) -> Dict[str, Any]:
        """Enhance MediaPipe pose estimation with TensorFlow models"""
        enhanced_result = {
            'mediapipe_pose': mediapipe_pose,
            'tensorflow_pose': None,
            'person_segmentation': None,
            'confidence_comparison': {},
            'enhanced_landmarks': []
        }
        
        try:
            # Get TensorFlow pose estimation
            tf_pose = await self.estimate_pose_movenet(image)
            enhanced_result['tensorflow_pose'] = tf_pose
            
            # Get person segmentation
            segmentation = await self.segment_person(image)
            enhanced_result['person_segmentation'] = segmentation
            
            # Compare confidence scores
            if mediapipe_pose.pose_landmarks:
                mp_confidence = np.mean([lm.visibility for lm in mediapipe_pose.pose_landmarks.landmark])
                tf_confidence = tf_pose.overall_confidence
                
                enhanced_result['confidence_comparison'] = {
                    'mediapipe': mp_confidence,
                    'tensorflow': tf_confidence,
                    'better_model': 'tensorflow' if tf_confidence > mp_confidence else 'mediapipe'
                }
                
                # Create enhanced landmarks by combining both models
                enhanced_result['enhanced_landmarks'] = self._combine_pose_estimates(
                    mediapipe_pose, tf_pose, image.shape
                )
            
        except Exception as e:
            logger.error(f"TensorFlow pose enhancement failed: {e}")
        
        return enhanced_result
    
    def _combine_pose_estimates(self, mp_pose, tf_pose: PoseEstimation, image_shape: Tuple[int, int, int]) -> List[Dict[str, Any]]:
        """Combine MediaPipe and TensorFlow pose estimates for better accuracy"""
        h, w, _ = image_shape
        enhanced_landmarks = []
        
        # MediaPipe has 33 landmarks, TensorFlow (MoveNet) has 17
        # Map common landmarks and use confidence-weighted averaging
        
        common_landmarks = {
            0: 0,   # nose
            5: 1,   # left_shoulder -> left_eye (approximate)
            6: 2,   # right_shoulder -> right_eye (approximate)
            11: 5,  # left_shoulder
            12: 6,  # right_shoulder
            13: 7,  # left_elbow
            14: 8,  # right_elbow
            15: 9,  # left_wrist
            16: 10, # right_wrist
            23: 11, # left_hip
            24: 12, # right_hip
            25: 13, # left_knee
            26: 14, # right_knee
            27: 15, # left_ankle
            28: 16, # right_ankle
        }
        
        mp_landmarks = mp_pose.pose_landmarks.landmark if mp_pose.pose_landmarks else []
        
        for mp_idx, tf_idx in common_landmarks.items():
            if mp_idx < len(mp_landmarks) and tf_idx < len(tf_pose.keypoints):
                mp_lm = mp_landmarks[mp_idx]
                tf_kp = tf_pose.keypoints[tf_idx]
                
                # Convert MediaPipe normalized coordinates to pixels
                mp_x = int(mp_lm.x * w)
                mp_y = int(mp_lm.y * h)
                mp_conf = mp_lm.visibility
                
                # TensorFlow coordinates are already in pixels
                tf_x = tf_kp.x
                tf_y = tf_kp.y
                tf_conf = tf_kp.confidence
                
                # Weighted average based on confidence
                total_conf = mp_conf + tf_conf
                if total_conf > 0:
                    enhanced_x = (mp_x * mp_conf + tf_x * tf_conf) / total_conf
                    enhanced_y = (mp_y * mp_conf + tf_y * tf_conf) / total_conf
                    enhanced_conf = max(mp_conf, tf_conf)  # Use higher confidence
                else:
                    enhanced_x = (mp_x + tf_x) / 2
                    enhanced_y = (mp_y + tf_y) / 2
                    enhanced_conf = 0.0
                
                enhanced_landmarks.append({
                    'landmark_id': mp_idx,
                    'x': enhanced_x,
                    'y': enhanced_y,
                    'confidence': enhanced_conf,
                    'mediapipe_conf': mp_conf,
                    'tensorflow_conf': tf_conf
                })
        
        return enhanced_landmarks


# Singleton instance
tf_pose_estimator = TensorFlowPoseEstimator()
