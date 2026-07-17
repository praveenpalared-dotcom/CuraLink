# CuraLink: AI-Powered Hospital Operations Platform

CuraLink is a next-generation, AI-driven healthcare operations platform designed to streamline patient intake, automate appointment management, and intelligently triage emergency situations. Built for the modern clinic, CuraLink provides dedicated portals for Patients, Doctors, and Nurses, all orchestrated by autonomous AI agents.

---

## 1. System Architecture

CuraLink is built on a decoupled client-server architecture deployed on **Vercel** utilizing Edge/Serverless computing.

```text
+---------------------+       +-----------------------+       +------------------------+
|   Frontend (Vite)   |       |   Backend (FastAPI)   |       |   Database (SQLite)    |
|                     |       |                       |       |                        |
|  - Patient Portal   | <---> |  - Notification API   | <---> |  - Patients / Staff    |
|  - Doctor Portal    | HTTP  |  - Appointments API   | ORM   |  - Appointments        |
|  - Nurse Portal     |       |  - AI Agent Routers   |       |  - Notifications       |
|  - Pharmacist Portal|       |  - Pharmacy API       |       |  - Deliveries          |
+---------------------+       +-----------+-----------+       +------------------------+
                                          |
                                          v
                              +-----------------------+
                              |   LLM Providers API   |
                              |   (Groq / OpenRouter) |
                              +-----------------------+
```

### Component Interactions
- **Dashboards**: Real-time polling fetches queue data and in-app notifications (e.g., via `NotificationBell.jsx`).
- **Backend Services**: The FastAPI backend serves as the primary data layer and AI orchestrator, securely interacting with the database via SQLAlchemy.
- **Serverless Scaling**: The backend is optimized for Vercel's `@vercel/python` builder, utilizing a stateless API design with fallback debugging routes.

---

## 2. AI/ML Flow

The AI pipeline is designed for high-speed, dynamic inference to assist both patients (via Copilot) and staff (via Clinical Experts).

1. **Ingestion & Prompt Assembly**: User input (e.g., chief complaints) or system events (e.g., appointment rescheduling) trigger an agent. The `llm_client.py` assembles the system prompt with relevant contextual data from the database.
2. **Provider Routing**: CuraLink uses a dual-provider routing strategy:
   - **Groq (Primary)**: Routes to `llama-3.3-70b-versatile` for ultra-fast, low-latency inference.
   - **OpenRouter (Fallback)**: Acts as a secondary provider if Groq is unavailable.
3. **Inference**: The LLM processes the clinical text, extracting intent, severity, or generating medical summaries.
4. **Evaluation**: Outputs are validated through Pydantic schemas (e.g., JSON structure for appointment booking) before being returned to the UI or stored in the database.

---

## 3. Agent Architecture

CuraLink employs a multi-agent architecture where specialized agents handle distinct domains of the hospital ecosystem.

### Agent Types
- **Appointment Agent**: Handles autonomous booking, verifying doctor availability and department match.
- **Rescheduling Agent**: Analyzes scheduling conflicts and proposes alternative time slots.
- **Triage Agent**: Evaluates patient symptoms and assigns emergency severity levels to alert nurses.
- **Clinical Expert Agent**: Acts as an AI Copilot for doctors, analyzing lab reports and summarizing patient history.

### Decision-Making Logic
Agents maintain zero persistent state in memory (optimizing them for Serverless execution). Instead, they fetch the necessary conversational history and patient data from the SQLite database upon invocation. Tool usage is simulated via deterministic prompt parsing, allowing the LLM to output structured JSON commands that the backend Python logic executes (e.g., triggering a database commit and dispatching a `Notification`).

---

## 4. Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | React.js, Vite |
| **Styling & UI** | Tailwind CSS, Lucide React (Icons) |
| **Backend Framework** | Python, FastAPI |
| **Database & ORM** | PostgreSQL, SQLAlchemy, Pydantic |
| **AI / ML Models** | LLaMA 3.3 (70B) |
| **LLM Infrastructure** | Groq API, OpenRouter API |
| **Deployment & Hosting** | Vercel (Vite Builder, `@vercel/python` Builder), Vercel Postgres / Neon |

---

## 5. Getting Started & Installation

### Prerequisites
- Node.js (v18+)
- Python 3.9+

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python -m venv .venv`
3. Activate it: 
   - Mac/Linux: `source .venv/bin/activate`
   - Windows: `.venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the local server: `uvicorn app.main:app --reload --port 8000`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

### Environment Variables
Duplicate `.env.example` to `.env` in the root directory and populate your keys:
```env
GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key
```

---

## 6. API & Interface Specifications

The backend exposes a RESTful API with automated Swagger documentation available at `/docs` when running locally.

### Primary Endpoints
- `GET /api/v1/appointments/departments`: Fetches all hospital departments.
- `GET /api/v1/appointments/queue`: Retrieves the active triage/waiting queue.
- `POST /api/v1/appointments/book`: Submits a new appointment (handled by the Appointment Agent).
- `GET /api/v1/notifications/{patient|staff}/{id}`: Retrieves in-app notifications for the respective user.
- `PUT /api/v1/notifications/{id}/read`: Marks a notification as read.

---

## 7. Security & Compliance

- **Stateless Authentication**: (In Progress) The platform is designed to use JWT-based authentication for stateless validation on Vercel Edge functions.
- **Credential Management**: API keys and database URIs are strictly managed via Vercel Environment Variables. The local `.env` is isolated and ignored in version control.
- **AI Output Handling**: Clinical outputs generated by LLaMA are explicitly marked as "AI-Generated" in the UI. Pydantic strictly strips malicious injections from JSON payloads before database insertion.

---

## 8. Contributing & Roadmap

### Roadmap
- [x] Integrate Groq for sub-second LLM inference.
- [x] Implement in-app notifications for Patients, Doctors, and Nurses.
- [x] Migrate SQLite to PostgreSQL for production scale.
- [x] Implement dedicated Pharmacist Dashboard with interactive HTML5 Drag-and-Drop flow.
- [ ] Add WebSockets for real-time Queue Board updates instead of polling.
- [ ] Implement robust RBAC (Role-Based Access Control) using JWTs.

### Contributing
We welcome contributions! Please follow standard GitHub flow:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.
