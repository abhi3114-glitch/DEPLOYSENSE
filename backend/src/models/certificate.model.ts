import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  certificateId: string;
  deploymentId: string;
  userName: string;
  repoUrl: string;
  platform: string;
  issuedAt: Date;
  metrics: {
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
    };
  };
  detectedLanguage?: string;
  detectedFramework?: string;
  signature: string;
  createdAt: Date;
}

const CertificateSchema: Schema = new Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    deploymentId: { type: String, required: true, index: true },
    userName: { type: String, default: 'Anonymous Developer' },
    repoUrl: { type: String, required: true },
    platform: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
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
      },
    },
    detectedLanguage: String,
    detectedFramework: String,
    signature: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICertificate>('Certificate', CertificateSchema);