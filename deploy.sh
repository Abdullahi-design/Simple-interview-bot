#!/bin/bash

# Fly.io Deployment Script
# This script helps you deploy the application to Fly.io

echo "🚀 Fly.io Deployment Script"
echo "============================"
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Installing now..."
    curl -L https://fly.io/install.sh | sh
    export PATH="$HOME/.fly/bin:$PATH"
fi

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "🔐 Please login to Fly.io..."
    flyctl auth login
fi

echo ""
echo "📦 Setting up Fly.io app..."

# Launch app (creates fly.toml if needed, but we already have it)
flyctl launch --no-deploy --name hire-overseases-test 2>/dev/null || echo "App already exists or name taken"

echo ""
echo "🔑 Setting environment variables..."
echo "Please enter your OpenAI API key:"
read -s OPENAI_KEY

if [ -z "$OPENAI_KEY" ]; then
    echo "❌ OpenAI API key is required!"
    exit 1
fi

flyctl secrets set OPENAI_API_KEY="$OPENAI_KEY"

echo ""
echo "✅ Environment variables set!"
echo ""
echo "🚀 Deploying application..."
flyctl deploy

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Opening your app..."
flyctl open
