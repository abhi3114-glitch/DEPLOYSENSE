import fs from 'fs/promises';
import path from 'path';

export interface ProjectInfo {
  language: string;
  framework?: string;
  packageManager?: string;
  startCommand?: string;
  port?: number;
}

export async function detectProject(repoPath: string): Promise<ProjectInfo> {
  try {
    const files = await fs.readdir(repoPath);

    // Check for Node.js
    if (files.includes('package.json')) {
      const packageJson = JSON.parse(
        await fs.readFile(path.join(repoPath, 'package.json'), 'utf-8')
      );

      let framework = 'Node.js';
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps.express) framework = 'Express';
      else if (deps.next) framework = 'Next.js';
      else if (deps.react) framework = 'React';
      else if (deps.vue) framework = 'Vue';
      else if (deps['@nestjs/core']) framework = 'NestJS';

      return {
        language: 'Node.js',
        framework,
        packageManager: files.includes('package-lock.json') ? 'npm' : files.includes('yarn.lock') ? 'yarn' : 'npm',
        startCommand: packageJson.scripts?.start || 'node index.js',
        port: 3000,
      };
    }

    // Check for Python
    if (files.includes('requirements.txt') || files.includes('pyproject.toml')) {
      let framework = 'Python';

      if (files.includes('requirements.txt')) {
        const requirements = await fs.readFile(path.join(repoPath, 'requirements.txt'), 'utf-8');
        if (requirements.includes('flask')) framework = 'Flask';
        else if (requirements.includes('django')) framework = 'Django';
        else if (requirements.includes('fastapi')) framework = 'FastAPI';
      }

      return {
        language: 'Python',
        framework,
        startCommand: 'python app.py',
        port: 5000,
      };
    }

    // Default fallback
    return {
      language: 'Unknown',
      framework: 'Unknown',
      port: 3000,
    };
  } catch (error: any) {
    throw new Error(`Failed to detect project: ${error.message}`);
  }
}