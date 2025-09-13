# YouTube Audio Worker Service

This AWS Lambda function downloads YouTube audio and uploads it to S3 for processing by the main Vercel application.

## Setup

### Prerequisites
- AWS CLI configured
- Node.js 18+
- Docker (for container deployment)
- Serverless Framework (optional)

### Environment Variables
Set these in your Lambda function configuration:
- `AWS_REGION`: Your AWS region (e.g., us-east-1)
- `S3_BUCKET`: Your S3 bucket name for audio storage

### Deployment Options

#### Option 1: Serverless Framework
\`\`\`bash
npm install -g serverless
npm install
serverless deploy
\`\`\`

#### Option 2: Docker + AWS Lambda
\`\`\`bash
# Build and deploy container
docker build -t youtube-worker .
docker tag youtube-worker:latest <account-id>.dkr.ecr.<region>.amazonaws.com/youtube-worker:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/youtube-worker:latest

# Update Lambda function
aws lambda update-function-code \
  --function-name youtube-audio-worker \
  --image-uri <account-id>.dkr.ecr.<region>.amazonaws.com/youtube-worker:latest
\`\`\`

#### Option 3: ZIP Deployment
\`\`\`bash
npm install
zip -r youtube-worker.zip .
aws lambda update-function-code \
  --function-name youtube-audio-worker \
  --zip-file fileb://youtube-worker.zip
\`\`\`

### Lambda Configuration
- **Runtime**: Node.js 18.x
- **Memory**: 1024 MB (minimum for yt-dlp)
- **Timeout**: 5 minutes (300 seconds)
- **Architecture**: x86_64

### API Endpoint
Once deployed, your worker will be available at:
\`\`\`
POST https://<api-gateway-id>.execute-api.<region>.amazonaws.com/dev/api/download-audio
\`\`\`

### Usage
\`\`\`javascript
const response = await fetch('https://your-worker-endpoint/api/download-audio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
  })
});

const result = await response.json();
// { success: true, fileUrl: "https://bucket.s3.region.amazonaws.com/youtube/video-123.mp3" }
\`\`\`

### S3 Lifecycle Policy
Add this lifecycle rule to automatically clean up old audio files:
\`\`\`json
{
  "Rules": [
    {
      "ID": "DeleteYouTubeAudio",
      "Status": "Enabled",
      "Filter": { "Prefix": "youtube/" },
      "Expiration": { "Days": 7 }
    }
  ]
}
