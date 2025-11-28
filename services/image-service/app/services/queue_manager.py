# ============================================================================
# FILE: app/services/queue_manager.py
# PURPOSE: Redis-based job queue with auto-cleanup
# COMMIT: feat: add queue manager with automatic job cleanup
# ============================================================================

import json
import uuid
import time
import logging
from typing import Optional, Dict, Any
from app.core.redis_client import redis_client
from app.core.config import settings

logger = logging.getLogger(__name__)

class JobStatus:
    """Job status constants"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class QueueManager:
    """Redis job queue with auto-cleanup"""
    
    def __init__(self):
        self.queue_key = f"queue:{settings.QUEUE_NAME}"
        self.job_prefix = "job:"
        self.result_prefix = "result:"
    
    async def enqueue(
        self,
        task_type: str,
        data: Dict[str, Any]
    ) -> str:
        """
        Add job to queue
        
        Returns:
            str: Job ID
        """
        
        job_id = str(uuid.uuid4())
        
        job_data = {
            "id": job_id,
            "type": task_type,
            "data": data,
            "status": JobStatus.PENDING,
            "created_at": time.time(),
            "attempts": 0
        }
        
        try:
            # Store job data (auto-expires)
            job_key = f"{self.job_prefix}{job_id}"
            await redis_client.set(
                job_key,
                json.dumps(job_data),
                ex=settings.QUEUE_JOB_TIMEOUT
            )
            
            # Add to queue
            await redis_client.lpush(self.queue_key, job_id)
            
            logger.info(f"Job enqueued: {job_id}")
            return job_id
            
        except Exception as e:
            logger.error(f"Enqueue failed: {e}")
            raise
    
    async def dequeue(self) -> Optional[Dict[str, Any]]:
        """
        Get next job from queue
        
        Returns:
            dict: Job data or None
        """
        
        try:
            # Pop from queue
            job_id = await redis_client.rpop(self.queue_key)
            
            if not job_id:
                return None
            
            # Get job data
            job_key = f"{self.job_prefix}{job_id}"
            job_data_str = await redis_client.get(job_key)
            
            if not job_data_str:
                logger.warning(f"Job data not found: {job_id}")
                return None
            
            job_data = json.loads(job_data_str)
            
            # Update status
            job_data["status"] = JobStatus.PROCESSING
            job_data["started_at"] = time.time()
            
            await redis_client.set(job_key, json.dumps(job_data))
            
            return job_data
            
        except Exception as e:
            logger.error(f"Dequeue failed: {e}")
            return None
    
    async def complete_job(
        self,
        job_id: str,
        result: Any
    ) -> bool:
        """Mark job as completed"""
        
        try:
            # Store result (auto-expires)
            result_key = f"{self.result_prefix}{job_id}"
            await redis_client.set(
                result_key,
                json.dumps(result),
                ex=settings.QUEUE_RESULT_TTL
            )
            
            # Delete job data (cleanup immediately)
            job_key = f"{self.job_prefix}{job_id}"
            await redis_client.delete(job_key)
            
            logger.info(f"Job completed: {job_id}")
            return True
            
        except Exception as e:
            logger.error(f"Complete job failed: {e}")
            return False
    
    async def fail_job(
        self,
        job_id: str,
        error: str
    ) -> bool:
        """Mark job as failed"""
        
        try:
            job_key = f"{self.job_prefix}{job_id}"
            job_data_str = await redis_client.get(job_key)
            
            if not job_data_str:
                return False
            
            job_data = json.loads(job_data_str)
            job_data["attempts"] += 1
            
            # Retry if under limit
            if job_data["attempts"] < settings.QUEUE_MAX_RETRIES:
                job_data["status"] = JobStatus.PENDING
                await redis_client.set(job_key, json.dumps(job_data))
                await redis_client.lpush(self.queue_key, job_id)
                logger.warning(f"Job retry {job_data['attempts']}: {job_id}")
            else:
                # Failed permanently - delete immediately
                await redis_client.delete(job_key)
                logger.error(f"Job failed: {job_id} - {error}")
            
            return True
            
        except Exception as e:
            logger.error(f"Fail job error: {e}")
            return False
    
    async def get_queue_size(self) -> int:
        """Get queue size"""
        try:
            return await redis_client.llen(self.queue_key)
        except:
            return 0

# Global instance
queue_manager = QueueManager()