import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Log {
  timestamp: string;
  level: 'info' | 'error' | 'warning';
  message: string;
}

interface Deployment {
  deployment_id: string;
  repo_url: string;
  platform: string;
  status: string;
  detected_language?: string;
  detected_framework?: string;
  logs: Log[];
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
    };
  };
  artifacts?: {
    dockerfile?: string;
    cicdPipeline?: string;
  };
  container_info?: {
    url: string;
  };
  certificate_id?: string;
  error?: string;
}

const statusSteps = [
  { key: 'queued', label: 'Queued', icon: '📋' },
  { key: 'cloning', label: 'Cloning', icon: '📥' },
  { key: 'detecting', label: 'Detecting', icon: '🔍' },
  { key: 'generating', label: 'Generating', icon: '⚙️' },
  { key: 'building', label: 'Building', icon: '🏗️' },
  { key: 'testing', label: 'Testing', icon: '🧪' },
  { key: 'completed', label: 'Completed', icon: '✅' },
];

export default function DeploymentPage() {
  const { id } = useParams<{ id: string }>();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDeployment = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/deployments/${id}`);
        setDeployment(response.data);
        setLoading(false);

        // Poll if not completed or failed
        if (!['completed', 'failed'].includes(response.data.status)) {
          setTimeout(fetchDeployment, 3000);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch deployment');
        setLoading(false);
      }
    };

    fetchDeployment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading deployment...</p>
        </div>
      </div>
    );
  }

  if (error || !deployment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Deployment not found'}</p>
          <Link
            to="/"
            className="block w-full bg-primary-500 text-white text-center font-bold py-3 px-6 rounded-lg hover:bg-primary-600 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((step) => step.key === deployment.status);
  const isFailed = deployment.status === 'failed';
  const isCompleted = deployment.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-white hover:text-white/80 transition flex items-center">
            <span className="text-2xl mr-2">←</span>
            <span className="font-semibold">Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Deployment Status</h1>
          <div className="w-32"></div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Progress Timeline</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition ${
                    index <= currentStepIndex && !isFailed
                      ? 'bg-green-500 text-white'
                      : isFailed && index === currentStepIndex
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isFailed && index === currentStepIndex ? '❌' : step.icon}
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${
                    index <= currentStepIndex ? 'text-gray-800' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`h-1 w-full mt-6 transition ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    style={{ position: 'absolute', top: '24px', left: '50%', width: '100%', zIndex: -1 }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deployment Info */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Deployment Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Repository</p>
                <p className="font-mono text-sm text-gray-800 break-all">{deployment.repo_url}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Platform</p>
                <p className="font-semibold text-gray-800">{deployment.platform.toUpperCase()}</p>
              </div>
              {deployment.detected_language && (
                <div>
                  <p className="text-sm text-gray-600">Detected Stack</p>
                  <p className="font-semibold text-gray-800">
                    {deployment.detected_language}{' '}
                    {deployment.detected_framework && `(${deployment.detected_framework})`}
                  </p>
                </div>
              )}
              {deployment.container_info && (
                <div>
                  <p className="text-sm text-gray-600">Application URL</p>
                  <a
                    href={deployment.container_info.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-mono text-sm"
                  >
                    {deployment.container_info.url}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Logs</h2>
            <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
              {deployment.logs.map((log, index) => (
                <div key={index} className="mb-2">
                  <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span
                    className={`ml-2 ${
                      log.level === 'error'
                        ? 'text-red-400'
                        : log.level === 'warning'
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}
                  >
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className="ml-2 text-white">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics */}
        {deployment.metrics && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Health Check</p>
                <p className="text-2xl font-bold">
                  {deployment.metrics.healthCheck.success ? '✓ PASS' : '✗ FAIL'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Response Time</p>
                <p className="text-2xl font-bold">{deployment.metrics.healthCheck.responseTime || 0}ms</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    (deployment.metrics.loadTest.successfulRequests / deployment.metrics.loadTest.totalRequests) * 100
                  )}
                  %
                </p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Avg Latency</p>
                <p className="text-2xl font-bold">{Math.round(deployment.metrics.loadTest.averageLatency)}ms</p>
              </div>
            </div>
          </div>
        )}

        {/* Certificate */}
        {isCompleted && deployment.certificate_id && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎉 Deployment Certificate Generated!</h2>
            <p className="text-gray-600 mb-6">
              Your deployment has been successfully completed and certified. Share this certificate with recruiters!
            </p>
            <a
              href={`${API_URL}/certificate/${deployment.certificate_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-primary-500 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:from-primary-600 hover:to-purple-700 transition transform hover:scale-105"
            >
              View Certificate
            </a>
          </div>
        )}

        {/* Error */}
        {isFailed && deployment.error && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mt-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">❌ Deployment Failed</h2>
            <p className="text-gray-700">{deployment.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}