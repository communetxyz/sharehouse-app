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

## Environment Setup

Before running the application, copy `.env.example` to `.env.local` and configure your environment variables:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_PRIVY_APP_ID` - Your Privy application ID for wallet authentication
- `NEXT_PUBLIC_ARBITRUM_RPC_URL` - Arbitrum RPC endpoint (defaults to public RPC)

**Important:** Never commit `.env.local` or any files containing sensitive keys to version control.

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
