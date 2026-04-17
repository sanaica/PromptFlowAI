import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const workspaceStyles = `
.workspace-layout {
  --panel-bg: rgba(20, 25, 40, 0.6);
  --panel-border: rgba(255, 255, 255, 0.08);
  --text-main: #ffffff;
  --text-dim: #9aa4b8;
  --accent-cyan: #00f0ff;
  --accent-pink: #ff007f;
  --accent-green: #38b000;
  
  width: 100vw;
  height: 100vh;
  background-color: #0b0e14;
  background-image: radial-gradient(circle at 50% 100%, #1a2536 0%, #0b0e14 100%);
  color: var(--text-main);
  font-family: 'Inter', -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--panel-border);
  background: rgba(11, 14, 20, 0.8);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.workspace-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
}

.logo-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #a030f0, #e040fb);
  border-radius: 4px;
}

.logo-icon.small {
  width: 18px;
  height: 18px;
}

.workspace-logo span { letter-spacing: -0.5px; }

.workspace-tabs {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 8px;
}

.workspace-tabs .tab {
  background: transparent;
  border: none;
  color: var(--text-dim);
  padding: 0.4rem 1.2rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.workspace-tabs .tab.active,
.workspace-tabs .tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
}

.workspace-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quick-access-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--panel-border);
  color: var(--text-dim);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.quick-access-btn:hover { background: rgba(255, 255, 255, 0.1); }

.profile-pic {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: url('https://i.pravatar.cc/150?img=11') center/cover;
  border: 1px solid var(--panel-border);
}

.workspace-main {
  display: grid;
  grid-template-columns: 240px 1fr 280px;
  gap: 1.2rem;
  padding: 1.2rem;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.media-bin-panel,
.status-log-panel {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.95rem;
  color: #e2e8f0;
}

.header-icons {
  display: flex;
  gap: 0.5rem;
  color: var(--text-dim);
  cursor: pointer;
}

.header-icons svg:hover { color: var(--text-main); }

/* ── Prompt History Sidebar ── */
.prompt-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prompt-history-list::-webkit-scrollbar { width: 4px; }
.prompt-history-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.prompt-history-item {
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  background: rgba(255, 255, 255, 0.02);
}

.prompt-history-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

.prompt-history-item.active {
  background: rgba(160, 48, 240, 0.15);
  border-color: rgba(160, 48, 240, 0.35);
}

.phi-number {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.25);
  margin-bottom: 0.25rem;
  font-family: monospace;
}

.phi-text {
  font-size: 0.78rem;
  color: var(--text-dim);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.phi-time {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.2);
  margin-top: 0.3rem;
}

.phi-has-video {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.62rem;
  color: var(--accent-cyan);
  margin-top: 0.3rem;
  opacity: 0.8;
}

.prompt-history-empty {
  padding: 1.5rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.8rem;
  line-height: 1.6;
}

/* ── Center Column ── */
.workspace-center {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  overflow: hidden;
  min-height: 0;
}

.glow-border-cyan-pink {
  position: relative;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(135deg, var(--accent-pink), #8a2be2, var(--accent-cyan));
  box-shadow: 0 0 15px rgba(255, 0, 127, 0.2), 0 0 15px rgba(0, 240, 255, 0.2);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.glow-border-purple {
  position: relative;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(135deg, #a030f0, #e040fb, #5030f0);
  box-shadow: 0 0 15px rgba(160, 48, 240, 0.2);
  display: flex;
  flex-direction: column;
  height: 200px;
  flex-shrink: 0;
}

.video-player-inner, .console-inner {
  background: #111520;
  border-radius: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.mock-video-frame {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  position: relative;
  min-height: 0;
}

.mock-video-bg {
  width: 100%;
  height: 100%;
  background: #1e2536;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.mock-video-bg::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1600&h=900');
  background-size: cover;
  background-position: center;
  opacity: 0.6;
}

.video-controls-bar {
  background: rgba(14, 18, 28, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.timeline-trail {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  width: 100%;
  cursor: pointer;
  position: relative;
  transition: height 0.1s;
}

.timeline-trail:hover { height: 6px; }

.timeline-thumb {
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 30%;
  box-shadow: 0 0 5px rgba(255,255,255,0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.timeline-trail:hover .timeline-thumb { opacity: 1; }

.timeline-trail::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  width: 30%;
  background: var(--accent-pink);
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem;
  color: var(--text-dim);
  position: relative;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 0 auto;
}

.playback-controls svg, .utility-controls svg {
  cursor: pointer;
  transition: color 0.2s;
}

.playback-controls svg:hover, .utility-controls svg:hover { color: white; }

.utility-controls {
  display: flex;
  gap: 1.2rem;
  position: absolute;
  right: 1.5rem;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-prompt-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.5rem 1.5rem;
  font-size: 0.95rem;
  color: white;
  resize: none;
  font-family: inherit;
  outline: none;
  line-height: 1.5;
}

.ai-prompt-input::placeholder { color: rgba(255, 255, 255, 0.3); }

.console-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem 1rem 1.5rem;
  flex-shrink: 0;
}

.console-footer-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-dim);
}

.console-footer-right svg { cursor: pointer; transition: color 0.2s; }
.console-footer-right svg:hover { color: white; }

.send-prompt-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.send-prompt-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255,255,255,0.3);
}

.btn-content { display: flex; align-items: center; gap: 0.6rem; }
.check-icon { color: var(--accent-green); font-weight: bold; }

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.btn-title { font-size: 0.85rem; font-weight: 500; }
.btn-subtitle { font-size: 0.65rem; color: var(--text-dim); }

/* Right Sidebar */
.status-content {
  padding: 1.2rem;
  flex: 1;
  overflow-y: auto;
}

.status-content::-webkit-scrollbar { width: 4px; }
.status-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.status-summary p { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 0.8rem; }

.progress-bar-container {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.progress-bar-fill { width: 40%; height: 100%; background: var(--accent-green); }

.status-list { display: flex; flex-direction: column; gap: 1rem; }

.status-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  font-size: 0.85rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.status-item:last-child { border-bottom: none; }
.status-check { color: var(--accent-green); font-weight: bold; }
.status-text { color: var(--text-dim); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Download a video from a public Supabase storage URL.
// The bucket is public so a plain fetch() is all that's needed —
// no signed URLs, no SDK auth token required.
async function downloadFromSupabase(rawUrl, supabaseClient) {
  if (!rawUrl) throw new Error('No URL provided.');

  // Extract bucket + path from the URL
  // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const match = rawUrl.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?|$)/);
  if (!match) throw new Error('Could not parse Supabase storage URL.');

  const bucket = match[1];  // e.g. "prompt_back"
  const filePath = decodeURIComponent(match[2]);  // e.g. "Final/Final_Render.mp4"

  // Create a signed URL valid for 60 seconds
  const { data, error } = await supabaseClient
    .storage
    .from(bucket)
    .createSignedUrl(filePath, 60);

  if (error) throw new Error(`Signed URL error: ${error.message}`);

  const resp = await fetch(data.signedUrl);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} — could not fetch video.`);

  const blob = await resp.blob();
  if (blob.size === 0) throw new Error('Downloaded file is empty.');

  const filename = filePath.split('/').pop();
  return new File([blob], filename, { type: blob.type || 'video/mp4' });
}

// ─── Toast notification component ────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem',
      pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          style={{
            padding: '0.75rem 1.1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontFamily: 'Inter, sans-serif',
            maxWidth: '340px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${t.type === 'error' ? 'rgba(255,71,87,0.4)' :
                t.type === 'warning' ? 'rgba(254,202,87,0.4)' :
                  'rgba(56,176,0,0.4)'
              }`,
            background: `${t.type === 'error' ? 'rgba(255,71,87,0.15)' :
                t.type === 'warning' ? 'rgba(254,202,87,0.12)' :
                  'rgba(56,176,0,0.12)'
              }`,
            color: `${t.type === 'error' ? '#ff6b7a' :
                t.type === 'warning' ? '#feca57' :
                  '#7ed957'
              }`,
          }}
        >
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>
            {t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : '✓'}
          </span>
          <span style={{ lineHeight: 1.4 }}>{t.message}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
function Workspace() {
  const navigate = useNavigate();
  const location = useLocation();

  const project = location.state?.project || {};
  const projectName = project.title || 'Untitled Project';
  const width = project.width || 1920;
  const height = project.height || 1080;

  const initialVideoUrl = location.state?.initialVideoUrl || null;
  const initialIteration = location.state?.iterationId || null;

  // ── Core state ──
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState(null);       // local File object (new uploads)
  const [previewUrl, setPreviewUrl] = useState(null);   // what the <video> plays

  // originalInputUrl — set ONCE (first upload or on project open). Never changes.
  // This is always the source video sent to n8n as input.
  const [originalInputUrl, setOriginalInputUrl] = useState(null);

  // currentOutputUrl — updated every time n8n completes. Shown in player.
  const [currentOutputUrl, setCurrentOutputUrl] = useState(null);

  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const [mode, setMode] = useState('General Effects (AI Assistant)');
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([
    { type: 'success', text: 'System ready.' },
    { type: 'success', text: `Project: ${projectName} (${width}×${height})` },
  ]);

  // Prompt history
  const [promptHistory, setPromptHistory] = useState([]);
  const [activeIterationId, setActiveIterationId] = useState(initialIteration);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const fileInputRef = useRef(null);
  const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/generate-vfx';

  // ── Helpers ──
  const addLog = (type, text) =>
    setLogs((prev) => [{ type, text }, ...prev].slice(0, 10));

  const showToast = (type, message, duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };

  // loadVideo: download from public Supabase URL → File → blob URL for player.
  // isOutput = true means this is an n8n result; don't overwrite originalInputUrl.
  const loadVideo = async (rawUrl, isOutput = false) => {
    if (!rawUrl) return;
    setVideoLoading(true);
    setVideoError(false);
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);

    try {
      addLog('loading', isOutput ? 'Loading output video…' : 'Downloading source video…');
      const fileObj = await downloadFromSupabase(rawUrl, supabase);
      const sizeMB = (fileObj.size / 1024 / 1024).toFixed(1);
      const blobUrl = URL.createObjectURL(fileObj);

      setFile(fileObj);
      setPreviewUrl(blobUrl);

      if (isOutput) {
        // Output from n8n — update what's displayed but keep the original input locked
        setCurrentOutputUrl(rawUrl);
        addLog('success', `Output ready: "${fileObj.name}" (${sizeMB} MB)`);
      } else {
        // First load (project open or new upload from storage) — lock in as original input
        setOriginalInputUrl((prev) => prev || rawUrl);
        setCurrentOutputUrl(null);
        addLog('success', `Source video ready: "${fileObj.name}" (${sizeMB} MB)`);
      }
    } catch (err) {
      setVideoError(true);
      addLog('error', `Download failed: ${err.message}`);
      showToast('error', `Could not load video: ${err.message}`, 7000);
    } finally {
      setVideoLoading(false);
    }
  };

  // On mount: load the initial video passed from Dashboard
  useEffect(() => {
    if (initialVideoUrl) {
      addLog('loading', 'Fetching video from storage…');
      loadVideo(initialVideoUrl);
    }
  }, []); // eslint-disable-line

  // Realtime: listen for n8n writing output_video_url back to the iterations table.
  // When the assistant row is inserted/updated, load the output into the player.
  useEffect(() => {
    if (!project.id) return;

    const channel = supabase
      .channel(`iterations:${project.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'iterations',
          filter: `project_id=eq.${project.id}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row) return;

          // 1. Update the history list so the new row appears in the sidebar
          setPromptHistory((prev) => {
            const exists = prev.find((r) => r.id === row.id);
            if (exists) return prev.map((r) => r.id === row.id ? { ...r, ...row } : r);
            // If it's a new row (n8n just created it), put it at the top
            return [row, ...prev];
          });

          // 2. If n8n just created this 'assistant' row with the video, LOAD IT
          if (row.role === 'assistant' && row.output_video_url) {
            addLog('success', '🎬 Nexus: New iteration created!');
            showToast('success', 'Your edited video is ready!', 5000);

            setActiveIterationId(row.id);

            // CRITICAL: Use a cache-buster even for new rows to ensure 
            // the video element reloads if the filename is reused
            const finalUrl = `${row.output_video_url}?t=${Date.now()}`;
            loadVideo(finalUrl, true);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') addLog('success', 'Listening for n8n output…');
        if (status === 'CHANNEL_ERROR') addLog('error', 'Realtime connection failed.');
      });

    return () => supabase.removeChannel(channel);
  }, [project.id]); // eslint-disable-line

  // Load prompt history for this project
  useEffect(() => {
    if (!project.id) return;
    const fetch = async () => {
      setHistoryLoading(true);
      const { data, error } = await supabase
        .from('iterations')
        .select('id, prompt, output_video_url, input_video_url, role, status, created_at')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) {
        addLog('error', `History fetch failed: ${error.message}`);
        showToast('error', `Could not load prompt history: ${error.message}`);
      } else {
        setPromptHistory(data || []);
      }
      setHistoryLoading(false);
    };
    fetch();
  }, [project.id]); // eslint-disable-line

  // Local file upload
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    // Validate type
    if (!f.type.startsWith('video/')) {
      showToast('error', 'Please upload a valid video file (mp4, mov, etc.)');
      return;
    }
    // Warn if very large (>500 MB)
    if (f.size > 500 * 1024 * 1024) {
      showToast('warning', `Large file (${(f.size / 1024 / 1024).toFixed(0)} MB). Upload may be slow.`);
    }

    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setVideoError(false);
    const blobUrl = URL.createObjectURL(f);
    setPreviewUrl(blobUrl);
    // Lock in as original input only if none set yet
    setOriginalInputUrl((prev) => prev || blobUrl);
    setCurrentOutputUrl(null);
    addLog('success', `Local file attached: ${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`);
  };

  // Click a history item → load its video
  const handleHistoryClick = async (iteration) => {
    setActiveIterationId(iteration.id);
    const rawUrl = iteration.output_video_url || iteration.input_video_url;
    if (!rawUrl) {
      showToast('warning', 'This iteration has no video URL yet.');
      return;
    }
    const isOut = !!iteration.output_video_url;
    addLog('loading', `Loading ${isOut ? 'output' : 'input'} from iteration #${promptHistory.length - promptHistory.indexOf(iteration)}…`);
    await loadVideo(rawUrl, isOut);
    showToast('success', isOut ? 'Output video loaded into player.' : 'Input video loaded into player.');
  };

  // Submit to n8n
  const handleUploadToN8n = async () => {
    // ── Validation ──
    if (!file) {
      showToast('error', 'No video loaded. Upload a video or open a project with an existing video.');
      return;
    }
    if (!prompt.trim()) {
      showToast('error', 'Please enter a prompt before generating.');
      return;
    }
    if (!project.id) {
      showToast('error', 'Project ID missing. Please reopen this project from the Dashboard.');
      return;
    }

    setStatus('loading');
    addLog('loading', 'Sending to n8n…');

    let user = null;
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(`Auth error: ${authError.message}`);
      user = authData.user;
      if (!user) throw new Error('You must be logged in to generate edits.');
    } catch (err) {
      setStatus('error');
      addLog('error', err.message);
      showToast('error', err.message);
      return;
    }

    try {
      // `file` is ALWAYS set at this point:
      //   - local upload:   set by handleFileChange
      //   - storage video:  set by loadVideo (downloaded as Blob → File)
      // So we always send binary to n8n — no URL-only path needed.
      if (!file) throw new Error('No video file ready. Please re-select the video.');

      addLog('loading', `Sending "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB) to n8n…`);

      // Always send the ORIGINAL source video as input — never the output.
      // originalInputUrl is locked on first upload/project-open and never changes.
      const formData = new FormData();
      formData.append('video', file);           // binary file
      formData.append('prompt', prompt.trim());
      formData.append('mode', mode);
      formData.append('userId', user.id);
      formData.append('projectId', project.id);
      formData.append('projectName', projectName);
      formData.append('targetWidth', String(width));
      formData.append('targetHeight', String(height));
      if (originalInputUrl) formData.append('input_video_url', originalInputUrl);
      
      addLog('loading', 'Awaiting n8n response…');
      const response = await fetch(N8N_WEBHOOK_URL, { method: 'POST', body: formData });

      /*if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(
          `n8n responded with HTTP ${response.status}${errText ? ': ' + errText.slice(0, 160) : ''}`
        );
      }*/
      // ─── THE NEW ERROR LISTENER ───
      if (!response.ok) {
        let errorData;
        try {
          // Try to parse the JSON error we sent from n8n/Flask
          errorData = await response.json();
          print(errorData)
        } catch (e) {
          // Fallback if the response isn't valid JSON
          const rawText = await response.text();
          errorData = { message: rawText || 'Server Error' };
        }

        // Extract the clean error summary we made in Flask
        const displayError = errorData.error_summary || errorData.message || "Engine Error";
        const techDetails = errorData.details || "";

        // 1. Show the red Toast (using your existing Toast system)
        showToast('error', `❌ ${displayError}`, 8000);

        // 2. Add to the Status Log sidebar
        addLog('error', `Nexus Crash: ${displayError}`);

        // 3. Optional: If you want a hard "Alert" popup (like SweetAlert or native)
        // alert(`CRITICAL ERROR: ${displayError}`);

        throw new Error(displayError); // Stops the try block execution
      }
      const successData = await response.json();

      if (successData.success && successData.videoUrl) {
        addLog('success', '🎬 n8n returned output directly!');
        // Force load the video with a cache-buster
        const cacheBusterUrl = `${successData.videoUrl}?t=${Date.now()}`;
        loadVideo(cacheBusterUrl, true);
      }
      // ── Save the user iteration row to Supabase ──
      // input_video_url always points to the original source (storage URL only).
      const storedInputUrl = originalInputUrl?.startsWith('blob:') ? null : originalInputUrl;
      const { data: newIteration, error: dbError } = await supabase
        .from('iterations')
        .insert({
          project_id: project.id,
          prompt: prompt.trim(),
          input_video_url: storedInputUrl,
          role: 'user',
          status: 'pending',
        })
        .select()
        .single();

      if (dbError) {
        showToast('warning', `Job sent, but failed to save to history: ${dbError.message}`);
        addLog('warning', `DB write failed: ${dbError.message}`);
      } else if (newIteration) {
        setPromptHistory((prev) => [newIteration, ...prev]);
        setActiveIterationId(newIteration.id);
      }

      // No cleanup needed — keep the source video in the player while n8n works.
      // The player will update automatically when Realtime fires with the output.
      
      setStatus('success');
      addLog('success', '✅ Job sent to n8n. Processing started.');
      showToast('success', 'Edit job submitted! n8n is now processing.');
      setPrompt('');
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    
    } catch (err) {
      setStatus('error');
      const msg = err.message || 'Unknown error occurred';
      addLog('error', `Workflow stopped.`);
      //addLog('error', `❌ ${msg}`);
      showToast('error', msg, 7000);
    }
  };

  // Derived display flags
  const isProcessing = status === 'loading';
  const hasOutputReady = !!currentOutputUrl;

  // Upload button — green if file ready, cyan if output is showing, default otherwise
  const uploadBtnStyle = file && !currentOutputUrl
    ? { background: 'rgba(56,176,0,0.2)', borderColor: 'rgba(56,176,0,0.5)', color: '#4ade80' }
    : file && currentOutputUrl
      ? { background: 'rgba(0,240,255,0.1)', borderColor: 'rgba(0,240,255,0.3)', color: 'var(--accent-cyan)' }
      : { background: 'rgba(255,255,255,0.05)', borderColor: 'var(--panel-border)', color: 'white' };

  const uploadBtnLabel = file
    ? (currentOutputUrl ? `↻ Output loaded — click to swap source` : `✓ ${file.name.length > 22 ? file.name.slice(0, 20) + '…' : file.name}`)
    : '1. Upload Video';

  // ── Render ──
  return (
    <div className="workspace-layout">
      <style>{workspaceStyles}</style>

      {/* Toast layer */}
      <Toast toasts={toasts} />

      {/* Header */}
      <header className="workspace-header">
        <div className="workspace-logo" onClick={() => navigate('/dashboard')}>
          <div className="logo-icon"></div>
          <span>PromptFlow AI.</span>
        </div>
        <div className="workspace-tabs">
          <button className="tab active">Workspace</button>
          <button className="tab">Assets</button>
          <button className="tab">Exports</button>
        </div>
        <div className="workspace-actions">
          <button className="quick-access-btn" style={{ color: 'var(--accent-cyan)' }}>
            {projectName} ({width}×{height})
          </button>
          <div className="profile-pic"></div>
        </div>
      </header>

      <main className="workspace-main">

        {/* ── LEFT SIDEBAR: Prompt History ── */}
        <aside className="media-bin-panel">
          <div className="panel-header">
            <h3>Prompt History</h3>
            <div className="header-icons">
              {promptHistory.length > 0 && (
                <span style={{
                  background: 'rgba(160,48,240,0.25)', color: '#c084fc',
                  fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px',
                  border: '1px solid rgba(160,48,240,0.3)'
                }}>
                  {promptHistory.length}
                </span>
              )}
            </div>
          </div>

          <div className="prompt-history-list">
            {historyLoading && (
              <p className="prompt-history-empty">Loading history…</p>
            )}
            {!historyLoading && promptHistory.length === 0 && (
              <div className="prompt-history-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
                  style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.3 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                No prompts yet.<br />Submit a prompt to see history here.
              </div>
            )}
            {!historyLoading && promptHistory.map((item, idx) => {
              const hasVid = !!(item.output_video_url || item.input_video_url);
              const isActive = activeIterationId === item.id;
              const isOut = !!item.output_video_url;
              return (
                <motion.div
                  key={item.id}
                  className={`prompt-history-item${isActive ? ' active' : ''}`}
                  onClick={() => handleHistoryClick(item)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  title={item.prompt}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <div className="phi-number">#{promptHistory.length - idx}</div>
                    <span style={{
                      fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px',
                      background: item.role === 'assistant' ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.06)',
                      color: item.role === 'assistant' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${item.role === 'assistant' ? 'rgba(0,240,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                      {item.role || 'user'}
                    </span>
                  </div>
                  <div className="phi-text">{item.prompt || '(no prompt text)'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                    <div className="phi-time">{timeAgo(item.created_at)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {item.status && (
                        <span style={{
                          fontSize: '0.6rem',
                          color: item.status === 'done' ? '#7ed957' : item.status === 'error' ? '#ff6b7a' : '#feca57'
                        }}>
                          {item.status === 'done' ? '✓' : item.status === 'error' ? '✕' : '⏳'}
                        </span>
                      )}
                      {hasVid && (
                        <div className="phi-has-video" style={{ color: isOut ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.3)' }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                          {isOut ? 'output' : 'input'}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </aside>

        {/* ── CENTER ── */}
        <section className="workspace-center">
          <div className="video-player-wrapper glow-border-cyan-pink">
            <div className="video-player-inner">
              <div className="mock-video-frame">
                {videoLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 32, height: 32, border: '2px solid rgba(0,240,255,0.3)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%' }}
                    />
                    <span style={{ fontSize: '0.85rem' }}>Loading video from storage…</span>
                  </div>
                )}
                {!videoLoading && videoError && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', color: 'rgba(255,100,100,0.7)' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: '240px' }}>
                      Could not load video. The file may be private or the URL has expired.
                    </span>
                    <button
                      onClick={() => loadVideo(remoteInputUrl || initialVideoUrl)}
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.8rem', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}
                    >
                      Retry
                    </button>
                  </div>
                )}
                {!videoLoading && !videoError && previewUrl && (
                  <video
                    key={previewUrl}
                    src={previewUrl}
                    controls
                    autoPlay
                    loop
                    onError={() => {
                      setVideoError(true);
                      addLog('error', 'Video playback failed. The URL may be expired or inaccessible.');
                      showToast('error', 'Video failed to play. Try refreshing the signed URL.', 6000);
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                  />
                )}
                {!videoLoading && !videoError && !previewUrl && (
                  <div className="mock-video-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.8rem' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>
                      Upload a video or select a past iteration
                    </span>
                  </div>
                )}
              </div>
              {/* <div className="video-controls-bar">
                <div className="timeline-trail"><div className="timeline-thumb"></div></div>
                <div className="controls-row">
                  <div className="playback-controls">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon>
                    </svg>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon>
                    </svg>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          <div className="ai-prompt-console glow-border-purple">
            <div className="console-inner">
              <div className="panel-header">
                <div className="title-with-icon">
                  <div className="logo-icon small"></div>
                  <h3>AI Prompt Console</h3>
                </div>
                {hasOutputReady && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', background: 'rgba(0,240,255,0.08)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(0,240,255,0.2)' }}>
                    🎬 Output ready — next prompt uses original source
                  </span>
                )}
              </div>

              <textarea
                className="ai-prompt-input"
                placeholder="Describe your edit (e.g. Add cinematic colour grading and remove background noise)…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isProcessing}
              />

              <div className="console-footer">
                <div className="console-footer-left" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="file" accept="video/mp4,video/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

                  <button
                    className="quick-access-btn"
                    onClick={() => fileInputRef.current?.click()}
                    style={uploadBtnStyle}
                    title="Click to upload a new local video (overrides storage video)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ marginRight: '5px', verticalAlign: 'middle' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    {uploadBtnLabel}
                  </button>

                  <select
                    className="quick-access-btn"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    style={{ cursor: 'pointer', outline: 'none' }}
                  >
                    <option style={{ background: '#111520' }}>General Effects (AI Assistant)</option>
                    <option style={{ background: '#111520' }}>Add AI VFX</option>
                  </select>
                </div>

                <div className="console-footer-right">
                  <button
                    className="send-prompt-btn"
                    onClick={handleUploadToN8n}
                    disabled={isProcessing}
                    style={{ opacity: isProcessing ? 0.6 : 1 }}
                  >
                    <div className="btn-content">
                      <span className="check-icon">{isProcessing ? '⏳' : '✨'}</span>
                      <div className="btn-text">
                        <span className="btn-title">{isProcessing ? 'Processing…' : '2. Generate Edit'}</span>
                        <span className="btn-subtitle">{isProcessing ? 'Please wait…' : 'Submit to n8n'}</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── RIGHT SIDEBAR: Status Log ── */}
        <aside className="status-log-panel">
          <div className="panel-header">
            <h3>Status Log</h3>
          </div>
          <div className="status-content">
            <div className="status-summary">
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: status === 'loading' ? '#feca57' : status === 'success' ? 'var(--accent-green)' : status === 'error' ? '#ff4757' : 'rgba(255,255,255,0.2)',
                  boxShadow: status === 'loading' ? '0 0 6px #feca57' : 'none',
                }} />
                {status === 'loading' ? 'Processing…' : status === 'success' ? 'Finished' : status === 'error' ? 'Error' : 'Ready'}
              </p>
              <div className="progress-bar-container">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: status === 'loading' ? '75%' : status === 'success' ? '100%' : status === 'error' ? '100%' : '0%' }}
                  transition={{ duration: status === 'loading' ? 10 : 0.5 }}
                  style={{
                    height: '100%',
                    background: status === 'error' ? '#ff4757' : 'var(--accent-green)'
                  }}
                />
              </div>
            </div>

            <div className="status-list">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  className="status-item"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span style={{
                    color: log.type === 'error' ? '#ff4757' :
                      log.type === 'warning' ? '#feca57' :
                        log.type === 'loading' ? '#feca57' :
                          'var(--accent-green)',
                    flexShrink: 0
                  }}>
                    {log.type === 'error' ? '✕' : log.type === 'loading' ? '⏳' : log.type === 'warning' ? '⚠' : '✓'}
                  </span>
                  <span className="status-text">{log.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Workspace;