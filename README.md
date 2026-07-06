# MediFlow AI Starter Kit

Welcome to the **MediFlow AI** repository! This project is structured to help your 4-member hackathon team build, demo, and deploy an AI-powered hospital operations platform in 48 hours.

---

## Repository Structure

```
Takeover Hackathon/
├── backend/
│   ├── app/
│   │   ├── agents/           # Gemini AI agent controllers
│   │   │   ├── client.py
│   │   │   └── appointment_agent.py
│   │   ├── models/           # SQLAlchemy models
│   │   │   └── models.py
│   │   ├── routers/          # API endpoint routes
│   │   │   ├── appointments.py
│   │   │   └── queue.py
│   │   ├── schemas/          # Pydantic validation schemas
│   │   │   └── schemas.py
│   │   ├── database.py       # DB connection (SQLite/Postgres)
│   │   └── main.py           # FastAPI server entrypoint
│   └── requirements.txt      # Backend Python dependencies
├── README.md                 # Setup & running instructions
└── .env                      # API keys & environments (Create this)
```

---

## 1. Backend Setup & Run

### Prerequisites
* Python 3.9+ installed on your system.

### Steps
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   * **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **Windows (CMD):**
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   * **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up your environment variables:**
   Create a file named `.env` in the root of the project (`Takeover Hackathon/`) and add:
   ```env
   GEMINI_API_KEY="your-google-gemini-api-key-here"
   DATABASE_URL="sqlite:///./mediflow.db"
   ```
   *Note: If no `GEMINI_API_KEY` is set, the system automatically falls back to a simulated response mode so you can test all features without API limits or costs.*

6. **Start the FastAPI server:**
   ```bash
   uvicorn backend.app.main:app --reload
   ```
   * The server will run at: **`http://127.0.0.1:8000`**
   * Access interactive Swagger Documentation at: **`http://127.0.0.1:8000/docs`**
   * *The database will automatically initialize and seed with mock departments, doctors, and patients upon startup.*

---

## 2. Frontend Setup (Vite + React + Tailwind)

Follow these commands to quickly set up your React and Tailwind workspace:

1. **Initialize Vite React Project in the root directory:**
   ```bash
   # From the root directory:
   npm create vite@latest frontend -- --template react
   ```

2. **Navigate into the frontend directory & install dependencies:**
   ```bash
   cd frontend
   ```

3. **Install Tailwind CSS and its peer dependencies:**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. **Configure your template paths:**
   Open `tailwind.config.js` in the frontend directory and replace it with:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {
         colors: {
           brand: {
             dark: "#0F172A",
             accent: "#10B981",
             card: "#1E293B",
           }
         }
       },
     },
     plugins: [],
   }
   ```

5. **Add Tailwind directives to your CSS:**
   Open `src/index.css` and replace its contents with:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   body {
     background-color: #0F172A;
     color: #F8FAFC;
     font-family: 'Inter', sans-serif;
   }
   ```

6. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   * The frontend will boot locally (typically at **`http://localhost:5173`**).

---

## 3. Demo API Workflows (Self-Testing)

Use the Swagger dashboard (`/docs`) or `curl` commands to test the system:

### A. Conversational AI Appointment Booking
Sends raw text from a patient and gets back a scheduled appointment slot.
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/appointments/book-agent" \
     -H "Content-Type: application/json" \
     -d '{"patient_id": 1, "message": "I need to book a pediatric appointment for my daughter on Friday morning"}'
```

### B. Patient Check-In (Queue Insertion)
Simulates checking in John Doe (Patient ID 1, who has an appointment).
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/queue/check-in?appointment_id=1"
```

### C. Live Department Wait Times
Fetches the active load and wait estimates for Pediatrics (Department ID 3).
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/queue/department/3/wait-time"
```
