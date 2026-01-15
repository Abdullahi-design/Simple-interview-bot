# Fly.io Deployment Guide

## Prerequisites
1. Install Fly.io CLI: `curl -L https://fly.io/install.sh | sh`
2. Login to Fly.io: `flyctl auth login`

## Deployment Steps

### 1. Initialize Fly.io App (if not already done)
```bash
flyctl launch --no-deploy --name hire-overseases-test
```

### 2. Set Environment Variables
```bash
# Set OpenAI API Key
flyctl secrets set OPENAI_API_KEY=your-openai-api-key-here

# Verify secrets are set
flyctl secrets list
```

### 3. Deploy the Application
```bash
flyctl deploy
```

### 4. Open Your App
```bash
flyctl open
```

## Environment Variables Required

- `OPENAI_API_KEY` - Your OpenAI API key for chat, TTS, and Whisper

## Useful Commands

- View logs: `flyctl logs`
- Check status: `flyctl status`
- Scale app: `flyctl scale count 1`
- View secrets: `flyctl secrets list`
- Update secrets: `flyctl secrets set KEY=value`
