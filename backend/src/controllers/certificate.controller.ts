import { Request, Response } from 'express';
import Certificate from '../models/certificate.model';

export async function getCertificate(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findOne({ certificateId: id });

    if (!certificate) {
      res.status(404).json({ error: 'Certificate not found' });
      return;
    }

    res.json({
      certificate_id: certificate.certificateId,
      deployment_id: certificate.deploymentId,
      user_name: certificate.userName,
      repo_url: certificate.repoUrl,
      platform: certificate.platform,
      issued_at: certificate.issuedAt,
      metrics: certificate.metrics,
      detected_language: certificate.detectedLanguage,
      detected_framework: certificate.detectedFramework,
      signature: certificate.signature,
    });
  } catch (error: any) {
    console.error('Error getting certificate:', error);
    res.status(500).json({ error: error.message || 'Failed to get certificate' });
  }
}

export async function getCertificateHTML(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findOne({ certificateId: id });

    if (!certificate) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1>Certificate Not Found</h1>
          <p>The certificate you're looking for doesn't exist.</p>
        </body>
        </html>
      `);
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DeploySense Certificate - ${certificate.certificateId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
          .certificate {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
            padding: 60px 40px;
            position: relative;
            overflow: hidden;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 10px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 48px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #666;
            font-size: 18px;
          }
          .content {
            margin: 30px 0;
          }
          .field {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
          }
          .field-label {
            font-weight: bold;
            color: #667eea;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .field-value {
            color: #333;
            font-size: 16px;
            word-break: break-all;
          }
          .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 30px 0;
          }
          .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
          }
          .metric-label {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 5px;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
          }
          .signature {
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border: 2px dashed #667eea;
          }
          .signature-label {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
          }
          .signature-value {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #666;
            word-break: break-all;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #999;
            font-size: 14px;
          }
          .badge {
            display: inline-block;
            padding: 5px 15px;
            background: #28a745;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="logo">🚀 DeploySense</div>
            <div class="subtitle">Deployment Proof Certificate</div>
            <div class="badge">✓ VERIFIED</div>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="field-label">Certificate ID</div>
              <div class="field-value">${certificate.certificateId}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Developer</div>
              <div class="field-value">${certificate.userName}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Repository</div>
              <div class="field-value">${certificate.repoUrl}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Platform</div>
              <div class="field-value">${certificate.platform.toUpperCase()}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Technology Stack</div>
              <div class="field-value">${certificate.detectedLanguage || 'N/A'} ${certificate.detectedFramework ? `(${certificate.detectedFramework})` : ''}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Issued At</div>
              <div class="field-value">${new Date(certificate.issuedAt).toLocaleString()}</div>
            </div>
          </div>
          
          <div class="metrics">
            <div class="metric-card">
              <div class="metric-label">Health Check</div>
              <div class="metric-value">${certificate.metrics.healthCheck.success ? '✓ PASS' : '✗ FAIL'}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-label">Response Time</div>
              <div class="metric-value">${certificate.metrics.healthCheck.responseTime || 'N/A'}ms</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-label">Load Test Success</div>
              <div class="metric-value">${certificate.metrics.loadTest.successfulRequests}/${certificate.metrics.loadTest.totalRequests}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-label">Avg Latency</div>
              <div class="metric-value">${certificate.metrics.loadTest.averageLatency.toFixed(0)}ms</div>
            </div>
          </div>
          
          <div class="signature">
            <div class="signature-label">🔐 Digital Signature (HMAC-SHA256)</div>
            <div class="signature-value">${certificate.signature}</div>
          </div>
          
          <div class="footer">
            <p>This certificate verifies that the deployment was successfully completed and tested.</p>
            <p style="margin-top: 10px;">Deployment ID: ${certificate.deploymentId}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error: any) {
    console.error('Error getting certificate HTML:', error);
    res.status(500).send('Error loading certificate');
  }
}