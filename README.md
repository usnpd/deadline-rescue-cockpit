# 🚨 Last-Minute Life Saver

> **Tagline:** The AI-Powered emergency cockpit for students and professionals racing against critical deadlines.

## 💡 The Problem
In high-pressure situations like hackathons, finals week, or product launches, humans suffer from "panic paralysis." When a deadline loom, people spend too much time scheduling, writing lists, or worrying about what to do first, rather than actually taking action. 

**Last-Minute Life Saver** solves this by acting as an autonomous productivity cockpit that intercepts deadlines, prioritizes them using Google Gemini AI, and constructs emergency survival action steps (Rescue Mode) to guarantee a submission.

---

## ⚡ Key Features
- **🚨 Emergency Rescue Mode:** When a task is less than 2 hours away, the dashboard lights up. Gemini constructs a minute-by-minute action plan to get the bare minimum submitted.
- **✨ AI Text-Dump Task Extraction:** Stop filling long forms. Paste a messy syllabus, Slack thread, or raw thoughts. Gemini extracts the titles, estimates sensible deadlines, sets priority, and saves them.
- **📅 Daily Time-Blocked Schedule:** Gemini reviews your active priorities and formats a clean hourly markdown time-blocked schedule for your day.
- **🔥 Habit Streak Heatmap:** An interactive GitHub-style tracker for daily habits to ensure your health, hydration, or coding practices don't die during crunch time.
- **🧠 AI Coach Cockpit:** A context-aware chatbot that knows your current tasks, completion rates, and active habits to give direct, bite-sized productivity advice.
- **🌅 Morning Briefing:** Generates a motivational and tactical briefing when you log in based on your historical weekly completion rate and today's schedule.

---

## 🛠️ Tech Stack
- **Backend:** Java 21, Spring Boot 3, Spring Security 6, Spring Data JPA, H2 Database (local dev) / MySQL (production).
- **Frontend:** React.js, Vite, Tailwind CSS, Lucide icons.
- **AI Core:** Google Gemini 1.5 Flash API (REST integrations).
- **Authentication:** Stateless JWT-based authentication.

---

## 🚀 Google Technologies Used
- **Google Gemini 1.5 Flash API:** Powers all cognitive workflows including task extraction, priority scoring, emergency step mapping, daily timeblock planning, habit pattern mining, and chatbot coaching.
- **Firebase Hosting:** Recommended for lightning-fast, secure frontend hosting.

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Java JDK 21 installed.
- Node.js (v18+) and npm installed.
- Maven installed (or use your IDE's Maven wrapper).

### 1. Clone the project
```bash
git clone <repository-url>
cd last-minute-life-saver
```

### 2. Configure Environment Variables
Copy `.env.example` to a new `.env` file (or set these directly in your system/IDE):
```bash
GEMINI_API_KEY=your_actual_gemini_api_key
JWT_SECRET=9a67a869ec2cfb9e4a8e31a89c895c2f6d23a48e718b5b63489e81b67272826a
```
Make sure you replace `your_actual_gemini_api_key` with your Google AI Studio API Key.

### 3. Run Backend (Spring Boot)
Open a terminal in the `backend/` folder:
```bash
cd backend
mvn spring-boot:run
```
The server will start on port `8080`.
H2 Console is available locally at: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- **JDBC URL:** `jdbc:h2:mem:lifesaverdb`
- **Username:** `sa`
- **Password:** *(leave blank)*

### 4. Run Frontend (React + Vite)
Open a terminal in the `frontend/` folder:
```bash
cd ../frontend
npm install
npm run dev
```
Open your browser at: [http://localhost:3000](http://localhost:3000)

---

## 📋 REST API Endpoints

### Auth
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Sign in and get JWT token
- `POST /api/auth/signout` - Logout (invalidate local state)

### Tasks
- `GET /api/tasks` - List all user tasks
- `POST /api/tasks` - Create a single task manually
- `POST /api/tasks/ai-extract` - Auto-extract tasks from plain text dump
- `GET /api/tasks/schedule` - Generate optimal daily timeblocks
- `GET /api/tasks/rescue/{id}` - Emergency step plan for a specific task
- `PUT /api/tasks/{id}` - Edit task details
- `PUT /api/tasks/{id}/status` - Mark task status (PENDING, IN_PROGRESS, COMPLETED)
- `DELETE /api/tasks/{id}` - Delete a task
- `GET /api/tasks/briefing` - Morning briefing

### Habits
- `GET /api/habits` - List all habits
- `POST /api/habits` - Create a new habit
- `PUT /api/habits/{id}/complete` - Mark a habit complete for today (calculates streaks)
- `GET /api/habits/analysis` - Gemini-powered habit consistency analysis

### AI Assistant
- `POST /api/ai/chat` - Chat with productivity coach
- `GET /api/ai/prioritize` - Re-evaluate priority rankings on all active tasks
