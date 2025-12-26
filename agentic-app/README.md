## Agentic Publisher App

Autonomous marketing surface that generates long-form blog content with OpenAI and syndicates the results to Meta, Instagram, and LinkedIn.

### Local Development

```bash
npm install
npm run dev
```

Create a `.env.local` file with the values from `.env.example`. The UI persists platform credentials in `localStorage`; nothing is stored server-side.

### Automation Flow

1. Define topic, audience, tone, keywords, and call-to-action.
2. Provide platform tokens (Meta Page access token + Page ID, Instagram Graph token + Business ID, LinkedIn OAuth token + author URN).
3. Trigger a single run or enable the automation loop to re-run on a cadence.

The agent calls the `/api/agent/run` endpoint, which:

- Requests structured copy from OpenAI (`gpt-4.1-mini`).
- Posts to Meta using the Graph API `/feed` endpoint.
- Publishes to Instagram via the media container workflow.
- Dispatches to LinkedIn with the UGC Posts API.

Responses include per-platform result telemetry and are rendered in the UI.

### Production

Build with `npm run build` and deploy to Vercel. Configure `OPENAI_API_KEY` and optional `NEXT_PUBLIC_DEFAULT_MEDIA_URL` for Instagram fallback imagery in the Vercel project settings.
