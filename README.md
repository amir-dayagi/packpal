# 🧳 PackPal

PackPal is a full-stack, AI-powered packing assistant designed to ensure you never leave an essential item behind. By combining a modern web interface with a persistent LangGraph-based AI agent, PackPal generates intelligent packing lists tailored to your destination, duration, and activities.

---

## 🚀 Features

- **✈️ Smart Trip Planning**: Create and manage trips with ease.
- **🤖 LangGraph AI Agent**: A stateful assistant that suggests items based on real-time logic.
- **🔄 Persistent State**: Trip data and AI checkpoints are stored securely in Supabase.
- **⚡ High Performance**: Asynchronous backend using Quart and Uvicorn with uvloop.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Quart (Async Python), Supabase Python SDK, LangGraph SDK
- **AI Infrastructure**: LangGraph, LangSmith (Tracing)
- **Database**: Supabase (PostgreSQL)

---

## 🗄️ 1. Mandatory Database Setup (Supabase)

Regardless of how you run the application (Docker or Local), you must set up your database first.

1. ### Create a Project
Head to [supabase.com](https://supabase.com) and create a new project.

2. ### Initialize Schema
Copy the contents of `schema.sql` from this repository and run it in the Supabase SQL Editor.

---

## 🧪 2. Local Development Setup

### 🛠️ Prerequisites
Ensure you have the following installed before proceeding:
- **Python 3.10+** (for Backend and Assistant)
- **Node.js 18+ & npm** (for Frontend)
- **Git**

---

### 📡 Global Configuration
PackPal uses a centralized environment strategy.
1. Copy the template: `cp .env.example .env`
2. Fill in the instructed values in the `.env` file.

---

### 🧠 AI Assistant (LangGraph)
The assistant service manages the logic of the packing agent.
1. Navigate & Install:
```bash
cd assistant
pip install -e ".[dev]"
```
2. Run Dev Server:
```bash
langgraph dev
```
*The assistant will be available at http://localhost:2024. This command provides a local inspector UI to debug your graph's states.*

---

### 🐍 Backend (Quart API)
The backend acts as the bridge between your UI and the AI agent.

1. Navigate & Install:
```bash
cd backend
pip install -r requirements.txt
```
2. Launch with Uvicorn:
```bash
# Runs on port 5000 with hot-reload enabled
uvicorn app:app --port 5000 --loop uvloop 
```
*Note: Ensure your BACKEND_ASSISTANT_API_URL in .env is set to http://localhost:2024 for local development.*

---

### 🎨 Frontend (Next.js)
The frontend provides the user interface for managing trips and chatting with the assistant.

1. Navigate & Install:
```bash
cd frontend
npm install
```
2. Run Development Server:
```bash
npm run dev
```
*The app will be available at http://localhost:3000. This setup uses a pre-dev script to automatically sync your root .env values.*

---

### 💡 Pro-Tips for Contributors

- **Dependency Management**: We recommend using a virtual environment (like venv or conda) for the Python services to avoid version conflicts.

- **Logging**: The Backend is configured with uvloop for high-performance async processing. If you encounter issues with async routes, check the console for Uvicorn's detailed error logs.

- **Syncing Env**: If you add a new variable to the root .env, restart the Frontend dev server to ensure Next.js picks it up.

## 🏗️ 3. Advanced: Production & Deployment
If you wish to deploy PackPal to production, the repository provides the following assets:

- **Dockerization**: We provide a docker-compose.yml and specialized Dockerfiles for the Backend and Assistant.

- **Frontend**: The Next.js frontend is optimized for deployment on Vercel.