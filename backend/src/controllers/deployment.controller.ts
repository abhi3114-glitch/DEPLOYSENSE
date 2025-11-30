import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Deployment from '../models/deployment.model';
import { deploymentQueue } from '../config/queue';

export async function createDeployment(req: Request, res: Response): Promise<void> {
  try {
    const { repo_url, platform = 'local' } = req.body;

    if (!repo_url) {
      res.status(400).json({ error: 'repo_url is required' });
      return;
    }

    // Validate GitHub URL
    if (!repo_url.includes('github.com')) {
      res.status(400).json({ error: 'Only GitHub repositories are supported' });
      return;
    }

    const deploymentId = uuidv4();

    // Create deployment record
    const deployment = await Deployment.create({
      deploymentId,
      repoUrl: repo_url,
      platform,
      status: 'queued',
      logs: [
        {
          timestamp: new Date(),
          level: 'info',
          message: 'Deployment queued',
        },
      ],
    });

    // Add to queue
    await deploymentQueue.add('process-deployment', {
      deploymentId,
    });

    res.status(201).json({
      deployment_id: deploymentId,
      status: 'queued',
    });
  } catch (error: any) {
    console.error('Error creating deployment:', error);
    res.status(500).json({ error: error.message || 'Failed to create deployment' });
  }
}

export async function getDeployment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const deployment = await Deployment.findOne({ deploymentId: id });

    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    res.json({
      deployment_id: deployment.deploymentId,
      repo_url: deployment.repoUrl,
      platform: deployment.platform,
      status: deployment.status,
      detected_language: deployment.detectedLanguage,
      detected_framework: deployment.detectedFramework,
      logs: deployment.logs,
      metrics: deployment.metrics,
      artifacts: deployment.artifacts,
      container_info: deployment.containerInfo,
      certificate_id: deployment.certificateId,
      error: deployment.error,
      created_at: deployment.createdAt,
      updated_at: deployment.updatedAt,
    });
  } catch (error: any) {
    console.error('Error getting deployment:', error);
    res.status(500).json({ error: error.message || 'Failed to get deployment' });
  }
}