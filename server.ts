import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function sanitizeText(value: unknown, maxLen = 2000): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function extractErrorMessage(err: unknown): { status: number; message: string } {
  if (err && typeof err === 'object') {
    const record = err as Record<string, unknown>;
    const rawMsg = typeof record.message === 'string' ? record.message : 'AI service request failed.';
    const status = typeof record.status === 'number' ? record.status : 500;
    if (rawMsg.includes('API_KEY_INVALID') || status === 400) {
      return { status: 400, message: 'Gemini API key appears invalid. Please verify it in Settings > Secrets.' };
    }
    if (rawMsg.includes('PERMISSION_DENIED') || status === 403) {
      return { status: 403, message: 'Gemini API permission denied. Please check your API key in Settings > Secrets.' };
    }
    if (rawMsg.includes('RESOURCE_EXHAUSTED') || status === 429) {
      return { status: 429, message: 'AI quota limit reached. Please retry shortly or check billing in Settings > Secrets.' };
    }
    return { status: status >= 400 && status < 600 ? status : 500, message: rawMsg };
  }
  return { status: 500, message: 'Unexpected error communicating with the AI service.' };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const configured = Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    );
    res.json({
      status: 'ok',
      aiConfigured: configured,
      model: MODEL_NAME,
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/ai/clinical-draft', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to generate live clinical drafts.',
      });
      return;
    }

    const clientName = sanitizeText(req.body?.clientName, 120);
    const assessmentTitle = sanitizeText(req.body?.assessmentTitle, 180);
    const domain = sanitizeText(req.body?.domain, 120);
    const scoreSummary = sanitizeText(req.body?.scoreSummary, 800);
    const historicalContext = sanitizeText(req.body?.historicalContext, 1000);
    const clinicianNotes = sanitizeText(req.body?.clinicianNotes, 1000);
    const language = sanitizeText(req.body?.language, 40) || 'English';
    const reportTone = sanitizeText(req.body?.reportTone, 40) || 'Clinical Summary';

    if (!assessmentTitle || !scoreSummary) {
      res.status(400).json({ error: 'Assessment title and score summary are required.' });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          `Prepare a structured psychological assessment draft in ${language} formatted as a ${reportTone}.`,
          `Client Reference: ${clientName || 'De-identified Client'}`,
          `Instrument: ${assessmentTitle} (${domain || 'Psychological Assessment'})`,
          `Observed Score Profile: ${scoreSummary}`,
          historicalContext ? `Longitudinal / Prior Sessions: ${historicalContext}` : '',
          clinicianNotes ? `Clinician Observations: ${clinicianNotes}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        config: {
          systemInstruction:
            'You are a clinical documentation assistant inside Pearl Counsellors. ' +
            'Strictly follow clinical safety boundaries: NEVER make an independent medical or psychiatric diagnosis, ' +
            'NEVER fabricate or alter numeric scores, and NEVER instruct medication changes. ' +
            'Summarize observed psychometric patterns clearly, compare against prior sessions if provided, ' +
            'suggest structured discussion points for the reviewing psychologist/counsellor, and include an explicit review reminder. ' +
            'Keep each section crisp, compassionate, and objective.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description: 'Concise 2-3 sentence natural-language overview of the assessment findings.',
              },
              scoreInterpretation: {
                type: Type.STRING,
                description: 'Objective breakdown of domain scores and severity bands without diagnosing.',
              },
              responsePatterns: {
                type: Type.STRING,
                description: 'Observed consistency, subscale elevation, or notable response patterns.',
              },
              longitudinalComparison: {
                type: Type.STRING,
                description: 'Comparison with prior baseline or follow-up sessions if historical data was provided.',
              },
              recommendedNextSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 actionable workflow or therapeutic discussion suggestions for the reviewing clinician.',
              },
              clinicalCautionNote: {
                type: Type.STRING,
                description: 'Clear non-diagnostic guardrail reminding that a qualified professional must review and sign off.',
              },
            },
            required: [
              'executiveSummary',
              'scoreInterpretation',
              'responsePatterns',
              'longitudinalComparison',
              'recommendedNextSteps',
              'clinicalCautionNote',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        draft: parsed,
        model: MODEL_NAME,
        generatedAt: new Date().toISOString(),
        language,
      });
    } catch (err) {
      const mapped = extractErrorMessage(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  app.post('/api/ai/org-insights', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to generate live organizational insights.',
      });
      return;
    }

    const organizationName = sanitizeText(req.body?.organizationName, 160);
    const organizationType = sanitizeText(req.body?.organizationType, 80);
    const cohortSummary = sanitizeText(req.body?.cohortSummary, 1600);
    const focusArea = sanitizeText(req.body?.focusArea, 120) || 'Cohort Wellbeing & Intervention Planning';

    if (!organizationName || !cohortSummary) {
      res.status(400).json({ error: 'Organization name and cohort metrics are required.' });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          `Analyze anonymized aggregate wellbeing metrics for ${organizationName} (${organizationType || 'Institution'}).`,
          `Focus Area: ${focusArea}`,
          `Aggregate Data: ${cohortSummary}`,
        ].join('\n'),
        config: {
          systemInstruction:
            'You are an organizational psychology and institutional wellbeing analyst for Pearl Counsellors. ' +
            'Analyze only de-identified aggregate cohort metrics. Never identify individuals. ' +
            'Provide grounded executive insights, risk-band shifts, and practical institutional program recommendations.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headlineFinding: { type: Type.STRING },
              trendAnalysis: { type: Type.STRING },
              departmentPriorities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              programRecommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              privacyComplianceNote: { type: Type.STRING },
            },
            required: [
              'headlineFinding',
              'trendAnalysis',
              'departmentPriorities',
              'programRecommendations',
              'privacyComplianceNote',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        insights: parsed,
        model: MODEL_NAME,
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      const mapped = extractErrorMessage(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to use the AI Assistant.',
      });
      return;
    }

    const query = sanitizeText(req.body?.query, 1200);
    const role = sanitizeText(req.body?.role, 80) || 'Platform Administrator';
    const contextCatalog = sanitizeText(req.body?.contextCatalog, 2000);

    if (!query) {
      res.status(400).json({ error: 'Please enter a question or workflow prompt.' });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          `Active User Role: ${role}`,
          contextCatalog ? `Available Assessment & Platform Context:\n${contextCatalog}` : '',
          `User Request: ${query}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
        config: {
          systemInstruction:
            'You are the Pearl Counsellors Workflow & Assessment Navigation Assistant. ' +
            'Help clinicians, administrators, institutions, and clients discover appropriate psychological domains/instruments, ' +
            'understand qualification tiers and licensing statuses (Licensed, Integrated, Pending, Demo-Only, Future), ' +
            'explain referral commission workflows, and recommend platform actions. ' +
            'NEVER provide medical diagnoses or therapy advice directly to clients. Keep answers structured, concise, and practical.',
        },
      });

      res.json({
        answer: response.text ?? 'No response generated.',
        model: MODEL_NAME,
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      const mapped = extractErrorMessage(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')));
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pearl Counsellors server running at http://localhost:${PORT}`);
  });
}

startServer();
