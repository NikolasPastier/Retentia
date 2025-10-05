# Shaders Hero Section

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nikolaspastiers-projects/v0-shaders-hero-section)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/ibcOKQuvil4)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Environment Variables

To use the media upload and transcription features, you need to set up the following environment variables in your Vercel Project Settings:

### Required for AI Transcription
- `GROQ_API_KEY` - Your Groq API key for Whisper transcription and question generation

### Required for S3 File Storage (Large Files > 8MB)
- `AWS_ACCESS_KEY_ID` - Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret access key  
- `S3_REGION` - Your S3 bucket region (e.g., `us-east-1`)
- `S3_BUCKET` - Your S3 bucket name
- `S3_PUBLIC_BASE_URL` - Your S3 public base URL (e.g., `https://your-bucket.s3.us-east-1.amazonaws.com`)

### How to Set Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with its corresponding value
4. Redeploy your application for changes to take effect

## Features

- **Audio/Video Upload**: Support for MP3, WAV, M4A, MP4, MOV files up to 100MB
- **Smart Upload Strategy**: 
  - Files ≤ 8MB: Direct upload via FormData
  - Files > 8MB: S3 presigned upload to bypass serverless limits
- **AI Transcription**: Uses Groq Whisper for accurate audio transcription
- **Question Generation**: AI-powered question generation from transcripts
- **Robust Error Handling**: Comprehensive error messages and fallback strategies

## Deployment

Your project is live at:

**[https://vercel.com/nikolaspastiers-projects/v0-shaders-hero-section](https://vercel.com/nikolaspastiers-projects/v0-shaders-hero-section)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/ibcOKQuvil4](https://v0.app/chat/projects/ibcOKQuvil4)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
