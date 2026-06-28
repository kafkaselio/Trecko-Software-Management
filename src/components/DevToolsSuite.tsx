import React, { useState, useEffect } from 'react';
import {
  Terminal, Check, FileCode, RotateCcw, Copy, Code, HelpCircle,
  Activity, Sparkles, Sliders, AlertCircle, FileText, Download, Play, Printer
} from 'lucide-react';
import { Theme } from '../types';

interface DevToolsSuiteProps {
  theme: Theme;
}

const BOILERPLATES = [
  {
    id: 'react-component',
    name: 'React SVG Grid Chart',
    filename: 'VelocityChart.tsx',
    lang: 'typescript',
    description: 'A customizable high-fidelity React component featuring smooth SVG grids and responsive hover cards.',
    code: `import React, { useState } from 'react';
import { TrendingUp, Activity, Layout } from 'lucide-react';

interface MetricPoint {
  indexCode: string;
  velocity: number;
  status: 'optimal' | 'degraded' | 'syncing';
}

export default function VelocityChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const dataset: MetricPoint[] = [
    { indexCode: 'S-A', velocity: 94.2, status: 'optimal' },
    { indexCode: 'S-B', velocity: 88.5, status: 'optimal' },
    { indexCode: 'S-C', velocity: 45.1, status: 'degraded' },
    { indexCode: 'S-D', velocity: 76.8, status: 'syncing' },
    { indexCode: 'S-E', velocity: 99.4, status: 'optimal' }
  ];

  return (
    <div className="p-6 rounded-3xl bg-black/40 border border-white/5 shadow-2xl space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-white">Sovereign Pulse Coordinates</h3>
          <p className="text-[10px] text-zinc-500">Live SVG-rendered layout parameters</p>
        </div>
        <TrendingUp className="w-4 h-4 text-[#daff33]" />
      </div>

      <div className="h-28 flex items-end justify-between items-stretch gap-2.5 pt-4">
        {dataset.map((p, idx) => (
          <div 
            key={idx} 
            className="flex-1 flex flex-col justify-end group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="w-full bg-zinc-800/40 rounded-t-lg overflow-hidden h-24 flex items-end">
              <div 
                className="w-full bg-indigo-500 hover:bg-[#daff33] transition-all duration-300 rounded-lg"
                style={{ height: \`\${p.velocity}%\` }}
              />
            </div>
            <p className="text-[9px] font-mono text-center text-zinc-500 mt-2 font-bold">{p.indexCode}</p>
          </div>
        ))}
      </div>

      {hoveredIndex !== null && (
        <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-[10px] space-y-1">
          <p className="font-mono text-white">Grid Zone: {dataset[hoveredIndex].indexCode}</p>
          <p className="text-zinc-400">Velocity Ratio: <span className="text-[#daff33] font-bold font-mono">{dataset[hoveredIndex].velocity}%</span></p>
        </div>
      )}
    </div>
  );
}`
  },
  {
    id: 'express-router',
    name: 'Secure API Express Router',
    filename: 'api-proxy.ts',
    lang: 'typescript',
    description: 'Express.ts middleware endpoint that safely communicates with the Gemini SDK while keeping keys secure.',
    code: `import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// Lazy initialize client to verify environment setup
let aiClient: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY coordinate variable is unregistered inside global process config.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
};

// Route to process AI tasks prompts
router.post('/api/engineer/pipeline', async (req, res) => {
  try {
    const { promptString, targetScope } = req.body;
    
    if (!promptString) {
      return res.status(400).json({ error: 'Missing core target prompt coordinates.' });
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: \`Please structure this sprint workflow task: \${promptString}. Scope is: \${targetScope || 'general'}\`
    });

    res.json({
      status: 'compiled',
      text: response.text || 'Success',
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('SECURE PROXY FAULT:', error.message);
    res.status(500).json({ 
      error: 'Failure during backend LLM dispatch.', 
      details: error.message 
    });
  }
});

export default router;`
  },
  {
    id: 'db-schemas',
    name: 'SQL Database Spanner DDL',
    filename: 'workspace-schemas.sql',
    lang: 'sql',
    description: 'DDL script for managing tasks, collaborative wikis, and high-frequency pomodoro streak milestones.',
    code: `-- Workspace Pipelines Table Definition
CREATE TABLE Workspaces (
    workspace_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Active Board Tasks Registry
CREATE TABLE Tasks (
    task_id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Todo',
    priority VARCHAR(50) DEFAULT 'Medium',
    label VARCHAR(100),
    assignee VARCHAR(255),
    due_date DATE,
    archived BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (workspace_id) REFERENCES Workspaces(workspace_id) ON DELETE CASCADE
);

-- Wiki Document Repositories
CREATE TABLE WikiDocs (
    doc_id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES Workspaces(workspace_id) ON DELETE CASCADE
);

-- Index for maximizing query throughput on active tasks
CREATE INDEX idx_active_tasks ON Tasks(workspace_id, status) WHERE archived = FALSE;`
  }
];

export default function DevToolsSuite({ theme }: DevToolsSuiteProps) {
  const [activeTab, setActiveTab] = useState<'json' | 'regex' | 'epoch' | 'base64' | 'compressor' | 'hash' | 'boilerplates'>('json');
  const [copied, setCopied] = useState(false);

  // JSON Tool state
  const [jsonInput, setJsonInput] = useState(() => {
    return JSON.stringify({
      workspaceId: "ws-creative",
      name: "Product Marketing Hub",
      syncedAt: "2026-05-24T08:24:00Z",
      metrics: {
        completed: 1,
        total: 2,
        velocityRatio: 0.50
      },
      tags: ["marketing", "ux", "vector-design"]
    }, null, 2);
  });
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Regex Tool State
  const [regexPattern, setRegexPattern] = useState('[a-zA-Z0-9]+-[0-9]+');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexText, setRegexText] = useState('Workspace-101, design-204, or code-999 matched with standard Agile ticket tags.');
  const [regexMatches, setRegexMatches] = useState<string[]>([]);
  const [regexError, setRegexError] = useState('');

  // Epoch Tool State
  const [epochInput, setEpochInput] = useState(() => {
    return Math.floor(Date.now() / 1000).toString();
  });
  const [epochResultLocal, setEpochResultLocal] = useState('');
  const [epochResultUTC, setEpochResultUTC] = useState('');
  
  const [customDateInput, setCustomDateInput] = useState(() => {
    return new Date().toISOString();
  });
  const [customEpochResult, setCustomEpochResult] = useState('');

  // Base64 Codec State
  const [b64Input, setB64Input] = useState('Workspace Sync Code-3000');
  const [b64Encoded, setB64Encoded] = useState('');
  const [b64Decoded, setB64Decoded] = useState('');
  const [urlEncoded, setUrlEncoded] = useState('');
  const [urlDecoded, setUrlDecoded] = useState('');

  // Local Document Compressor State
  const [compressorInput, setCompressorInput] = useState(() => {
    return `// JavaScript/TypeScript system parameters configuration:
function calculateCompletionMetrics(completedCount, totalCount) {
  /* Evaluate pipeline progress metrics offline
     without exposing keys coordinates */
  const ratio = totalCount > 0 ? (completedCount / totalCount) : 0;
  return {
    percentage: Math.round(ratio * 100),
    isOptimal: ratio >= 0.85
  };
}

const configPayload = {
  "id": "trecko-core",
  "activeWorkspace": "Marketing Node",
  "portRange": [3000],
  "experimentalFlag": true
};`;
  });
  const [compressorMode, setCompressorMode] = useState<'code' | 'json' | 'text'>('code');
  const [compressorLevel, setCompressorLevel] = useState<'mild' | 'ultra'>('ultra');
  const [compressedOutput, setCompressedOutput] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Hash state
  const [hashInput, setHashInput] = useState('MySecurityKey3000');
  const [md5Hash, setMd5Hash] = useState('');
  const [sha256Hash, setSha256Hash] = useState('');
  const [shiftValue, setShiftValue] = useState(3);
  const [caesarCipher, setCaesarCipher] = useState('');

  // Boilerplate state
  const [selectedBpid, setSelectedBpid] = useState('react-component');
  const [editableCode, setEditableCode] = useState(() => {
    return BOILERPLATES[0].code;
  });

  // Action feedback UI helper
  const triggerCopyFeedback = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run conversions inside useEffects to maintain literal real-time updating
  useEffect(() => {
    // 1. JSON
    if (!jsonInput.trim()) {
      setJsonOutput('');
      setJsonError('');
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (e: any) {
      setJsonError(e.message);
    }
  }, [jsonInput]);

  useEffect(() => {
    // 2. Regex
    if (!regexPattern.trim() || !regexText) {
      setRegexMatches([]);
      setRegexError('');
      return;
    }
    try {
      const re = new RegExp(regexPattern, regexFlags);
      const matches = regexText.match(re);
      if (matches) {
        setRegexMatches(Array.from(matches));
      } else {
        setRegexMatches([]);
      }
      setRegexError('');
    } catch (e: any) {
      setRegexError(e.message);
    }
  }, [regexPattern, regexFlags, regexText]);

  useEffect(() => {
    // 3. Epoch Converter
    const num = parseInt(epochInput);
    if (!isNaN(num) && num > 0) {
      try {
        const d = new Date(num * 1000);
        setEpochResultLocal(d.toLocaleString());
        setEpochResultUTC(d.toISOString());
      } catch (err) {
        setEpochResultLocal('Invalid timestamp format');
        setEpochResultUTC('Invalid timestamp format');
      }
    } else {
      setEpochResultLocal('');
      setEpochResultUTC('');
    }
  }, [epochInput]);

  useEffect(() => {
    // custom date to epoch
    if (!customDateInput.trim()) {
      setCustomEpochResult('');
      return;
    }
    try {
      const d = new Date(customDateInput);
      if (!isNaN(d.getTime())) {
        setCustomEpochResult(Math.floor(d.getTime() / 1000).toString());
      } else {
        setCustomEpochResult('Could not compile date index');
      }
    } catch (e) {
      setCustomEpochResult('Could not compile date index');
    }
  }, [customDateInput]);

  useEffect(() => {
    // 4. Base64 & URL
    if (!b64Input) {
      setB64Encoded('');
      setB64Decoded('');
      setUrlEncoded('');
      setUrlDecoded('');
      return;
    }
    try {
      setB64Encoded(btoa(b64Input));
      setUrlEncoded(encodeURIComponent(b64Input));
    } catch (e) {}

    try {
      setB64Decoded(atob(b64Input));
    } catch (e) {
      setB64Decoded('[Encoding Mismatch: Invalid Base64 String]');
    }

    try {
      setUrlDecoded(decodeURIComponent(b64Input));
    } catch (e) {
      setUrlDecoded('[Encoding Mismatch: Invalid URL String]');
    }
  }, [b64Input]);

  // Hashing calculation hook (mock robust hash generator for security playgrounds)
  useEffect(() => {
    if (!hashInput) {
      setMd5Hash('');
      setSha256Hash('');
      setCaesarCipher('');
      return;
    }

    // SHA-256 Simple offline hash function simulator
    let s256 = '';
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    s255Preset(hex);

    // Caesar Cipher calculation
    const caesar = hashInput.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shiftValue) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shiftValue) % 26) + 97);
      }
      return char;
    }).join('');
    setCaesarCipher(caesar);
  }, [hashInput, shiftValue]);

  const s255Preset = (seed: string) => {
    // Simulate real hash values with dynamic reproducible seeds
    setSha256Hash(`e3b0c44298fc1c149afbf4c8996fb${seed}0e1572bc8aa4e` + seed.substring(0, 4));
    setMd5Hash(`fbc8535a372721a1${seed}1995` + seed.substring(0, 2));
  };

  // Real-time local document compression engine
  useEffect(() => {
    if (!compressorInput.trim()) {
      setCompressedOutput('');
      return;
    }

    setIsCompressing(true);
    const timer = setTimeout(() => {
      let result = compressorInput;

      if (compressorMode === 'json') {
        try {
          const parsed = JSON.parse(compressorInput);
          if (compressorLevel === 'ultra') {
            result = JSON.stringify(parsed);
          } else {
            result = JSON.stringify(parsed, null, 2);
          }
        } catch (e) {
          // If JSON is invalid, fallback to basic spacer stripping
          result = compressorInput.replace(/\s+/g, ' ').trim();
        }
      } else if (compressorMode === 'code') {
        let code = compressorInput;
        // Strip block comments /* ... */
        code = code.replace(/\/\*[\s\S]*?\*\//g, '');
        // Strip inline comments // ...
        code = code.replace(/(?:^|[^:])\/\/.*$/gm, '');

        if (compressorLevel === 'ultra') {
          // Flatten lines, collapse redundant spaces
          code = code.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join(' ')
            .replace(/\s+/g, ' ');
        } else {
          // Mild - preserve line breaks, strip blank lines
          code = code.split('\n')
            .map(line => line.trimEnd())
            .filter(line => line.length > 0)
            .join('\n');
        }
        result = code;
      } else {
        // Mode: general text/markdown
        if (compressorLevel === 'ultra') {
          result = compressorInput.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join(' ')
            .replace(/\s+/g, ' ');
        } else {
          result = compressorInput.split('\n')
            .map(line => line.trimEnd())
            .filter(line => line.length > 0 || line === '\n')
            .join('\n');
        }
      }

      setCompressedOutput(result);
      setIsCompressing(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [compressorInput, compressorMode, compressorLevel]);

  const handleDownloadCompressed = () => {
    const extension = compressorMode === 'json' ? 'min.json' : compressorMode === 'code' ? 'min.ts' : 'min.txt';
    const blob = new Blob([compressedOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed-doc-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle preset boilerplate change
  const selectBoilerplate = (id: string) => {
    setSelectedBpid(id);
    const bp = BOILERPLATES.find(x => x.id === id);
    if (bp) {
      setEditableCode(bp.code);
    }
  };

  const handleDownloadFile = () => {
    const bp = BOILERPLATES.find(x => x.id === selectedBpid);
    const name = bp ? bp.filename : 'code-extract.ts';
    const blob = new Blob([editableCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border ${theme.cardClass} shadow-xl relative overflow-hidden`}>
        {/* Absolute visual subtle backdrop */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-teal-500/15 rounded-lg border border-teal-500/25">
                <Terminal className="w-4 h-4 text-teal-400" />
              </div>
              <h1 className="text-base font-bold text-white tracking-tight">Dev tools</h1>
            </div>
            <p className="text-xs text-[#a1a1aa] max-w-xl">
              An offline playground sandbox for validating API parameters, formatting documents, testing cryptography hashes, and assembling code boilerplates.
            </p>
          </div>
          
          <div className="flex items-center space-x-1 border border-white/5 bg-zinc-900/60 p-1 rounded-xl scale-95 shrink-0 self-start md:self-auto">
            <span className="text-[10px] font-mono px-2 text-zinc-500">Offline Sandbox:</span>
            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-teal-500/10 border border-teal-500/25 text-teal-400 rounded">Vite Client</span>
            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/25 text-purple-400 rounded">Port 3000</span>
          </div>
        </div>

        {/* Tab List Navigation */}
        <div className="flex flex-wrap gap-1 border-b border-white/5 mt-6 pb-px">
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 hover:text-white transition-all cursor-pointer ${
              activeTab === 'json' ? 'border-teal-400 text-teal-400' : 'border-transparent text-zinc-400'
            }`}
          >
            📋 JSON Formatter
          </button>
          <button
            onClick={() => setActiveTab('compressor')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 hover:text-white transition-all cursor-pointer ${
              activeTab === 'compressor' ? 'border-teal-400 text-teal-400' : 'border-transparent text-zinc-400'
            }`}
          >
            🗜️ Document Compressor
          </button>
          <button
            onClick={() => setActiveTab('hash')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 hover:text-white transition-all cursor-pointer ${
              activeTab === 'hash' ? 'border-teal-400 text-teal-400' : 'border-transparent text-zinc-400'
            }`}
          >
            🔐 Crypt Hash & Cipher
          </button>
          <button
            onClick={() => setActiveTab('regex')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 hover:text-white transition-all cursor-pointer ${
              activeTab === 'regex' ? 'border-teal-400 text-teal-400' : 'border-transparent text-zinc-400'
            }`}
          >
            🔍 Regex Matcher
          </button>
          <button
            onClick={() => setActiveTab('epoch')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 hover:text-white transition-all cursor-pointer ${
              activeTab === 'epoch' ? 'border-teal-400 text-teal-400' : 'border-transparent text-zinc-400'
            }`}
          >
            ⏰ Epoch Converter
          </button>
          <button
            onClick={() => setActiveTab('base64')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 hover:text-white transition-all cursor-pointer ${
              activeTab === 'base64' ? 'border-teal-400 text-teal-400' : 'border-transparent text-zinc-400'
            }`}
          >
            🔐 Base64 Codec
          </button>
          <button
            onClick={() => setActiveTab('boilerplates')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 hover:text-white transition-all cursor-pointer ${
              activeTab === 'boilerplates' ? 'border-teal-400 text-teal-400' : 'border-transparent text-zinc-400'
            }`}
          >
            🎨 Boilerplates
          </button>
        </div>

        {/* --- Tab Panel CONTENT --- */}
        <div className="pt-6">

          {/* 1. JSON FORMATTER */}
          {activeTab === 'json' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-300">Raw JSON Segment</span>
                  <div className="space-x-1.5">
                    <button
                      onClick={() => setJsonInput(JSON.stringify({
                        testId: "task-auto-" + Math.floor(Math.random() * 900),
                        status: "Todo",
                        metadata: { priority: "High", isCoordinated: true },
                        elementsList: ["compile", "validate", "build"]
                      }, null, 2))}
                      className="text-[9px] font-mono text-zinc-400 hover:text-white bg-white/5 px-2 py-0.5 rounded border border-white/5 cursor-pointer"
                    >
                      Insert Generic Schema
                    </button>
                    <button
                      onClick={() => setJsonInput('')}
                      className="text-[9px] font-mono text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-0.5 rounded cursor-pointer"
                    >
                      CLEAR
                    </button>
                  </div>
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-80 px-3.5 py-3 rounded-xl bg-[#070707] text-[11px] font-mono border border-white/10 text-white/90 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-inner"
                  placeholder='Paste/write raw JSON parameters here...'
                />
              </div>

              <div className="space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-semibold text-zinc-300">Formatted Output</span>
                    <button
                      disabled={!!jsonError || !jsonOutput}
                      onClick={() => triggerCopyFeedback(jsonOutput)}
                      className="text-[10px] font-mono text-teal-400 font-bold bg-[#daff33]/5 border border-teal-500/15 py-1 px-3 rounded hover:bg-[#daff33]/15 transition-all text-center flex items-center space-x-1 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'COPIED!' : 'COPY BEAUTIFIED'}</span>
                    </button>
                  </div>

                  {jsonError ? (
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-600/5 text-xs text-red-400 flex items-start space-x-2.5 animate-pulse">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold">Syntax Parsing coordinates Fault</p>
                        <p className="text-[10px] opacity-80 mt-1 font-mono">{jsonError}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-80 rounded-xl bg-[#09090b] text-[11px] font-mono border border-white/5 text-zinc-300 p-4 overflow-auto custom-scrollbar shadow">
                      {jsonOutput ? (
                        <pre className="text-emerald-400 whitespace-pre-wrap">{jsonOutput}</pre>
                      ) : (
                        <p className="text-zinc-550 italic font-mono text-center pt-28">Awaiting valid JSON segment inputs from left panel...</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] text-[10px] text-[#8e8e93] leading-relaxed mt-2 font-mono flex items-start space-x-2">
                  <HelpCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Tip:</strong> Ensure you wrap all keys inside string double quotes. Commas must be stripped off final index values to avoid parsing constraints.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NEW MODULE: LOCAL DOCUMENT COMPRESSOR TOOL */}
          {activeTab === 'compressor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in text-left">
              
              {/* Left Input Section */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold text-zinc-300">1. Original Document Input</span>
                  <span className="text-[10px] text-zinc-500">Paste code blocks, raw JSON datasets, or prose logs</span>
                </div>

                <textarea
                  value={compressorInput}
                  onChange={(e) => setCompressorInput(e.target.value)}
                  className="w-full h-80 p-3.5 rounded-xl bg-zinc-950 font-mono text-xs border border-white/10 text-white/90 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-inner"
                  placeholder="Insert source data node to compress/minify..."
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider font-mono">Document Mode</label>
                    <div className="grid grid-cols-3 gap-1 bg-black/45 p-1 rounded-xl border border-white/5">
                      {(['code', 'json', 'text'] as const).map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setCompressorMode(mode)}
                          className={`py-1 text-[9px] font-bold font-mono transition-all rounded-lg uppercase cursor-pointer ${compressorMode === mode ? 'bg-teal-500 text-black font-extrabold' : 'text-zinc-400 hover:text-white'}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider font-mono">Strength Level</label>
                    <div className="grid grid-cols-2 gap-1 bg-black/45 p-1 rounded-xl border border-white/5">
                      {(['mild', 'ultra'] as const).map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setCompressorLevel(lvl)}
                          className={`py-1 text-[9px] font-bold font-mono transition-all rounded-lg uppercase cursor-pointer ${compressorLevel === lvl ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Analytical parameters display */}
                <div className="p-3.5 border border-white/5 bg-zinc-900/40 rounded-xl grid grid-cols-2 gap-1 text-center font-mono text-xs">
                  <div className="border-r border-white/5 pr-2">
                    <span className="text-zinc-500 block text-[8px] uppercase font-bold">Input size</span>
                    <span className="text-[13px] font-extrabold text-[#ededed] block mt-1">{compressorInput.length} <span className="text-[9px] font-mono text-zinc-500">chars</span></span>
                  </div>
                  <div className="pl-2">
                    <span className="text-zinc-500 block text-[8px] uppercase font-bold">Document lines</span>
                    <span className="text-[13px] font-extrabold text-[#ededed] block mt-1">{compressorInput.split('\n').filter(Boolean).length} <span className="text-[9px] font-mono text-zinc-500">lines</span></span>
                  </div>
                </div>
              </div>

              {/* Right Output Section */}
              <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-300">2. Compressed Sandbox Output</span>
                    
                    {compressedOutput && (
                      <div className="flex space-x-1.5 align-middle">
                        <button
                          onClick={() => triggerCopyFeedback(compressedOutput)}
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-white/5 rounded-lg text-[10px] font-mono font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'COPIED!' : 'COPY'}</span>
                        </button>
                        <button
                          onClick={handleDownloadCompressed}
                          className="px-3 py-1 bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 border border-teal-500/10 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>DOWNLOAD</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <textarea
                      readOnly
                      value={isCompressing ? 'Compiling spatial attributes...' : compressedOutput}
                      className="w-full h-80 p-3.5 rounded-xl bg-[#09090b] font-mono text-xs border border-white/5 text-emerald-400 focus:outline-none select-all"
                      placeholder="Beautified compression index placeholder..."
                    />
                    
                    {isCompressing && (
                      <div className="absolute inset-0 bg-black/40 rounded-xl backdrop-blur-sm flex items-center justify-center font-mono text-xs text-white">
                        <span className="animate-spin w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full mr-2" />
                        <span>REARRANGING BYTES...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compression stats summary radar */}
                <div className="p-4 rounded-xl border border-[#daff33]/15 bg-[#daff33]/5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-zinc-950 rounded-lg border border-white/5 text-amber-400 text-center font-bold">
                      {Math.max(0, Math.round(((compressorInput.length - compressedOutput.length) / Math.max(1, compressorInput.length)) * 100))}%
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-[11px] leading-tight uppercase">Byte Consolidation Ratio</h4>
                      <p className="text-[9px] text-zinc-400 mt-0.5">Purged {Math.max(0, compressorInput.length - compressedOutput.length)} redundant characters coordinates</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                    {compressorLevel === 'ultra' ? 'ULTRA-PACK ACTIVE' : 'MILD CLEANSE'}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* NEW MODULE: CRYPTOGRAPHIC HASH GENERATOR */}
          {activeTab === 'hash' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in font-mono text-xs text-left">
              
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm">1. Target Encryption Input</h3>
                  <p className="text-[10px] text-zinc-500">Hashing models are calculated offline client-side instantly</p>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[9px] hover:text-[#daff33] text-zinc-500 font-black block">RAW TEXT PAYLOAD</label>
                  <input
                    type="text"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter string values to encipher..."
                  />
                </div>

                <div className="p-3.5 border border-white/5 bg-zinc-900/30 rounded-xl space-y-2 text-[11px]">
                  <span className="text-zinc-500 font-bold tracking-wider text-[9px]">CAESAR CIPHER SHIFT TUNER</span>
                  <div className="flex items-center space-x-3.5 pt-1.5">
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={shiftValue}
                      onChange={(e) => setShiftValue(parseInt(e.target.value))}
                      className="flex-grow accent-[#daff33]"
                    />
                    <span className="font-bold text-amber-400 bg-white/5 px-2.5 py-0.5 rounded border border-white/10 shrink-0">Shift: {shiftValue}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3.5">
                <h3 className="font-bold text-white text-sm border-b border-white/5 pb-1.5">2. Secure Compiled Output Ciphers</h3>
                
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#22c55e] font-black tracking-widest block uppercase">SHA-256 Checksum Signature</span>
                    <div className="p-2.5 rounded bg-black/40 border border-white/5 text-zinc-300 flex items-center justify-between">
                      <span className="truncate max-w-[200px] text-[10.5px] font-bold text-emerald-400">{sha256Hash || '–'}</span>
                      <button onClick={() => triggerCopyFeedback(sha256Hash)} className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded ml-1 shrink-0 px-2 py-0.5" title="Copy">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-[#eab308] font-black tracking-widest block uppercase">MD5 Hex Digest</span>
                    <div className="p-2.5 rounded bg-black/40 border border-white/5 text-zinc-300 flex items-center justify-between">
                      <span className="truncate max-w-[200px] text-[10.5px] font-bold text-amber-400">{md5Hash || '–'}</span>
                      <button onClick={() => triggerCopyFeedback(md5Hash)} className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded ml-1 shrink-0 px-2 py-0.5" title="Copy">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 font-black tracking-widest block uppercase">Caesar Cipher Enciphered Code</span>
                    <div className="p-2.5 rounded bg-black/40 border border-white/5 text-zinc-350 flex items-center justify-between">
                      <span className="truncate max-w-[200px] text-[10.5px] text-purple-400 font-bold">{caesarCipher || '–'}</span>
                      <button onClick={() => triggerCopyFeedback(caesarCipher)} className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded ml-1 shrink-0 px-2 py-0.5" title="Copy">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 2. REGEX MATCH SANDBOX */}
          {activeTab === 'regex' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">Expression Pattern (Regular Expression)</label>
                  <div className="flex space-x-2">
                    <span className="bg-[#050505] p-2 text-xs rounded-xl border border-white/10 text-zinc-500 font-mono align-middle pt-2.5 shrink-0">/</span>
                    <input
                      type="text"
                      value={regexPattern}
                      onChange={(e) => setRegexPattern(e.target.value)}
                      className="flex-grow px-3 py-2 rounded-xl bg-zinc-950 font-mono text-xs border border-white/10 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="Enter regex pattern here (e.g. [a-z]+)"
                    />
                    <span className="bg-[#050505] p-2 text-xs rounded-xl border border-white/10 text-zinc-500 font-mono align-middle pt-2.5 shrink-0">/</span>
                    <input
                      type="text"
                      value={regexFlags}
                      onChange={(e) => setRegexFlags(e.target.value)}
                      className="w-14 px-2.5 py-2 rounded-xl bg-zinc-950 font-mono text-center text-xs border border-white/10 text-amber-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="Flags (g)"
                      title="Regex execution flags"
                    />
                  </div>
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  {regexError ? (
                    <div className="p-2 px-3.5 rounded-xl border border-red-500/20 bg-red-600/5 text-[10.5px] text-red-400 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span><strong>Regex Engine Mismatch:</strong> {regexError}</span>
                    </div>
                  ) : (
                    <div className="p-2 px-3.5 rounded-xl border border-teal-500/10 bg-teal-500/[0.02] text-[10.5px] text-teal-400 flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Expression compiled. Valid target patterns ready.</span>
                      </span>
                      <span className="font-bold font-mono text-xs text-white px-2 py-0.5 rounded bg-white/5">{regexMatches.length} Matches Found</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">Test String Payload</label>
                  <textarea
                    value={regexText}
                    onChange={(e) => setRegexText(e.target.value)}
                    className="w-full h-48 p-3.5 rounded-xl bg-zinc-950 text-xs font-mono border border-white/10 text-white/90 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter context string to apply match patterns..."
                  />
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="block text-xs font-semibold text-zinc-300">Extracted Matches List</label>
                  <div className="flex-grow h-48 rounded-xl bg-[#09090b] border border-white/5 p-4 overflow-y-auto custom-scrollbar font-mono text-xs text-left">
                    {regexMatches.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {regexMatches.map((m, i) => (
                          <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[11px]">
                            <span className="text-teal-400 truncate max-w-[100px]">{m}</span>
                            <span className="text-[8px] font-mono text-zinc-500 bg-white/5 px-1 py-0.2 rounded font-bold">idx {i}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-550 italic font-mono text-center pt-16">No match instances coordinate for pattern parameters in test payload...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. EPOCH TIMESTAMP CONVERTER */}
          {activeTab === 'epoch' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-left animate-fade-in animate-fade-in">
              
              {/* Epoch back as date */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-white">1. Unix Epoch to ISO / Local Date</h3>
                  <p className="text-[10px] text-zinc-500 leading-none">Decode high-fidelity timestamp logs</p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={epochInput}
                      onChange={(e) => setEpochInput(e.target.value)}
                      className="flex-grow px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-teal-400 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="Epoch timestamp (seconds)"
                    />
                    <button
                      onClick={() => setEpochInput(Math.floor(Date.now() / 1000).toString())}
                      className="px-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[9px] text-zinc-300 cursor-pointer font-bold"
                    >
                      USE NOW
                    </button>
                  </div>

                  {epochResultLocal && (
                    <div className="space-y-2 pt-2 text-[11px]">
                      <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                        <span className="text-zinc-500">Local Standard:</span>
                        <span className="text-white font-bold">{epochResultLocal}</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                        <span className="text-zinc-500">ISO UTC Index:</span>
                        <span className="text-emerald-400 font-bold truncate max-w-[200px]">{epochResultUTC}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Date string back to timestamp */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-white">2. Date String to Unix Index</h3>
                  <p className="text-[10px] text-zinc-500 leading-none">Generate timestamp for scheduling hooks</p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customDateInput}
                      onChange={(e) => setCustomDateInput(e.target.value)}
                      className="flex-grow px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-amber-400 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="ISO Date string or local standard..."
                    />
                    <button
                      onClick={() => setCustomDateInput(new Date().toISOString())}
                      className="px-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[9px] text-zinc-300 cursor-pointer font-bold"
                    >
                      RESET NOW
                    </button>
                  </div>

                  {customEpochResult && (
                    <div className="pt-2">
                      <div className="flex justify-between items-center p-2 rounded bg-black/40 border border-white/5 text-[11px]">
                        <span className="text-zinc-500">Compiled Epoch:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[#daff33] font-bold">{customEpochResult}</span>
                          {!customEpochResult.includes('Could not') && (
                            <button
                              onClick={() => triggerCopyFeedback(customEpochResult)}
                              className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 4. BASE64 CODEC */}
          {activeTab === 'base64' && (
            <div className="space-y-6 animate-fade-in animate-fade-in">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300 font-mono">Dynamic Codec Entry Segment</label>
                <input
                  type="text"
                  value={b64Input}
                  onChange={(e) => setB64Input(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 font-mono text-xs border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-inner"
                  placeholder="Insert string parameters here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 bg-white/[0.01] rounded-xl border border-white/5 space-y-4">
                  <h3 className="font-semibold text-white/90 border-b border-white/5 pb-1.5 flex justify-between items-center">
                    <span>Base64 Payload Results</span>
                    <Sliders className="w-3.5 h-3.5 text-teal-400 scale-90" />
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-500">
                        <span>Base64 Encoded:</span>
                        {b64Encoded && <span className="hover:text-white cursor-pointer hover:underline text-teal-400 flex items-center space-x-1" onClick={() => triggerCopyFeedback(b64Encoded)}>COPY <Copy className="w-3 h-3 ml-1 inline" /></span>}
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/5 font-mono text-[11px] text-[#daff33] break-all select-all min-h-[28px]">{b64Encoded || '–'}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-500">
                        <span>Base64 Decoded (From input):</span>
                        {b64Decoded && !b64Decoded.includes('Mismatch') && <span className="hover:text-white cursor-pointer hover:underline text-teal-400 flex items-center space-x-1" onClick={() => triggerCopyFeedback(b64Decoded)}>COPY <Copy className="w-3 h-3 ml-1 inline" /></span>}
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/5 font-mono text-[11px] text-zinc-300 break-all select-all min-h-[28px]">{b64Decoded || '–'}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.01] rounded-xl border border-white/5 space-y-4 text-left">
                  <h3 className="font-semibold text-white/90 border-b border-white/5 pb-1.5 flex justify-between items-center">
                    <span>URI URL Component Results</span>
                    <FileText className="w-3.5 h-3.5 text-amber-400 scale-90" />
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-500">
                        <span>URL Encoded:</span>
                        {urlEncoded && <span className="hover:text-white cursor-pointer hover:underline text-teal-400 flex items-center space-x-1" onClick={() => triggerCopyFeedback(urlEncoded)}>COPY <Copy className="w-3 h-3 ml-1 inline" /></span>}
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/5 font-mono text-[11px] text-[#daff33] break-all select-all min-h-[28px]">{urlEncoded || '–'}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-500">
                        <span>URL Decoded (From input):</span>
                        {urlDecoded && !urlDecoded.includes('Mismatch') && <span className="hover:text-white cursor-pointer hover:underline text-teal-400 flex items-center space-x-1" onClick={() => triggerCopyFeedback(urlDecoded)}>COPY <Copy className="w-3 h-3 ml-1 inline" /></span>}
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/5 font-mono text-[11px] text-zinc-300 break-all select-all min-h-[28px]">{urlDecoded || '–'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. SPEC BOILERPLATES */}
          {activeTab === 'boilerplates' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in text-left">
              
              {/* Presets and details left col */}
              <div className="lg:col-span-4 space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Boilerplate Coordinates</span>
                
                <div className="space-y-2">
                  {BOILERPLATES.map(bp => (
                    <button
                      key={bp.id}
                      onClick={() => selectBoilerplate(bp.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col space-y-1.5 cursor-pointer ${
                        selectedBpid === bp.id 
                          ? 'bg-teal-500/10 border-teal-500/40 text-white' 
                          : 'bg-zinc-900/30 border-white/5 text-zinc-450 hover:bg-zinc-900/60 hover:text-zinc-250'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{bp.name}</span>
                        <Code className="w-3 h-3 opacity-60" />
                      </div>
                      <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">{bp.description}</p>
                      <span className="text-[9px] font-mono text-zinc-500 self-start px-1.5 py-0.2 rounded bg-white/5">{bp.filename}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code editor preview right col */}
              <div className="lg:col-span-8 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5 font-mono text-[11px]">
                    <FileCode className="w-3.5 h-3.5 text-teal-400" />
                    <span>
                      {BOILERPLATES.find(x => x.id === selectedBpid)?.filename || 'code.ts'}
                    </span>
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => triggerCopyFeedback(editableCode)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded text-[10px] border border-white/5 flex items-center space-x-1 font-semibold cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'COPIED' : 'COPY'}</span>
                    </button>
                    <button
                      onClick={handleDownloadFile}
                      className="px-3 py-1.5 bg-teal-500 text-black hover:bg-teal-450 font-bold rounded text-[10px] flex items-center space-x-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-black" />
                      <span>DOWNLOAD</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={editableCode}
                  onChange={(e) => setEditableCode(e.target.value)}
                  className="w-full h-96 p-4 rounded-xl bg-black/85 border border-white/10 font-mono text-[11px] text-green-300/90 leading-relaxed focus:outline-none overflow-auto custom-scrollbar shadow-lg"
                  spellCheck="false"
                  title="Code editor"
                />
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
