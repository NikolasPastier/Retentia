# YouTube Worker Service Setup Guide

This guide explains how to set up the external YouTube worker service that downloads audio from YouTube videos for transcription.

## Why an External Worker?

Vercel's serverless environment doesn't support running `yt-dlp` or `ffmpeg` directly. The worker service runs on AWS Lambda (or similar) where these tools can be installed and used to download YouTube audio.

## Architecture Flow

1. **Frontend** → Sends YouTube URL to Worker Service
2. **Worker Service** → Downloads audio using yt-dlp, uploads to S3
3. **Worker Service** → Returns S3 URL to Frontend  
4. **Frontend** → Sends S3 URL to Vercel API
5. **Vercel API** → Downloads audio, transcribes with Groq, generates questions

## Deployment Options

### Option 1: AWS Lambda with Serverless Framework (Recommended)

1. **Install Prerequisites**
   \`\`\`bash
   npm install -g serverless
   cd worker/
   npm install
   \`\`\`

2. **Configure Environment**
   \`\`\`bash
   # Set these environment variables
   export AWS_REGION=us-east-1
   export S3_BUCKET=your-bucket-name
   \`\`\`

3. **Deploy**
   \`\`\`bash
   serverless deploy
   \`\`\`

4. **Get Endpoint URL**
   After deployment, copy the endpoint URL and add it to your Vercel environment:
   \`\`\`
   NEXT_PUBLIC_YOUTUBE_WORKER_URL=https://abc123.execute-api.us-east-1.amazonaws.com/dev
   \`\`\`

### Option 2: AWS Lambda with Docker

1. **Build Container**
   \`\`\`bash
   cd worker/
   docker build -t youtube-worker .
   \`\`\`

2. **Push to ECR**
   \`\`\`bash
   # Create ECR repository
   aws ecr create-repository --repository-name youtube-worker
   
   # Get login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   # Tag and push
   docker tag youtube-worker:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/youtube-worker:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/youtube-worker:latest
   \`\`\`

3. **Create Lambda Function**
   \`\`\`bash
   aws lambda create-function \
     --function-name youtube-audio-worker \
     --package-type Image \
     --code ImageUri=<account-id>.dkr.ecr.us-east-1.amazonaws.com/youtube-worker:latest \
     --role arn:aws:iam::<account-id>:role/lambda-execution-role \
     --timeout 300 \
     --memory-size 1024
   \`\`\`

### Option 3: EC2 Instance (For High Volume)

1. **Launch EC2 Instance**
   - Use Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security group allowing HTTP/HTTPS

2. **Install Dependencies**
   \`\`\`bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Python and yt-dlp
   sudo apt install -y python3 python3-pip ffmpeg
   pip3 install yt-dlp
   
   # Install PM2 for process management
   sudo npm install -g pm2
   \`\`\`

3. **Deploy Application**
   \`\`\`bash
   # Clone your worker code
   git clone <your-repo>
   cd worker/
   npm install
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   \`\`\`

## AWS IAM Permissions

Your Lambda execution role needs these permissions:

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
\`\`\`

## S3 Bucket Configuration

1. **Create S3 Bucket**
   \`\`\`bash
   aws s3 mb s3://your-youtube-audio-bucket
   \`\`\`

2. **Set CORS Policy**
   \`\`\`json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   \`\`\`

3. **Set Lifecycle Policy** (Optional - Auto-delete old files)
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
   \`\`\`

## Environment Variables

### Worker Service Environment Variables
- `AWS_REGION`: Your AWS region (e.g., us-east-1)
- `S3_BUCKET`: Your S3 bucket name for audio storage

### Vercel Environment Variables
- `NEXT_PUBLIC_YOUTUBE_WORKER_URL`: Your deployed worker endpoint URL

## Testing the Worker

Test your deployed worker with curl:

\`\`\`bash
curl -X POST https://your-worker-url/api/download-audio \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ"}'
\`\`\`

Expected response:
\`\`\`json
{
  "success": true,
  "fileUrl": "https://bucket.s3.region.amazonaws.com/youtube/video-123.mp3"
}
\`\`\`

## Troubleshooting

### Common Issues

1. **"yt-dlp command not found"**
   - Ensure yt-dlp is installed in your Lambda layer or container
   - Check PATH environment variable

2. **"S3 upload failed"**
   - Verify IAM permissions for S3 PutObject
   - Check bucket name and region configuration

3. **"Video unavailable"**
   - Some videos are geo-restricted or private
   - Age-restricted videos may not be downloadable

4. **"File too large"**
   - Implement file size limits in your worker
   - Consider using lower quality audio formats

### Monitoring

- Check CloudWatch logs for Lambda functions
- Monitor S3 storage usage and costs
- Set up alerts for failed downloads

## Cost Optimization

- Use S3 lifecycle policies to auto-delete old files
- Consider using S3 Intelligent Tiering
- Monitor Lambda execution time and memory usage
- Use reserved capacity for high-volume usage

## Security Considerations

- Never expose your worker URL publicly without rate limiting
- Implement request validation and sanitization
- Use VPC endpoints for S3 access if needed
- Regularly rotate AWS access keys
