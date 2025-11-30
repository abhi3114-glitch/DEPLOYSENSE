import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs/promises';

const DEPLOYMENTS_DIR = path.join(process.cwd(), 'deployments');

export async function cloneRepository(repoUrl: string, deploymentId: string): Promise<string> {
  try {
    // Ensure deployments directory exists
    await fs.mkdir(DEPLOYMENTS_DIR, { recursive: true });

    const repoPath = path.join(DEPLOYMENTS_DIR, deploymentId);
    
    // Clone repository
    const git = simpleGit();
    await git.clone(repoUrl, repoPath, ['--depth', '1']);

    return repoPath;
  } catch (error: any) {
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}