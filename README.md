# 🧳 PackPal

PackPal is a full-stack web app that helps users effortlessly create and manage packing lists for their trips. Featuring an AI assistant powered by Google Gemini, PackPal makes sure you never forget an essential item again.

---

## 🚀 Features

- ✈️ Create trips and packing lists
- 🤖 AI agent to suggest items for your trip  
- 📱 Responsive and intuitive frontend (Next.js)  
- 🧠 Backend logic with Flask and Supabase database integration  
- 🔐 Secure environment variable management

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, Tailwind CSS  
- **Backend**: Flask, Supabase  
- **Database**: Supabase (PostgreSQL)  
- **AI**: LangGraph with Google Gemini Model

---

## 🧪 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/amir-dayagi/packpal.git
cd packpal
```

### 2. Set Up Supabase
**1.** Go to https://supabase.com and create a new project.

**2.** Once the project is created, go to the SQL Editor and run the schema script found in `/schema.sql`

**3.** You'll need the following values:
 - **Supabase URL**: Found under Project Settings > API > Project URL
 - **Supabase Anon Key**: Use the anon key from Project Settings > API Keys
 - **URI Connection String**: Go to Database > Connection Pooling, and copy the connection string URI (or construct manually from host, user, password, port, database name)

### 3. Backend (Flask)
**1.** Navigate to the backend directory:

```bash
cd backend
```

**2.** Install [Conda](https://docs.conda.io/projects/conda/en/stable/user-guide/install/index.html) (skip this step if you have conda installed)

**3.** Create and activate the Conda environment:

```bash
conda env create -f environment.yml
conda activate packpal-backend
```

**4.** Create a `.env` file in the `backend/` directory with the following content:

```bash
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_KEY=<your-supabase-anon-key>
GOOGLE_API_KEY=<get from https://makersuite.google.com/app/apikey>
CHECKPOINTER_DB_URI=<your-supabase-direct-connection-uri>
```

**5.** Run the Flask backend:

```bash
flask run
```

### 4. Frontend (Next.js)
**1.** Navigate to the frontend directory:

```bash
cd ../frontend
```

**2.** Install [Node.JS with npm](https://nodejs.org/en/download) (skip this if you have node installed already and/or use a different package manager)

**3.** Install dependencies:

```bash
npm install
```

**4.** Create a `.env` file in the `frontend/` directory with the following content:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

**5.** Start the development server:

```bash
npm run dev
```

