# DeploySense – Auto Deployment Proof Generator

DeploySense is an automated deployment proof-of-concept generator that clones GitHub repositories, detects their technology stack, generates deployment configurations, and produces verifiable deployment certificates.

## Features

- 🚀 Automatic repository cloning and analysis
- 🔍 Smart language/framework detection (Node.js, Python)
- 🐳 Auto-generated Dockerfiles
- 📊 Health checks and load testing
- 📜 Signed deployment certificates
- 🎨 Modern React frontend with real-time status updates

## Architecture

```
deploysense/
├── backend/          # Express + TypeScript API
├── frontend/         # React + Vite + Tailwind
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 18+ and npm/pnpm
- Docker and Docker Compose
- Git
- Redis (via Docker)
- MongoDB (via Docker)

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/abhi3114-glitch/DEPLOYSENSE.git
cd DEPLOYSENSE
```

### 2. Environment Variables

Create `.env` file in the `backend` directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://mongodb:27017/deploysense

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CERTIFICATE_SECRET=your-certificate-signing-secret-change-in-production

# Docker
DOCKER_NETWORK=deploysense_network
```

Create `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3001
```

### 3. Start Services

```bash
# Start all services (backend, frontend, MongoDB, Redis)
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

## Usage

1. Open the frontend at http://localhost:5173
2. Enter a GitHub repository URL (e.g., `https://github.com/username/repo`)
3. Select deployment platform (currently "Local Docker" is fully implemented)
4. Click "Generate Deployment Proof"
5. Watch the real-time deployment progress
6. View logs, metrics, and generated certificate
7. Share the certificate URL with recruiters

## API Endpoints

### Deployments

- `POST /api/deployments` - Create new deployment
  ```json
  {
    "repo_url": "https://github.com/username/repo",
    "platform": "local"
  }
  ```

- `GET /api/deployments/:id` - Get deployment status and details

### Certificates

- `GET /api/certificates/:id` - Get certificate JSON data
- `GET /certificate/:id` - View certificate HTML page (shareable)

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Project Detection Logic

DeploySense automatically detects project types:

- **Node.js**: Presence of `package.json`
- **Python**: Presence of `requirements.txt` or `pyproject.toml`

## Generated Artifacts

For each deployment, DeploySense generates:

1. **Dockerfile** - Optimized for detected language/framework
2. **GitHub Actions YAML** - Basic CI/CD pipeline
3. **Deployment Logs** - Complete build and runtime logs
4. **Metrics Report** - Health check and load test results
5. **Signed Certificate** - Verifiable deployment proof with HMAC signature

## Example Generated Dockerfile (Node.js)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

## Health Check & Load Testing

- **Health Check**: GET request to `/` or `/health`, expects 2xx response
- **Load Test**: 50 sequential requests, measures:
  - Average latency
  - Success rate
  - Error count

## Certificate Verification

Each certificate includes:
- Unique certificate ID
- Deployment ID
- Timestamp
- Metrics (health check, load test results)
- HMAC-SHA256 signature

Recruiters can verify certificates at: `http://your-domain/certificate/:id`

## Technology Stack

### Backend
- Node.js + TypeScript
- Express.js
- MongoDB (Mongoose)
- BullMQ + Redis
- Docker SDK

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios
- React Router

### DevOps
- Docker & Docker Compose
- GitHub Actions (generated)
- Redis for job queue

## Troubleshooting

### Docker Issues

```bash
# Restart all services
docker-compose down && docker-compose up -d

# Clean Docker system
docker system prune -a
```

### Port Conflicts

If ports 3001, 5173, 27017, or 6379 are in use, modify `docker-compose.yml`

### MongoDB Connection Issues

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

## Future Enhancements

- [ ] Support for more languages (Go, Rust, Java)
- [ ] Integration with Render, Railway, Vercel APIs
- [ ] Advanced load testing scenarios
- [ ] Security scanning
- [ ] Performance profiling
- [ ] Multi-stage Docker builds
- [ ] Kubernetes deployment configs
- [ ] Real-time WebSocket updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your portfolio!

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for developers who want to showcase their deployment skills