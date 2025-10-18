# CommuneOS frontend development

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/breadcoop/v0-commune-os-frontend-development)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/ho1yN6MlZke)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/breadcoop/v0-commune-os-frontend-development](https://vercel.com/breadcoop/v0-commune-os-frontend-development)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/ho1yN6MlZke](https://v0.app/chat/projects/ho1yN6MlZke)**

## Environment Variables

This project requires the following environment variables to be set in **Vercel Project Settings**:

### Required for all environments (Production, Preview, Development):

- `NEXT_PUBLIC_PRIVY_APP_ID` - Your Privy application ID
- `NEXT_PUBLIC_GNOSIS_RPC_URL` - Gnosis Chain RPC URL (e.g., from Alchemy)
- `NEXT_PUBLIC_MAINNET_RPC_URL` - Ethereum Mainnet RPC URL (e.g., from Alchemy)

### How to set environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable above
4. **Important**: Check all three boxes:
   - ✅ Production
   - ✅ Preview (required for PR deployments)
   - ✅ Development

**Note**: GitHub repository secrets are NOT used for Vercel builds. Environment variables must be set in Vercel's project settings.

### Local Development

For local development, create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_GNOSIS_RPC_URL=https://gnosis-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
```

See `.env.example` for a template.

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
