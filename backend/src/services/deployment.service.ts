import path from 'path';
import fs from 'fs/promises';
import Deployment from '../models/deployment.model';
import { cloneRepository } from './git.service';
import { detectProject } from './detector.service';
import { generateDockerfile, generateCICDPipeline } from './generator.service';
import { buildAndRunContainer, performHealthCheck, performLoadTest, stopContainer } from './docker.service';
import { generateCertificate } from './certificate.service';

export async function processDeployment(deploymentId: string): Promise<void> {
  try {
    const deployment = await Deployment.findOne({ deploymentId });
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    // Step 1: Clone repository
    await updateDeploymentStatus(deploymentId, 'cloning', 'Cloning repository...');
    const repoPath = await cloneRepository(deployment.repoUrl, deploymentId);
    await addLog(deploymentId, 'info', `Repository cloned to ${repoPath}`);

    // Step 2: Detect project type
    await updateDeploymentStatus(deploymentId, 'detecting', 'Detecting project type...');
    const projectInfo = await detectProject(repoPath);
    await Deployment.findOneAndUpdate(
      { deploymentId },
      {
        detectedLanguage: projectInfo.language,
        detectedFramework: projectInfo.framework,
      }
    );
    await addLog(deploymentId, 'info', `Detected: ${projectInfo.language} ${projectInfo.framework ? `(${projectInfo.framework})` : ''}`);

    // Step 3: Generate artifacts
    await updateDeploymentStatus(deploymentId, 'generating', 'Generating Dockerfile and CI/CD pipeline...');
    const dockerfile = generateDockerfile(projectInfo);
    const cicdPipeline = generateCICDPipeline(projectInfo);
    
    // Save artifacts
    await fs.writeFile(path.join(repoPath, 'Dockerfile'), dockerfile);
    await fs.writeFile(path.join(repoPath, '.github/workflows/deploy.yml'), cicdPipeline);
    
    await Deployment.findOneAndUpdate(
      { deploymentId },
      {
        'artifacts.dockerfile': dockerfile,
        'artifacts.cicdPipeline': cicdPipeline,
      }
    );
    await addLog(deploymentId, 'info', 'Generated Dockerfile and CI/CD pipeline');

    // Step 4: Build and run container
    await updateDeploymentStatus(deploymentId, 'building', 'Building Docker image...');
    const containerInfo = await buildAndRunContainer(repoPath, deploymentId, projectInfo);
    await Deployment.findOneAndUpdate(
      { deploymentId },
      { containerInfo }
    );
    await addLog(deploymentId, 'info', `Container running at ${containerInfo.url}`);

    // Step 5: Perform tests
    await updateDeploymentStatus(deploymentId, 'testing', 'Running health checks and load tests...');
    
    // Health check
    const healthCheckResult = await performHealthCheck(containerInfo.url);
    await addLog(deploymentId, 'info', `Health check: ${healthCheckResult.success ? 'PASS' : 'FAIL'}`);
    
    // Load test
    const loadTestResult = await performLoadTest(containerInfo.url);
    await addLog(deploymentId, 'info', `Load test: ${loadTestResult.successfulRequests}/${loadTestResult.totalRequests} successful`);
    
    await Deployment.findOneAndUpdate(
      { deploymentId },
      {
        metrics: {
          healthCheck: healthCheckResult,
          loadTest: loadTestResult,
        },
      }
    );

    // Step 6: Generate certificate
    const certificate = await generateCertificate(deploymentId);
    await Deployment.findOneAndUpdate(
      { deploymentId },
      { certificateId: certificate.certificateId }
    );
    await addLog(deploymentId, 'info', `Certificate generated: ${certificate.certificateId}`);

    // Step 7: Complete
    await updateDeploymentStatus(deploymentId, 'completed', 'Deployment completed successfully!');
    
    // Cleanup: Stop container after a delay (optional)
    setTimeout(async () => {
      try {
        await stopContainer(containerInfo.containerId);
        console.log(`Container ${containerInfo.containerId} stopped`);
      } catch (error) {
        console.error('Error stopping container:', error);
      }
    }, 300000); // Stop after 5 minutes

  } catch (error: any) {
    console.error('Deployment error:', error);
    await updateDeploymentStatus(deploymentId, 'failed', `Deployment failed: ${error.message}`);
    await Deployment.findOneAndUpdate(
      { deploymentId },
      { error: error.message }
    );
  }
}

async function updateDeploymentStatus(deploymentId: string, status: string, message: string): Promise<void> {
  await Deployment.findOneAndUpdate(
    { deploymentId },
    { status }
  );
  await addLog(deploymentId, 'info', message);
}

async function addLog(deploymentId: string, level: 'info' | 'error' | 'warning', message: string): Promise<void> {
  await Deployment.findOneAndUpdate(
    { deploymentId },
    {
      $push: {
        logs: {
          timestamp: new Date(),
          level,
          message,
        },
      },
    }
  );
}