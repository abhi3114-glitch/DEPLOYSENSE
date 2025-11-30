import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function HomePage() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [platform, setPlatform] = useState<'local' | 'render'>('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/deployments`, {
        repo_url: repoUrl,
        platform,
      });

      navigate(`/deployment/${response.data.deployment_id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create deployment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            🚀 DeploySense
          </h1>
          <p className="text-2xl text-white/90">
            Auto Deployment Proof Generator
          </p>
          <p className="text-lg text-white/80 mt-2">
            Clone, Build, Test, and Certify Your Deployments
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Repository URL */}
            <div>
              <label htmlFor="repoUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                GitHub Repository URL
              </label>
              <input
                type="url"
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deployment Platform
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPlatform('local')}
                  className={`px-6 py-4 rounded-lg border-2 font-medium transition ${
                    platform === 'local'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                  }`}
                >
                  🐳 Local Docker
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('render')}
                  className={`px-6 py-4 rounded-lg border-2 font-medium transition ${
                    platform === 'render'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                  }`}
                >
                  ☁️ Render (Mock)
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-primary-600 hover:to-purple-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Deployment...
                </span>
              ) : (
                'Generate Deployment Proof'
              )}
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-8 border-t-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What DeploySense Does:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Automatically clones your GitHub repository</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Detects language and framework (Node.js, Python)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Generates optimized Dockerfile and CI/CD pipeline</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Builds and runs your application in Docker</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Performs health checks and load testing</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Generates signed deployment certificate</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/80">
          <p>Built with ❤️ for developers who want to showcase their deployment skills</p>
        </div>
      </div>
    </div>
  );
}