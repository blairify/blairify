# AI Service Setup Guide

## Overview
Blairify uses **Mistral AI** for interview chat and analysis features. To enable these features, you need to configure your Mistral API key.

## Quick Setup

### 1. Get Your Mistral API Key
1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key or copy your existing one

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Mistral API key:
   ```env
   MISTRAL_API_KEY="your_actual_api_key_here"
   ```

### 3. Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
# or
pnpm dev
```

## Features Enabled by AI Service

### ✅ Interview Chat
- Real-time AI interviewer responses
- Context-aware follow-up questions
- Adaptive difficulty based on responses

### ✅ Interview Analysis
- Detailed performance feedback
- Strengths and improvement areas
- Pass/Fail decision with reasoning
- Personalized recommendations

## Troubleshooting

### Issue: "AI service not configured" error

**Symptoms:**
- Interview chat shows fallback responses
- Analysis fails or shows mock data
- Console shows "MISTRAL_API_KEY is not configured" error

**Solution:**
1. Verify `.env` file exists in project root
2. Check that `MISTRAL_API_KEY` is set correctly
3. Ensure no extra spaces or quotes in the API key
4. Restart your development server

### Issue: "Rate limit exceeded" error

**Symptoms:**
- Requests fail with 429 status code
- Error message mentions rate limiting

**Solution:**
- Wait a few moments before trying again
- The system automatically retries with exponential backoff
- Consider upgrading your Mistral AI plan for higher limits

### Issue: "Service tier capacity exceeded" error

**Symptoms:**
- Requests fail intermittently
- Error mentions capacity issues

**Solution:**
- The system will automatically fall back to mock responses
- Wait and try again later
- This is typically temporary during high usage periods

## API Key Security

⚠️ **Important Security Notes:**

1. **Never commit `.env` file to version control**
   - `.env` is already in `.gitignore`
   - Only commit `.env.example` with placeholder values

2. **Keep your API key private**
   - Don't share your API key publicly
   - Don't include it in screenshots or logs
   - Rotate keys if accidentally exposed

3. **Use environment-specific keys**
   - Use different keys for development and production
   - Set production keys via hosting platform's environment variables

## Cost Management

Mistral AI charges based on API usage:
- Monitor your usage in the [Mistral Console](https://console.mistral.ai/)
- Set up billing alerts to avoid unexpected charges
- Consider implementing rate limiting for production

## Alternative AI Providers (Future)

Currently, Blairify uses Mistral AI exclusively. Future versions may support:
- OpenAI (GPT-4)
- Anthropic (Claude)
- Google AI (Gemini)
- AWS Bedrock

## Support

If you continue experiencing issues:
1. Check the browser console for detailed error messages
2. Check the terminal/server logs for backend errors
3. Verify your API key is valid in the Mistral Console
4. Contact support with error details

## Development Mode

For development without an API key:
- The system will use fallback responses for chat
- Mock analysis will be generated for completed interviews
- All features will work but with simulated AI responses
