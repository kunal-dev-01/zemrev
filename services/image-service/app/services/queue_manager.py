# =====================================================
# REDIS QUEUE MANAGER
# =====================================================

import asyncio
import json
import uuid
import time
from typing import Optional, Dict, Any
from datetime import datetime
import logging

from app.core.redis_client import redis_client
from app.core.config import settings

logger = logging.getLogger(__name__)

# =====================================================
# JOB STATUS CONSTANTS
# =====================================================
class JobStatus:
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRY = "retry"

# =====================================================
# QUEUE MANAGER CLASS
# =====================================================
class QueueManager:
    """Redis-based job queue for image conversions"""
    
    def __init__(self):
        self.queue_key = f"queue:{settings.QUEUE_NAME}"
        self.processing_key = f"processing:{settings.QUEUE_NAME}"
        self.job_prefix = "job:"
        self.result_prefix = "result:"
        self.workers = []
    
    # =====================================================
    # JOB SUBMISSION
    # =====================================================
    
    async def enqueue(
        self,
        task_type: str,
        data: Dict[str, Any],
        priority: int = 0
    ) -> str:
        """
        Add job to queue
        
        Args:
            task_type: Type of task (e.g., 'convert_image')
            data: Job data (file content, options, etc.)
            priority: Job priority (higher = processed first)
            
        Returns:
            str: Job ID
        """
        job_id = str(uuid.uuid4())
        
        job_data = {
            "id": job_id,
            "type": task_type,
            "data": data,
            "status": JobStatus.PENDING,
            "priority": priority,
            "created_at": time.time(),
            "attempts": 0,
            "max_retries": settings.QUEUE_MAX_RETRIES,
            "error": None
        }
        
        try:
            # Store job data
            job_key = f"{self.job_prefix}{job_id}"
            await redis_client.set(
                job_key,
                json.dumps(job_data),
                ex=settings.QUEUE_JOB_TIMEOUT + 300  # 5 min buffer
            )
            
            # Add to queue with priority
            await redis_client.zadd(
                self.queue_key,
                {job_id: priority}
            )
            
            logger.info(f"Job enqueued: {job_id} (type: {task_type}, priority: {priority})")
            return job_id
            
        except Exception as e:
            logger.error(f"Failed to enqueue job: {e}")
            raise
    
    # =====================================================
    # JOB RETRIEVAL
    # =====================================================
    
    async def dequeue(self) -> Optional[Dict[str, Any]]:
        """
        Get next job from queue (highest priority first)
        
        Returns:
            dict: Job data or None if queue empty
        """
        try:
            # Get highest priority job
            result = await redis_client.zpopmax(self.queue_key)
            
            if not result or not result[0]:
                return None
            
            job_id = result[0][0] if isinstance(result[0], tuple) else result[0]
            
            # Get job data
            job_key = f"{self.job_prefix}{job_id}"
            job_data_str = await redis_client.get(job_key)
            
            if not job_data_str:
                logger.warning(f"Job data not found: {job_id}")
                return None
            
            job_data = json.loads(job_data_str)
            
            # Move to processing
            job_data["status"] = JobStatus.PROCESSING
            job_data["started_at"] = time.time()
            
            await redis_client.set(job_key, json.dumps(job_data))
            await redis_client.sadd(self.processing_key, job_id)
            
            logger.debug(f"Job dequeued: {job_id}")
            return job_data
            
        except Exception as e:
            logger.error(f"Failed to dequeue job: {e}")
            return None
    
    # =====================================================
    # JOB STATUS MANAGEMENT
    # =====================================================
    
    async def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get current job status"""
        try:
            job_key = f"{self.job_prefix}{job_id}"
            job_data_str = await redis_client.get(job_key)
            
            if not job_data_str:
                return None
            
            return json.loads(job_data_str)
            
        except Exception as e:
            logger.error(f"Failed to get job status: {e}")
            return None
    
    async def complete_job(
        self,
        job_id: str,
        result: Any,
        execution_time: float = None
    ) -> bool:
        """Mark job as completed and store result"""
        try:
            job_key = f"{self.job_prefix}{job_id}"
            result_key = f"{self.result_prefix}{job_id}"
            
            # Update job status
            job_data = await self.get_job_status(job_id)
            if job_data:
                job_data["status"] = JobStatus.COMPLETED
                job_data["completed_at"] = time.time()
                if execution_time:
                    job_data["execution_time"] = execution_time
                
                await redis_client.set(job_key, json.dumps(job_data), ex=300)
            
            # Store result (expires in 5 minutes)
            await redis_client.set(
                result_key,
                json.dumps(result) if not isinstance(result, str) else result,
                ex=300
            )
            
            # Remove from processing
            await redis_client.srem(self.processing_key, job_id)
            
            logger.info(f"Job completed: {job_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to complete job: {e}")
            return False
    
    async def fail_job(
        self,
        job_id: str,
        error: str,
        retry: bool = True
    ) -> bool:
        """Mark job as failed and optionally retry"""
        try:
            job_key = f"{self.job_prefix}{job_id}"
            job_data = await self.get_job_status(job_id)
            
            if not job_data:
                return False
            
            job_data["attempts"] += 1
            job_data["error"] = str(error)
            job_data["failed_at"] = time.time()
            
            # Check if should retry
            if retry and job_data["attempts"] < job_data["max_retries"]:
                job_data["status"] = JobStatus.RETRY
                await redis_client.set(job_key, json.dumps(job_data))
                
                # Re-queue with lower priority
                await redis_client.zadd(
                    self.queue_key,
                    {job_id: job_data["priority"] - 1}
                )
                
                # Wait before retry
                await asyncio.sleep(settings.QUEUE_RETRY_DELAY)
                
                logger.warning(
                    f"Job retry {job_data['attempts']}/{job_data['max_retries']}: {job_id}"
                )
            else:
                job_data["status"] = JobStatus.FAILED
                await redis_client.set(job_key, json.dumps(job_data), ex=300)
                logger.error(f"Job failed permanently: {job_id} - {error}")
            
            # Remove from processing
            await redis_client.srem(self.processing_key, job_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to fail job (ironic!): {e}")
            return False
    
    # =====================================================
    # QUEUE MONITORING
    # =====================================================
    
    async def get_queue_stats(self) -> Dict[str, int]:
        """Get queue statistics"""
        try:
            pending = await redis_client.zcard(self.queue_key)
            processing = await redis_client.scard(self.processing_key)
            
            return {
                "pending": pending,
                "processing": processing,
                "workers": len(self.workers)
            }
        except Exception as e:
            logger.error(f"Failed to get queue stats: {e}")
            return {"pending": 0, "processing": 0, "workers": 0}
    
    async def clear_queue(self) -> bool:
        """Clear all jobs (emergency use only!)"""
        try:
            await redis_client.delete(self.queue_key)
            await redis_client.delete(self.processing_key)
            logger.warning("Queue cleared!")
            return True
        except Exception as e:
            logger.error(f"Failed to clear queue: {e}")
            return False

# =====================================================
# GLOBAL QUEUE INSTANCE
# =====================================================
queue_manager = QueueManager()