import mongoose, { Schema, Document } from 'mongoose';

export interface IDeployment extends Document {
  deploymentId: string;
  repoUrl: string;
  platform: 'local' | 'render';
  status: 'queued' | 'cloning' | 'detecting' | 'generating' | 'building' | 'testing' | 'completed' | 'failed';
  detectedLanguage?: string;
  detectedFramework?: string;
  logs: Array<{
    timestamp: Date;
    level: 'info' | 'error' | 'warning';
    message: string;
  }>;
  metrics?: {
    healthCheck: {
      success: boolean;
      statusCode?: number;
      responseTime?: number;
    };
    loadTest: {
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      averageLatency: number;
      minLatency: number;
      maxLatency: number;
    };
  };
  artifacts: {
    dockerfile?: string;
    cicdPipeline?: string;
  };
  containerInfo?: {
    containerId: string;
    port: number;
    url: string;
  };
  certificateId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeploymentSchema: Schema = new Schema(
  {
    deploymentId: { type: String, required: true, unique: true, index: true },
    repoUrl: { type: String, required: true },
    platform: { type: String, enum: ['local', 'render'], default: 'local' },
    status: {
      type: String,
      enum: ['queued', 'cloning', 'detecting', 'generating', 'building', 'testing', 'completed', 'failed'],
      default: 'queued',
    },
    detectedLanguage: String,
    detectedFramework: String,
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        level: { type: String, enum: ['info', 'error', 'warning'] },
        message: String,
      },
    ],
    metrics: {
      healthCheck: {
        success: Boolean,
        statusCode: Number,
        responseTime: Number,
      },
      loadTest: {
        totalRequests: Number,
        successfulRequests: Number,
        failedRequests: Number,
        averageLatency: Number,
        minLatency: Number,
        maxLatency: Number,
      },
    },
    artifacts: {
      dockerfile: String,
      cicdPipeline: String,
    },
    containerInfo: {
      containerId: String,
      port: Number,
      url: String,
    },
    certificateId: String,
    error: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDeployment>('Deployment', DeploymentSchema);