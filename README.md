# 🚨 Deadline Rescue Cockpit

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-blueviolet.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **The ultimate agentic AI-powered emergency cockpit for students and professionals racing against critical deadlines.**



## 💡 The Problem
In high-pressure situations like hackathons, exam weeks, or critical product launches, humans frequently suffer from "panic paralysis." When multiple deadlines loom, people waste hours over-analyzing schedules, writing cluttered to-do lists, and worrying about what to start first, rather than actually executing. 

**Deadline Rescue Cockpit** solves this by acting as an autonomous productivity cockpit. It auto-prioritizes deadlines, parses unstructured text dumps, schedules your day, and launches a dedicated **"Rescue Mode"** when deadlines are less than 2 hours away, providing a step-by-step emergency completion plan.

---

## ⚡ Key Features

* **🚨 Emergency Rescue Mode:** When a task is less than 2 hours away, the dashboard triggers a high-priority emergency visual theme. Gemini/Ollama builds a minute-by-minute survival guide, stripping out fluff to outline a **Minimum Viable Submission (MVS)** to help you submit on time.
* **✨ AI Task Extraction:** Paste messy syllabi, Slack threads, email dumps, or raw thoughts. The AI extracts tasks, schedules logical deadlines, rates task priority from 1-10, and adds them to your active matrix.
* **📅 Daily Time-Blocked Schedule:** The AI reviews active pending items and drafts a clean hourly time-blocked schedule in formatted markdown.
* **🔥 Habit Streak Heatmap:** A visual GitHub-style habit calendar ensuring that your hydration, health, or coding routines don't get neglected during crunch periods.
* **🧠 Context-Aware AI Coach:** A chatbot sidebar that reads your current tasks, streak statuses, and daily briefing to offer direct, actionable, bite-sized productivity advice.
* **🌅 Daily Morning Briefing:** Generates a motivational and tactical greeting when you log in, tailored to your weekly completion rate and daily workload.

---

## 🛠️ System Architecture & Folder Structure

The project is structured as a monorepo containing both the Java backend and the React frontend:

```
deadline-rescue-cockpit/
├── backend/                # Spring Boot 3 + Java 22 Application
│   ├── src/main/java/      # JPA Entities, Repositories, DTOs, Controllers, Services
│   ├── src/main/resources/ # application.properties, Schema/Security configurations
│   └── pom.xml             # Maven dependencies (Lombok, Security, WebFlux)
├── frontend/               # Vite + React + Tailwind Frontend
│   ├── src/components/     # Dashboard widgets (AIAssistant, HabitTracker, RescueMode, etc.)
│   ├── src/pages/          # Auth pages and Analytics
│   ├── src/services/       # Axios API services linking to backend REST endpoints
│   ├── tailwind.config.js  # Tailwind custom palette configuration
│   └── package.json        # Frontend NPM configurations
├── .gitignore              # Configured to secure .idea/ and credentials
└── README.md               # Project documentation
```

---

## ⚙️ AI Models & Configuration

This project supports **both** Google Gemini API and a local **Ollama** LLM backend, decoupled from your controllers via a central service layer.

### Option A: Using Google Gemini (Cloud)
In Google AI Studio, generate a standard or authorization key (`AQ.` prefix) and set it in your environment or IDE run configuration:
* **Key Name:** `GEMINI_API_KEY`
* **URL Configuration (`backend/.../application.properties`):**
  ```properties
  gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
  ```

> [!NOTE]
> **API Throttling Protection:** The backend is built with a custom synchronized lock and a 4.5-second cooldown throttle in `GeminiService.java` to safeguard your free-tier key and prevent concurrent requests from throwing `429 Too Many Requests` errors.

### Option B: Using Ollama (Local & Offline)
To run fully offline on your own hardware without keys:
1. Install and start [Ollama](https://ollama.com/).
2. Pull your model of choice (e.g. Llama 3):
   ```bash
   ollama pull llama3
   ```
3. Update `application.properties`:
   ```properties
   ollama.api.url=http://localhost:11434/api/generate
   ollama.model=llama3
   ```

---

## 🚀 Local Setup Instructions

### Prerequisites
- **Java JDK 22** (Lombok is configured for Java 21/22 compatibility).
- **Node.js (v18+)** and npm installed.
- **Maven** (optional, or run via your IDE compiler).

### 1. Run the Backend (Spring Boot)
1. Open the `/backend` directory in IntelliJ IDEA or your preferred IDE.
2. In your IDE run settings, define the `GEMINI_API_KEY` environment variable (if using Gemini).
3. Compile and start `LifeSaverApplication.java`.
4. The server starts on port `8080`.

#### Database Configuration:
The project uses an in-memory **H2 Database** for fast, zero-setup local development.
- **H2 Console URL:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- **JDBC URL:** `jdbc:h2:mem:lifesaverdb`
- **Username:** `sa`
- **Password:** *(leave blank)*

### 2. Run the Frontend (React)
Open a terminal in the `/frontend` directory:
```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📋 REST API Documentation

All API calls are secured via stateless JWT bearer authentication except for authorization paths.

### Auth Module
- `POST /api/auth/signup` - Register a new user account.
- `POST /api/auth/signin` - Authenticate credentials and return a signed JWT token.

### Tasks Module
- `GET /api/tasks` - List all active/pending tasks for the logged-in user.
- `POST /api/tasks` - Create a single task manually.
- `POST /api/tasks/ai-extract` - Parse unstructured text to extract and save tasks automatically.
- `GET /api/tasks/schedule` - Generate the daily time-blocked schedule via AI.
- `GET /api/tasks/rescue/{id}` - Retrieve the emergency checklist and MVS for a task.
- `PUT /api/tasks/{id}/status` - Mark task status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `MISSED`).
- `DELETE /api/tasks/{id}` - Delete a task.
- `GET /api/tasks/briefing` - Retrieve the personalized morning briefing.

### Habits Module
- `GET /api/habits` - List all tracked habits.
- `POST /api/habits` - Create a new habit (e.g. "Drink Water", "Code 1 Hour").
- `PUT /api/habits/{id}/complete` - Log completion for today and auto-calculate streaks.
- `GET /api/habits/analysis` - Retrieve Gemini/Ollama habit pattern insights.

### AI Assistant Module
- `POST /api/ai/chat` - Interact with the context-aware productivity coach.
- `GET /api/ai/prioritize` - Let the AI re-score the priority weight of all pending tasks.
```
