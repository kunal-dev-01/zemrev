# =====================================================
# QUEUE WORKER
# =====================================================

import asyncio
import time
import logging
from typing import Dict, Any

from app.core.config import settings
from app.services.queue_manager import queue_manager, JobStatus
from app.services.converter import converter
from app.models.schemas import ConversionRequest

logger = logging.getLogger(__name__)

# =====================================================
# WORKER CLASS
# =====================================================
class QueueWorker:
    """Background worker for processing conversion jobs"""
    
    def __init__(self, worker_id: int):
        self.worker_id = worker_id
        self.is_running = False
        self.jobs_processed = 0
        self.jobs_failed = 0
    
    # =====================================================
    # JOB PROCESSING
    # =====================================================
    
    async def process_job(self, job_data: Dict[str, Any]) -> bool:
        """
        Process a single conversion job
        
        Args:
            job_data: Job information from queue
            
        Returns:
            bool: True if successful
        """
        job_id = job_data["id"]
        start_time = time.time()
        
        try:
            logger.info(f"Worker {self.worker_id} processing job: {job_id}")
            
            # Extract job data
            task_data = job_data["data"]
            content = task_data["content"].encode() if isinstance(task_data["content"], str) else task_data["content"]
            filename = task_data["filename"]
            options_dict = task_data["options"]
            
            # Create conversion options
            options = ConversionRequest(**options_dict)
            
            # Perform conversion
            output_buffer, new_filename = converter.convert(
                content,
                filename,
                options
            )
            
            # Calculate metrics
            execution_time = time.time() - start_time
            original_size = len(content)
            converted_size = len(output_buffer)
            compression_ratio = ((original_size - converted_size) / original_size) * 100
            
            # Prepare result
            result = {
                "filename": new_filename,
                "original_size": original_size,
                "converted_size": converted_size,
                "compression_ratio": compression_ratio,
                "execution_time": execution_time,
                "format": options.format
            }
            
            # Mark as completed
            await queue_manager.complete_job(job_id, result, execution_time)
            
            self.jobs_processed += 1
            logger.info(
                f"Worker {self.worker_id} completed job {job_id} in {execution_time:.2f}s "
                f"({compression_ratio:.1f}% compression)"
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Worker {self.worker_id} failed job {job_id}: {e}")
            await queue_manager.fail_job(job_id, str(e), retry=True)
            self.jobs_failed += 1
            return False
    
    # =====================================================
    # WORKER LIFECYCLE
    # =====================================================
    
    async def start(self):
        """Start worker loop"""
        self.is_running = True
        logger.info(f"Worker {self.worker_id} started")
        
        while self.is_running:
            try:
                # Get next job
                job_data = await queue_manager.dequeue()
                
                if job_data:
                    # Process job
                    await self.process_job(job_data)
                else:
                    # No jobs available, wait
                    await asyncio.sleep(1)
                    
            except Exception as e:
                logger.error(f"Worker {self.worker_id} error: {e}")
                await asyncio.sleep(5)  # Wait before retry
        
        logger.info(
            f"Worker {self.worker_id} stopped. "
            f"Processed: {self.jobs_processed}, Failed: {self.jobs_failed}"
        )
    
    async def stop(self):
        """Stop worker gracefully"""
        logger.info(f"Worker {self.worker_id} stopping...")
        self.is_running = False
    
    def get_stats(self) -> Dict[str, int]:
        """Get worker statistics"""
        return {
            "worker_id": self.worker_id,
            "is_running": self.is_running,
            "jobs_processed": self.jobs_processed,
            "jobs_failed": self.jobs_failed
        }

# =====================================================
# WORKER MANAGER
# =====================================================
class WorkerManager:
    """Manages multiple queue workers"""
    
    def __init__(self):
        self.workers = []
        self.tasks = []
    
    async def start_workers(self, num_workers: int = None):
        """Start multiple workers"""
        if num_workers is None:
            num_workers = settings.QUEUE_MAX_WORKERS
        
        logger.info(f"Starting {num_workers} queue workers...")
        
        for i in range(num_workers):
            worker = QueueWorker(worker_id=i+1)
            self.workers.append(worker)
            
            # Start worker in background
            task = asyncio.create_task(worker.start())
            self.tasks.append(task)
        
        logger.info(f"✅ {num_workers} workers started")
    
    async def stop_workers(self):
        """Stop all workers gracefully"""
        logger.info("Stopping all workers...")
        
        # Signal all workers to stop
        for worker in self.workers:
            await worker.stop()
        
        # Wait for all tasks to complete
        await asyncio.gather(*self.tasks, return_exceptions=True)
        
        # Clear lists
        self.workers.clear()
        self.tasks.clear()
        
        logger.info("✅ All workers stopped")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics for all workers"""
        return {
            "total_workers": len(self.workers),
            "workers": [worker.get_stats() for worker in self.workers]
        }

# =====================================================
# GLOBAL WORKER MANAGER
# =====================================================
worker_manager = WorkerManager()