# 🎥 PromptFlow AI — AI-Powered Natural Language Video Editor

> **"Just describe what you want. AI does the rest."**

PromptFlow AI is a full-stack AI video editor that turns plain English prompts into professional edits. No timelines. No keyframes. Just type what you want.

[![Python](https://img.shields.io/badge/Python-3.13-blue)](https://python.org)
[![React](https://img.shields.io/badge/Frontend-React-61dafb)](https://reactjs.org)
[![n8n](https://img.shields.io/badge/Orchestration-n8n-orange)](https://n8n.io)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [Step 1 — Python Dependencies](#step-1--python-dependencies)
  - [Step 2 — Frontend Setup](#step-2--frontend-setup)
  - [Step 3 — Supabase Setup](#step-3--supabase-setup-detailed)
  - [Step 4 — n8n Setup](#step-4--n8n-setup-detailed)
  - [Step 5 — API Keys & .env](#step-5--api-keys--env)
  - [Step 6 — Start All Services](#step-6--start-all-services)
- [Usage](#-usage)
- [Common Issues & Fixes](#-common-issues--fixes)
- [Contributing](#-contributing)

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🎬 AI VFX Mode | Text-to-Video generation via Replicate (Minimax). Generates effects like fire, petals, snow, and overlays them onto your footage. |
| 🎛️ General Edits Mode | Trim, cut, speed up/slow down, apply black & white, fade in/out, rotate, add text overlays — all via natural language. |
| 🎵 Mood-Based Music | Jamendo API integration auto-selects background music based on the mood of your prompt. |
| 📝 Auto Subtitles | Whisper-powered automatic subtitle generation and burn-in. |
| 🕓 Prompt History | Full edit history synced in real time via Supabase. Revert or compare at any time. |
| 💅 Glassmorphic UI | Beautiful React dashboard with Framer Motion animations. |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Framer Motion, Supabase JS Client |
| Orchestration | n8n (local workflow engine) |
| AI Routing | Gemini 2.5 Flash (prompt classification) |
| AI VFX | Replicate — Minimax Video Model |
| Standard Edits | MoviePy + FFmpeg |
| Auto Subtitles | OpenAI Whisper |
| Music | Jamendo API |
| Database & Storage | Supabase (PostgreSQL + Storage Buckets) |
| Bridge Server | Python Flask (port 5000) |

---

## 📁 Folder Structure

> ⚠️ **Critical:** You must create **two separate folders** directly in your user home directory (`C:\Users\YOURNAME\`). Do **NOT** nest them inside a single parent folder. n8n and Python scripts have hardcoded paths that expect this exact layout.

```
C:\Users\YOURNAME\
│
├── VideoEditorProject\              ← AI VFX, frontend, Replicate generation
│   ├── frontend\                    ← React + Vite app
│   │   ├── src\
│   │   ├── public\
│   │   ├── .env                     ← API keys (Replicate, Jamendo)
│   │   ├── package.json
│   │   └── vite.config.js
│   ├── Prompt\                      ← Incoming prompt files from n8n
│   ├── Final\                       ← Final merged video outputs
│   ├── Output\                      ← raw.mp4 lives here (your source video)
│   ├── Gen\                         ← Replicate-generated VFX clips
│   ├── generate.py                  ← Calls Replicate API
│   ├── merge.py                     ← Overlays AI VFX onto original video
│   ├── bridge.py                    ← Flask server (receives n8n webhooks)
│   └── .env                        ← Root-level env (if not using frontend/.env)
│
└── Video\                           ← Standard edits + subtitle engine
    ├── standard_edits.py            ← Main dispatcher (trim, speed, BW, etc.)
    ├── auto_subtitle.py             ← Whisper subtitle generation + burn-in
    ├── basic_editing.py             ← Trim, cut, rotate helpers
    ├── effects.py                   ← Visual effects (fade, BW, etc.)
    ├── music_addition.py            ← Jamendo music fetch + mix
    ├── history_maintain.py          ← Writes edit history to Supabase
    ├── input_folder\                ← Drop source videos here
    ├── temp\                        ← Intermediate processing files
    └── history\                     ← Local edit history backups
```

---

## 🛠️ Prerequisites

Install and configure all of the following before proceeding:

### System Requirements

- **OS:** Windows 10 or Windows 11
- **Python 3.13** — [Download](https://www.python.org/downloads/) (recommended for most scripts)
- **Python 3.10** — Some n8n Code nodes reference this version specifically
- **Node.js 20+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### Required Tools

#### FFmpeg
FFmpeg must be installed and available in your system `PATH`.

1. Download from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Extract to `C:\ffmpeg\`
3. Add `C:\ffmpeg\bin` to your system PATH:
   - Open **Start** → Search "Environment Variables"
   - Under **System Variables**, select `Path` → **Edit**
   - Click **New** → paste `C:\ffmpeg\bin`
   - Click OK, restart terminal

Verify: `ffmpeg -version`

#### ImageMagick
Required for MoviePy's `TextClip` (text overlays).

1. Download from [https://imagemagick.org/script/download.php](https://imagemagick.org/script/download.php)
2. During installation, check **"Add to system PATH"** and **"Install legacy utilities (convert)"**
3. Verify: `magick --version`

#### n8n (Local Workflow Engine)
```bash
npm install -g n8n
```
Start with: `n8n start`
Then open: [http://localhost:5678](http://localhost:5678)

---

## 🚀 Installation

### Step 1 — Python Dependencies

Install in each folder:
```bash
# For VideoEditorProject
cd C:\Users\YOURNAME\VideoEditorProject
pip install -r requirements.txt

# For Video
cd C:\Users\YOURNAME\Video
pip install -r requirements.txt
```

> 💡 If you have multiple Python versions, use `py -3.13 -m pip install -r requirements.txt` to target the correct version.

---

### Step 2 — Frontend Setup

```bash
cd C:\Users\YOURNAME\VideoEditorProject\frontend
npm install
npm run dev
```

The app will be available at: [http://localhost:5173](http://localhost:5173)

---

### Step 3 — Supabase Setup (Detailed)

Supabase is used for storing projects, edit iterations, and video files.

#### 3a. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **"New Project"**.
3. Fill in:
   - **Name:** `PromptFlowAI` (or anything you like)
   - **Database Password:** Choose a strong password and save it
   - **Region:** Select the one closest to you
4. Click **"Create new project"** and wait ~2 minutes for provisioning.

#### 3b. Get Your Project Credentials

From your project dashboard, go to **Settings → API**. You'll need:

| Credential | Where to find it |
|-----------|-----------------|
| **Project URL** | `https://<your-ref>.supabase.co` |
| **Anon (public) key** | Under "Project API Keys" → `anon public` |
| **Service Role key** | Under "Project API Keys" → `service_role` (keep this secret!) |

#### 3c. Create the Required Database Tables

Go to **SQL Editor** in your Supabase dashboard and run the following:

```sql
-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Edit iterations / prompt history table
CREATE TABLE iterations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  output_url TEXT,
  edit_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE iterations ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust for production)
CREATE POLICY "Allow all" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all" ON iterations FOR ALL USING (true);
```

#### 3d. Create Storage Buckets

Go to **Storage** in your dashboard:

1. Click **"New bucket"**
2. Create a bucket named `videos` — set it to **Public**
3. Create a bucket named `outputs` — set it to **Public**

#### 3e. Note Your Project Reference

Your **project ref** is the unique ID in your Supabase URL:
`https://xyzxyzxyz.supabase.co` → ref is `xyzxyzxyz`

You'll need to replace the hardcoded refs in the n8n workflow (see Step 4).

---

### Step 4 — n8n Setup (Detailed)

n8n is the brain of PromptFlow AI. It receives prompts from the frontend, routes them with Gemini, calls Python scripts, and writes results back to Supabase.

#### 4a. Start n8n

```bash
n8n start
```

Open [http://localhost:5678](http://localhost:5678) and create an account if prompted.

#### 4b. Import the Workflow

1. In n8n, click the **hamburger menu (☰)** → **Workflows**
2. Click **"Import from file"**
3. Select `PromptFlow AI Workflow.json` from your project files
4. The workflow will open — do **not** activate it yet

#### 4c. Configure Credentials

In the workflow, click on nodes that show a credential warning (usually highlighted in orange/red). Set up the following:

**Google Gemini (PaLM) API:**
1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create an API key
3. In n8n, when prompted for a Gemini credential, paste the key
4. The workflow uses **Gemini 2.5 Flash** — ensure the credential is named exactly `Google Gemini (PaLM) Api account 7` or `8` (check the node settings)

**Supabase:**
1. In n8n, go to **Settings → Credentials → Add Credential**
2. Search for "Supabase" and add:
   - **Host:** your Supabase project URL (e.g., `https://xyzxyzxyz.supabase.co`)
   - **Service Role Key:** from Step 3b

#### 4d. Replace Hardcoded Supabase References

The imported workflow contains references to the original developer's Supabase project. You **must** replace them with your own.

1. In n8n, open each HTTP Request node that calls Supabase (look for nodes with URLs containing `.supabase.co`)
2. Search for the old project refs: `ijvvydbswryfjrkivjzs` and `giciwxijnptancfehwhb`
3. Replace every occurrence with **your** project ref (from Step 3e)

You can also do a bulk find using n8n's workflow JSON:
1. Go to **Workflow → Download** to get the JSON
2. Open in a text editor
3. Find-and-replace the old refs with yours
4. Re-import the updated JSON

#### 4e. Update Python Paths in Code Nodes

The workflow runs Python scripts using hardcoded paths. Update any Code node that contains a Python call:

Find references like:
```
C:\Program Files\Python313\python.exe
```

Replace with the actual path to your Python 3.13 installation. To find it:
```bash
where python
# or
py -3.13 -c "import sys; print(sys.executable)"
```

#### 4f. Activate the Workflow

Once all credentials and paths are updated:
1. Click the **toggle switch** in the top-right of the workflow editor
2. Status should change to **"Active"**
3. The webhook endpoint is now live at: `http://localhost:5678/webhook/...` (check your Webhook node for the exact path)

---

### Step 5 — API Keys & .env

Create a `.env` file at `C:\Users\YOURNAME\VideoEditorProject\frontend\.env`:

```env
# Replicate — for AI VFX generation (Minimax model)
REPLICATE_API_TOKEN=r8_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Jamendo — for mood-based background music
JAMENDO_CLIENT_ID=XXXXXXXXXXXXXXXX
```

**Getting your Replicate API token:**
1. Sign up at [https://replicate.com](https://replicate.com)
2. Go to **Account → API Tokens**
3. Create a new token and paste it above

**Getting your Jamendo Client ID:**
1. Register at [https://devportal.jamendo.com](https://devportal.jamendo.com)
2. Create an app to receive a **Client ID**

> **Note:** Gemini and Supabase keys go into n8n credentials only — not in `.env`.

---

### Step 6 — Start All Services

Open **three separate terminals** and run:

```bash
# Terminal 1 — Flask Bridge Server (handles standard edits from n8n)
cd C:\Users\YOURNAME\Video
python bridge.py
# Should print: Running on http://127.0.0.1:5000

# Terminal 2 — n8n (if not already running)
n8n start
# Open http://localhost:5678 and confirm workflow is Active

# Terminal 3 — Frontend
cd C:\Users\YOURNAME\VideoEditorProject\frontend
npm run dev
# Open http://localhost:5173
```

All three must be running simultaneously for the app to work.

---

## 🧪 Usage

1. Open [http://localhost:5173](http://localhost:5173) in your browser
2. Click **"New Project"** and give it a name
3. Drop your source video into `C:\Users\YOURNAME\VideoEditorProject\Output\` as `raw.mp4`
4. Type a natural language prompt, for example:
   - `"trim from 2 seconds to 8 seconds and add a fade in"`
   - `"make it black and white and slow it down to 0.5x speed"`
   - `"add fire effect overlay"`
   - `"generate subtitles and add lofi background music"`
5. Click **Generate Edit**
6. Monitor the real-time status and view the output when complete
7. Browse your full **Prompt History** in the sidebar — click any entry to re-apply or branch from it

---

## 🔧 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `no_audio() got unexpected keyword 'input'` | MoviePy version mismatch | Update the function calls in `basic_editing.py` and `music_addition.py` to remove the `input` argument |
| `Python not found` in n8n | Incorrect Python path in Code nodes | Update all Code nodes in n8n to use your actual Python path (e.g., `C:\Python313\python.exe`) |
| `TextClip` fails / `OSError: no such file` | ImageMagick not in PATH | Install ImageMagick and ensure `convert.exe` is on the system PATH |
| `Video not found` error | Missing `raw.mp4` | Copy your source video to `VideoEditorProject\Output\raw.mp4` |
| n8n webhook returns 404 | Flask bridge not running | Start `python bridge.py` in the `Video\` folder |
| Supabase 401 Unauthorized | Wrong or missing API key in n8n | Re-check the Supabase credential in n8n Settings → Credentials |
| Replicate job fails | Invalid or expired API token | Regenerate your token at replicate.com and update `.env` |
| Frontend shows blank / fails to load | Vite env vars not loaded | Ensure `.env` is in the `frontend\` folder (not root), and restart `npm run dev` |
| n8n workflow inactive | Workflow not toggled on | Click the Active toggle in the top-right of the workflow editor |
| Whisper takes too long | CPU-only machine | Use the `tiny` or `base` Whisper model in `auto_subtitle.py` for faster processing |

---

## 🤝 Contributing

Pull requests are welcome! To contribute:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**Made with ❤️ for creators who want to edit with prompts, not timelines.**