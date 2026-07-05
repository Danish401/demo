# Zoho Token Refresh Cron Job Setup

This document explains how to set up the automatic token refresh cron job.

## Overview

The cron job refreshes the Zoho access token and persists it when possible. The endpoint is at `/api/cron/refresh-token`.

**Vercel Hobby plan:** Cron jobs can run only **once per day**. The app is configured for a daily cron (`0 0 * * *` = midnight UTC). The access token also refreshes **on-demand** when any API call needs it and the cached token is expired, so the app works 24/7 without needing hourly cron.

## Setup Options

### Option 1: Vercel Cron (Hobby = once per day)

Cron is configured in `vercel.json` to run **once per day** so it works on the free Hobby plan:

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-token",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Steps:**
1. Deploy your application to Vercel
2. The cron runs once daily (midnight UTC)
3. Token is also refreshed on-demand when expired—no premium plan needed

**Security (Optional):**
Add a `CRON_SECRET` environment variable in Vercel:
- Go to your Vercel project settings
- Add environment variable: `CRON_SECRET` with a secure random string
- The cron endpoint will verify this secret for security

### Option 2: External Cron Service

Use any external cron service to call the endpoint:

**Services:**
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [Cronitor](https://cronitor.io)
- [UptimeRobot](https://uptimerobot.com)

**Configuration:**
- **URL:** `https://your-domain.com/api/cron/refresh-token`
- **Method:** GET or POST
- **Schedule:** e.g. once per day (`0 0 * * *`) for Hobby compatibility, or every hour (`0 * * * *`) if you use an external service
- **Headers (Optional):** `x-cron-secret: your-secret-key` (if CRON_SECRET is set)

### Option 3: Server Cron Job (Linux/Unix)

If you have server access, add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line (runs once per day at midnight)
0 0 * * * curl -X GET https://your-domain.com/api/cron/refresh-token
```

Or with secret header:
```bash
0 0 * * * curl -X GET -H "x-cron-secret: your-secret-key" https://your-domain.com/api/cron/refresh-token
```

### Option 4: Windows Task Scheduler

For Windows servers:

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: "Daily" (e.g. once per day)
4. Action: "Start a program"
5. Program: `curl.exe`
6. Arguments: `-X GET https://your-domain.com/api/cron/refresh-token`

## Environment Variables

Make sure these are set:

```env
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
CRON_SECRET=your_optional_secret_key  # Optional, for security
```

## Testing the Cron Endpoint

Test manually:

```bash
# Without secret
curl https://your-domain.com/api/cron/refresh-token

# With secret
curl -H "x-cron-secret: your-secret-key" https://your-domain.com/api/cron/refresh-token
```

Expected response:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "token_preview": "1000.abc123def456..."
}
```

## Monitoring

The cron job will:
- ✅ Refresh the token when it runs (e.g. once per day on Vercel Hobby)
- ✅ Clear old cache before refreshing
- ✅ Return success/error status
- ✅ Log timestamp for monitoring

**On-demand refresh:** When the cached token is expired, any API request that needs Zoho will trigger a refresh automatically, so the app stays working even with only a daily cron.

## Troubleshooting

**Error: "Unauthorized: Invalid cron secret"**
- Make sure `CRON_SECRET` environment variable matches the header value
- Or remove `CRON_SECRET` from environment if you don't want security check

**Error: "Missing Zoho env"**
- Ensure all Zoho environment variables are set correctly

**Token still expiring:**
- Check cron job is actually running (check logs)
- Verify the endpoint URL is correct
- Check network connectivity to Zoho API

## Schedule Format

- `0 0 * * *` = once per day at midnight UTC (Vercel Hobby–compatible)
- `0 * * * *` = every hour (requires Vercel Pro)

You can customize this in `vercel.json`; on Hobby, use at most one run per day.
