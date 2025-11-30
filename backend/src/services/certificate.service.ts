import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import Certificate from '../models/certificate.model';
import Deployment from '../models/deployment.model';

export async function generateCertificate(deploymentId: string) {
  try {
    const deployment = await Deployment.findOne({ deploymentId });
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const certificateId = uuidv4();
    const issuedAt = new Date();

    // Create certificate data
    const certificateData = {
      certificate_id: certificateId,
      deployment_id: deploymentId,
      user_name: 'Anonymous Developer',
      repo_url: deployment.repoUrl,
      platform: deployment.platform,
      issued_at: issuedAt.toISOString(),
      metrics: deployment.metrics,
      detected_language: deployment.detectedLanguage,
      detected_framework: deployment.detectedFramework,
    };

    // Generate HMAC signature
    const secret = process.env.CERTIFICATE_SECRET || 'default-secret-change-me';
    const dataToSign = JSON.stringify(certificateData);
    const signature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');

    // Save certificate
    const certificate = await Certificate.create({
      certificateId,
      deploymentId,
      userName: 'Anonymous Developer',
      repoUrl: deployment.repoUrl,
      platform: deployment.platform,
      issuedAt,
      metrics: deployment.metrics,
      detectedLanguage: deployment.detectedLanguage,
      detectedFramework: deployment.detectedFramework,
      signature,
    });

    return certificate;
  } catch (error: any) {
    throw new Error(`Failed to generate certificate: ${error.message}`);
  }
}

export function verifyCertificate(certificateData: any, signature: string): boolean {
  const secret = process.env.CERTIFICATE_SECRET || 'default-secret-change-me';
  const dataToSign = JSON.stringify(certificateData);
  const expectedSignature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');
  return signature === expectedSignature;
}