"""
AR Dress Augmentation API endpoints
Real-time AR dress fitting with WebSocket support
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import Dict, Any, List, Optional
import json
import asyncio
import logging
from app.services.ar_augmentation_service import ar_service
from app.core.security import get_current_user
from app.models.user import User
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
import time

logger = logging.getLogger(__name__)
router = APIRouter()

# WebSocket connection manager
class ARConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.user_sessions[session_id] = {
            'connected_at': time.time(),
            'frame_count': 0,
            'current_dress': None
        }
        logger.info(f"AR session {session_id} connected")
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.user_sessions:
            del self.user_sessions[session_id]
        logger.info(f"AR session {session_id} disconnected")
    
    async def send_personal_message(self, message: Dict[str, Any], session_id: str):
        if session_id in self.active_connections:
            websocket = self.active_connections[session_id]
            await websocket.send_json(message)
    
    async def broadcast(self, message: Dict[str, Any]):
        for session_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to {session_id}: {e}")

ar_manager = ARConnectionManager()


@router.get("/dress-templates")
async def get_dress_templates():
    """Get available dress templates for AR fitting"""
    try:
        templates = await ar_service.get_dress_templates()
        return JSONResponse(content={
            "success": True,
            "templates": templates,
            "count": len(templates)
        })
    except Exception as e:
        logger.error(f"Error getting dress templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/customize-dress")
async def customize_dress(
    template_id: str,
    customizations: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Customize a dress template with user preferences"""
    try:
        custom_dress = await ar_service.customize_dress(template_id, customizations)
        return JSONResponse(content={
            "success": True,
            "dress": custom_dress,
            "user_id": current_user.id
        })
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error customizing dress: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-frame")
async def process_frame(
    file: UploadFile = File(...),
    dress_config: str = None,
    current_user: User = Depends(get_current_user)
):
    """Process a single frame for AR dress augmentation"""
    try:
        # Read file data
        frame_data = await file.read()
        
        # Parse dress configuration
        if dress_config:
            dress_config = json.loads(dress_config)
        else:
            # Default configuration
            dress_config = {
                'type': 'evening_gown',
                'opacity': 0.7
            }
        
        # Process frame
        result = await ar_service.process_frame_for_ar(frame_data, dress_config)
        
        return JSONResponse(content={
            "success": result['success'],
            "data": result,
            "user_id": current_user.id
        })
        
    except Exception as e:
        logger.error(f"Error processing frame: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/ws/ar-fitting/{session_id}")
async def websocket_ar_fitting(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time AR dress fitting with optimized processing"""
    await ar_manager.connect(websocket, session_id)
    
    try:
        while True:
            # Receive data from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get('type')
            
            if message_type == 'frame':
                # Process video frame with async handling
                frame_data = message.get('frame_data')
                dress_config = message.get('dress_config', {})
                
                logger.info(f"Received frame for session {session_id}: frame_data_length={len(frame_data) if frame_data else 0}, dress_config={dress_config}")
                
                if frame_data:
                    try:
                        # Decode base64 frame
                        import base64
                        logger.info(f"Decoding frame data for session {session_id}")
                        frame_bytes = base64.b64decode(frame_data.split(',')[1])
                        logger.info(f"Frame decoded successfully, size: {len(frame_bytes)} bytes")
                        
                        # Start processing time
                        start_time = time.time()
                        
                        # Process frame asynchronously
                        logger.info(f"Starting frame processing for session {session_id}")
                        result = await ar_service.process_frame_for_ar(frame_bytes, dress_config)
                        logger.info(f"Frame processing completed for session {session_id}: success={result.get('success')}")
                        
                        # Calculate processing time
                        processing_time = (time.time() - start_time) * 1000  # in ms
                        result['processing_time'] = round(processing_time, 2)
                        
                        # Update session stats
                        ar_manager.user_sessions[session_id]['frame_count'] += 1
                        ar_manager.user_sessions[session_id]['current_dress'] = dress_config.get('type')
                        ar_manager.user_sessions[session_id]['last_processing_time'] = processing_time
                        
                        # Send result back immediately
                        await ar_manager.send_personal_message({
                            'type': 'frame_result',
                            'data': result,
                            'session_id': session_id,
                            'timestamp': time.time()
                        }, session_id)
                        logger.info(f"Frame result sent to session {session_id}")
                        
                    except Exception as e:
                        logger.error(f"Frame processing error for session {session_id}: {e}")
                        # Send error response
                        await ar_manager.send_personal_message({
                            'type': 'frame_result',
                            'data': {
                                'success': False,
                                'message': f'Processing error: {str(e)}',
                                'processing_time': 0
                            },
                            'session_id': session_id,
                            'timestamp': time.time()
                        }, session_id)
                else:
                    logger.warning(f"No frame data received for session {session_id}")
            
            elif message_type == 'change_dress':
                # Change dress template
                dress_config = message.get('dress_config', {})
                ar_manager.user_sessions[session_id]['current_dress'] = dress_config.get('type')
                
                await ar_manager.send_personal_message({
                    'type': 'dress_changed',
                    'dress_config': dress_config,
                    'session_id': session_id
                }, session_id)
            
            elif message_type == 'get_session_info':
                # Send session information
                session_info = ar_manager.user_sessions.get(session_id, {})
                await ar_manager.send_personal_message({
                    'type': 'session_info',
                    'data': session_info,
                    'session_id': session_id
                }, session_id)
            
            elif message_type == 'ping':
                # Keepalive ping
                await ar_manager.send_personal_message({
                    'type': 'pong',
                    'timestamp': time.time()
                }, session_id)
    
    except WebSocketDisconnect:
        ar_manager.disconnect(session_id)
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
        ar_manager.disconnect(session_id)


@router.get("/ar-session/{session_id}/stats")
async def get_ar_session_stats(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get statistics for an AR session"""
    session_info = ar_manager.user_sessions.get(session_id)
    
    if not session_info:
        raise HTTPException(status_code=404, detail="Session not found")
    
    current_time = time.time()
    session_duration = current_time - session_info['connected_at']
    
    return JSONResponse(content={
        "success": True,
        "session_id": session_id,
        "stats": {
            "duration_seconds": session_duration,
            "frame_count": session_info['frame_count'],
            "current_dress": session_info['current_dress'],
            "fps_average": session_info['frame_count'] / session_duration if session_duration > 0 else 0,
            "is_active": session_id in ar_manager.active_connections
        }
    })


@router.post("/ar-session/{session_id}/save-fitting")
async def save_ar_fitting(
    session_id: str,
    fitting_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Save AR fitting session data for the user"""
    try:
        session_info = ar_manager.user_sessions.get(session_id)
        
        if not session_info:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Prepare fitting record
        fitting_record = {
            "user_id": current_user.id,
            "session_id": session_id,
            "dress_type": fitting_data.get('dress_type'),
            "dress_config": fitting_data.get('dress_config'),
            "measurements": fitting_data.get('measurements'),
            "satisfaction_rating": fitting_data.get('rating'),
            "notes": fitting_data.get('notes'),
            "duration_seconds": time.time() - session_info['connected_at'],
            "frame_count": session_info['frame_count'],
            "created_at": time.time()
        }
        
        # Save to database
        collection = db["ar_fittings"]
        result = await collection.insert_one(fitting_record)
        
        return JSONResponse(content={
            "success": True,
            "fitting_id": str(result.inserted_id),
            "message": "AR fitting saved successfully"
        })
        
    except Exception as e:
        logger.error(f"Error saving AR fitting: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ar-fittings")
async def get_user_ar_fittings(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    limit: int = 10,
    skip: int = 0
):
    """Get user's AR fitting history"""
    try:
        collection = db["ar_fittings"]
        
        # Get user's fittings
        cursor = collection.find(
            {"user_id": current_user.id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        fittings = []
        async for fitting in cursor:
            fitting["_id"] = str(fitting["_id"])
            fittings.append(fitting)
        
        # Get total count
        total_count = await collection.count_documents({"user_id": current_user.id})
        
        return JSONResponse(content={
            "success": True,
            "fittings": fittings,
            "total_count": total_count,
            "page_size": limit,
            "current_page": skip // limit + 1
        })
        
    except Exception as e:
        logger.error(f"Error getting AR fittings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ar-analytics")
async def get_ar_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get AR usage analytics for the user"""
    try:
        collection = db["ar_fittings"]
        
        # Aggregate analytics
        pipeline = [
            {"$match": {"user_id": current_user.id}},
            {"$group": {
                "_id": "$dress_type",
                "count": {"$sum": 1},
                "avg_duration": {"$avg": "$duration_seconds"},
                "avg_rating": {"$avg": "$satisfaction_rating"}
            }}
        ]
        
        dress_analytics = []
        async for result in collection.aggregate(pipeline):
            dress_analytics.append(result)
        
        # Get total sessions
        total_sessions = await collection.count_documents({"user_id": current_user.id})
        
        # Get recent activity
        recent_pipeline = [
            {"$match": {"user_id": current_user.id}},
            {"$sort": {"created_at": -1}},
            {"$limit": 5},
            {"$project": {
                "dress_type": 1,
                "created_at": 1,
                "duration_seconds": 1,
                "satisfaction_rating": 1
            }}
        ]
        
        recent_activity = []
        async for result in collection.aggregate(recent_pipeline):
            result["_id"] = str(result["_id"])
            recent_activity.append(result)
        
        return JSONResponse(content={
            "success": True,
            "analytics": {
                "total_sessions": total_sessions,
                "dress_preferences": dress_analytics,
                "recent_activity": recent_activity
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting AR analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/ar-session/{session_id}")
async def terminate_ar_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Terminate an active AR session"""
    try:
        if session_id in ar_manager.active_connections:
            websocket = ar_manager.active_connections[session_id]
            await websocket.close()
        
        ar_manager.disconnect(session_id)
        
        return JSONResponse(content={
            "success": True,
            "message": f"AR session {session_id} terminated"
        })
        
    except Exception as e:
        logger.error(f"Error terminating AR session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Health check for AR service
@router.get("/health")
async def ar_health_check():
    """Health check for AR augmentation service"""
    try:
        # Check if AR service is responsive
        templates = await ar_service.get_dress_templates()
        
        return JSONResponse(content={
            "success": True,
            "status": "healthy",
            "active_sessions": len(ar_manager.active_connections),
            "available_templates": len(templates),
            "service_info": {
                "tensorflow_available": hasattr(ar_service, 'movenet_model'),
                "mediapipe_available": hasattr(ar_service, 'pose_detector')
            }
        })
        
    except Exception as e:
        logger.error(f"AR health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "status": "unhealthy",
                "error": str(e)
            }
        )
