# Troubleshooting Guide

## AI Chat and Analysis Not Working

### Problem: Interview chat doesn't respond or shows fallback messages

**Root Cause:** The Mistral AI API key is not configured.

**Solution:**

1. **Get a Mistral API Key:**
   - Visit https://console.mistral.ai/
   - Sign up or log in
   - Create an API key

2. **Add to Environment Variables:**
   ```bash
   # Create .env file if it doesn't exist
   cp .env.example .env
   
   # Edit .env and add:
   MISTRAL_API_KEY="your_actual_api_key_here"
   ```

3. **Restart the Development Server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   # or
   pnpm dev
   ```

4. **Verify Setup:**
   - Check browser console for errors
   - Look for "❌ AI Service Error" messages
   - If configured correctly, you should see no API key errors

### Problem: Analysis fails after completing interview

**Symptoms:**
- "Analysis failed" error message
- Mock analysis is shown instead of real AI analysis
- Console shows "MISTRAL_API_KEY is not configured"

**Solution:** Same as above - configure the Mistral API key.

### Problem: Rate limit errors (429)

**Symptoms:**
- Intermittent failures
- "Rate limit exceeded" messages

**Solution:**
- Wait 1-2 minutes before retrying
- The system automatically retries with exponential backoff
- Consider upgrading your Mistral plan for higher limits

### Checking Logs

**Browser Console:**
```javascript
// Open browser DevTools (F12)
// Check Console tab for errors like:
// "❌ AI Service Error: MISTRAL_API_KEY is not configured"
```

**Server Terminal:**
```bash
# Look for error messages in the terminal where you run:
npm run dev
```

## Common Error Messages

### "AI service not configured - Missing MISTRAL_API_KEY"
- **Fix:** Add `MISTRAL_API_KEY` to your `.env` file
- **See:** AI_SETUP.md for detailed instructions

### "Analysis service not available"
- **Fix:** Configure Mistral API key
- **Note:** System will use mock analysis as fallback

### "Service tier capacity exceeded"
- **Fix:** Wait and retry - this is temporary
- **Note:** Mistral AI may be experiencing high load

### "Invalid API key configuration"
- **Fix:** Verify your API key is correct
- **Check:** No extra spaces or quotes in `.env` file
- **Test:** Try creating a new API key in Mistral Console

## Environment Setup Checklist

- [ ] `.env` file exists in project root
- [ ] `MISTRAL_API_KEY` is set in `.env`
- [ ] No extra spaces around the API key
- [ ] Development server has been restarted
- [ ] Browser has been refreshed
- [ ] No console errors about missing API key

## Still Having Issues?

1. **Check API Key Validity:**
   - Log into https://console.mistral.ai/
   - Verify the key is active
   - Check usage limits haven't been exceeded

2. **Verify Environment Variables:**
   ```bash
   # In your terminal, check if env var is loaded
   echo $MISTRAL_API_KEY
   ```

3. **Clear Cache:**
   - Clear browser cache
   - Restart development server
   - Try in incognito/private browsing mode

4. **Check Network:**
   - Ensure you have internet connectivity
   - Check if firewall is blocking API requests
   - Try from a different network

## Development Without API Key

If you want to develop without configuring the API key:
- ✅ Interview chat will use fallback responses
- ✅ Analysis will use mock data
- ✅ All UI features will work
- ❌ No real AI responses
- ❌ No personalized analysis

This is useful for:
- Frontend development
- UI/UX testing
- Demo purposes
