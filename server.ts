/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK with User-Agent telemetry header as required by skills
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // In-memory files storage seeded with presets
  let serverFiles = [
    { id: 'f1', name: 'workspace-architecture.pdf', size: '2.4 MB', type: 'PDF Document', category: 'Document', tag: 'Infrastructure', dateAdded: 'May 12, 2026' },
    { id: 'f2', name: 'linear-dashboard-prototype.fig', size: '18.1 MB', type: 'Figma File', category: 'Design', tag: 'Design', dateAdded: 'May 18, 2026' },
    { id: 'f3', name: 'index-route-proxy.ts', size: '14 KB', type: 'TypeScript', category: 'Code', tag: 'Core', dateAdded: 'May 20, 2026' }
  ];

  // GET uploaded files List
  app.get('/api/files', (req, res) => {
    res.json(serverFiles);
  });

  // POST upload a document to server
  app.post('/api/files', (req, res) => {
    const { name, size, type, category, tag, contentBase64 } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    const newFile = {
      id: `f-srv-${Date.now()}`,
      name,
      size: size || '12 KB',
      type: type || 'Document',
      category: category || 'Document',
      tag: tag || 'Shared',
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      contentBase64: contentBase64 || ''
    };
    serverFiles.unshift(newFile);
    res.json(newFile);
  });

  // DELETE a document to server
  app.delete('/api/files/:id', (req, res) => {
    const { id } = req.params;
    serverFiles = serverFiles.filter(item => item.id !== id);
    res.json({ success: true });
  });

  // Check API Key health
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // REST API: Standard Chat Route
  app.post('/api/gemini/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in environment.' });
    }

    try {
      // Reconstruct simple conversational chat using system instruction
      const chatOptions: any = {
        model: 'gemini-3.5-flash',
        config: {
          systemInstruction: `You are the core intelligence of a futuristic "Workspace OS" project management system. 
You act as a top-performance project manager, elite startup consultant, software lead, and helpful workplace agent. 
Respond in clean markdown, keep responses highly focused, clear, and actionable. 
Use short checklists and structured advice. Bold key terms and keep lists concise.`,
        }
      };

      // Direct message content or clean standard generateContent
      // Let's create a conversational prompt containing the history for simplicity and speed
      let promptText = '';
      if (history && Array.isArray(history)) {
        history.forEach((h: { sender: string; text: string }) => {
          promptText += `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}\n`;
        });
      }
      promptText += `User: ${message}\nAssistant:`;

      const response = await ai.models.generateContent({
        ...chatOptions,
        contents: promptText,
      });

      res.json({ text: response.text || "I'm sorry, I could not generate a response." });
    } catch (error: any) {
      console.error('Gemini Chat Error:', error);
      res.status(500).json({ error: error.message || 'Error executing Gemini' });
    }
  });

  // REST API: Intelligent Workspace Sprint Generator
  app.post('/api/gemini/generate-plan', async (req, res) => {
    const { title, description } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    try {
      const prompt = `Formulate an advanced project workspace plan with Kanban tasks, Notion-style wiki documentation, Slack messaging channels, and metrics widgets based on this request.
Title: ${title}
Description: ${description || "General startup workspace setup."}

Structure the response exactly to match the requirements.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            required: ['tasks', 'docs', 'channels', 'analyticsSuggestions'],
            properties: {
              tasks: {
                type: Type.ARRAY,
                description: 'Kanban tasks to build out this workspace',
                items: {
                  type: Type.OBJECT,
                  required: ['title', 'priority', 'status', 'label', 'description', 'assignee'],
                  properties: {
                    title: { type: Type.STRING },
                    priority: { type: Type.STRING, description: 'High, Medium, Low' },
                    status: { type: Type.STRING, description: 'Backlog, Todo, InProgress, Done' },
                    label: { type: Type.STRING, description: 'Engineering, Design, Marketing, Research, Launch' },
                    description: { type: Type.STRING },
                    assignee: { type: Type.STRING, description: 'Name of the mock assignee, e.g. Alex Chen, Elena Rostova, Marcus Vance' },
                  }
                }
              },
              docs: {
                type: Type.ARRAY,
                description: 'Documentation page templates to create in Notion-style wiki',
                items: {
                  type: Type.OBJECT,
                  required: ['title', 'content', 'category'],
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING, description: 'Rich high-fidelity Markdown text document detailing the plans, specs, or guides.' },
                    category: { type: Type.STRING, description: 'Specification, Overview, Meeting Minutes, Guide' },
                  }
                }
              },
              channels: {
                type: Type.ARRAY,
                description: 'Slack/Discord style channels and simulation chat messages',
                items: {
                  type: Type.OBJECT,
                  required: ['channelName', 'initialMessages'],
                  properties: {
                    channelName: { type: Type.STRING, description: 'lowercase-with-dashes name, e.g. kickoff-sprint' },
                    initialMessages: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ['sender', 'role', 'text', 'timeAgo'],
                        properties: {
                          sender: { type: Type.STRING },
                          role: { type: Type.STRING, description: 'e.g. Lead Designer, Software Engineer, Product Manager' },
                          text: { type: Type.STRING },
                          timeAgo: { type: Type.STRING, description: 'e.g. 2 hours ago' },
                        }
                      }
                    }
                  }
                }
              },
              analyticsSuggestions: {
                type: Type.ARRAY,
                description: 'Suggested widget ideas for the metrics graphs',
                items: {
                  type: Type.STRING,
                }
              }
            }
          }
        }
      });

      const responseText = response.text || '{}';
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error('Gemini Generate Plan Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate plan structure.' });
    }
  });

  // Client development setup via Vite Middleware OR standard static serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve client production assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Workspace Server] Modern OS Environment running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Workspace Setup Fail]', err);
});
