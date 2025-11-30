import Docker from 'dockerode';
import axios from 'axios';
import { ProjectInfo } from './detector.service';

const docker = new Docker();

export async function buildAndRunContainer(
  repoPath: string,
  deploymentId: string,
  projectInfo: ProjectInfo
): Promise<{ containerId: string; port: number; url: string }> {
  try {
    const imageName = `deploysense-${deploymentId}`;
    const containerPort = projectInfo.port || 3000;
    const hostPort = 3000 + Math.floor(Math.random() * 10000); // Random port

    // Build image
    const stream = await docker.buildImage(
      {
        context: repoPath,
        src: ['.'],
      },
      {
        t: imageName,
      }
    );

    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err, res) => (err ? reject(err) : resolve(res)));
    });

    // Run container
    const container = await docker.createContainer({
      Image: imageName,
      ExposedPorts: {
        [`${containerPort}/tcp`]: {},
      },
      HostConfig: {
        PortBindings: {
          [`${containerPort}/tcp`]: [{ HostPort: hostPort.toString() }],
        },
        NetworkMode: process.env.DOCKER_NETWORK || 'bridge',
      },
    });

    await container.start();

    // Wait for container to be ready
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return {
      containerId: container.id,
      port: hostPort,
      url: `http://localhost:${hostPort}`,
    };
  } catch (error: any) {
    throw new Error(`Failed to build/run container: ${error.message}`);
  }
}

export async function performHealthCheck(url: string): Promise<{
  success: boolean;
  statusCode?: number;
  responseTime?: number;
}> {
  try {
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true,
    });
    const responseTime = Date.now() - startTime;

    return {
      success: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      responseTime,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 0,
      responseTime: 0,
    };
  }
}

export async function performLoadTest(url: string): Promise<{
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
}> {
  const totalRequests = 50;
  const latencies: number[] = [];
  let successfulRequests = 0;
  let failedRequests = 0;

  for (let i = 0; i < totalRequests; i++) {
    try {
      const startTime = Date.now();
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true,
      });
      const latency = Date.now() - startTime;

      latencies.push(latency);

      if (response.status >= 200 && response.status < 300) {
        successfulRequests++;
      } else {
        failedRequests++;
      }
    } catch (error) {
      failedRequests++;
      latencies.push(5000); // Timeout value
    }
  }

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    averageLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    minLatency: Math.min(...latencies),
    maxLatency: Math.max(...latencies),
  };
}

export async function stopContainer(containerId: string): Promise<void> {
  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    await container.remove();
  } catch (error: any) {
    console.error(`Failed to stop container ${containerId}:`, error.message);
  }
}