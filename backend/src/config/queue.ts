import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { processDeployment } from '../services/deployment.service';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const deploymentQueue = new Queue('deployments', { connection });

let worker: Worker | null = null;

export async function initializeQueue(): Promise<void> {
  worker = new Worker(
    'deployments',
    async (job: Job) => {
      console.log(`Processing deployment job ${job.id}`);
      await processDeployment(job.data.deploymentId);
    },
    { connection }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
  });

  console.log('✅ BullMQ worker initialized');
}

export async function closeQueue(): Promise<void> {
  if (worker) {
    await worker.close();
  }
  await deploymentQueue.close();
  await connection.quit();
}