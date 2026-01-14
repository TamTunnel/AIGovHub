# AI Governance Hub - AI Features Setup

## Quick Start with AI Features

### 1. Get Gemini API Key

```bash
# Get a free API key from Google AI Studio
# https://aistudio.google.com/app/apikey
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set:
# ENABLE_AI_FEATURES=true
# GEMINI_API_KEY=your_actual_key_here
```

### 3. Install Dependencies

```bash
pip3 install -r requirements.txt
```

### 4. Start Backend

```bash
uvicorn app.main:app --reload
```

The AI features will now be available!

## AI Features

### 🤖 AI Risk Assessor

- **Where**: Register New Model page
- **What**: Click "Get AI Suggestion" to receive automated risk assessment
- **Uses**: Gemini 2.0 Flash for EU AI Act classification

### 🔍 Policy Compliance Check

- **API**: `POST /api/v1/ai/check-compliance`
- **What**: Reviews models against active policies

### 📝 Description Quality

- **API**: `POST /api/v1/ai/improve-description`
- **What**: Suggests governance documentation improvements

## Configuration

All AI features are **optional** and controlled via environment variables:

```bash
# Enable/disable AI features
ENABLE_AI_FEATURES=true|false

# Gemini API configuration
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash-exp  # Default: latest Flash model

# Caching (optional)
AI_CACHE_TTL_SECONDS=3600  # Cache AI responses for 1 hour
```

## Security

- ✅ No hardcoded API keys
- ✅ Graceful degradation (app works without AI)
- ✅ Rate limiting on AI endpoints
- ✅ Input sanitization
- ✅ No PII sent to Gemini

## Troubleshooting

**AI features not working?**

1. Check `ENABLE_AI_FEATURES=true` in backend `.env`
2. Verify `GEMINI_API_KEY` is set
3. Check backend logs for errors
4. Test endpoint: `curl http://localhost:8000/api/v1/ai/config`

**503 Service Unavailable?**

- AI features are disabled in backend configuration

**500 Internal Server Error?**

- Check API key validity
- Review backend logs for Gemini API errors
