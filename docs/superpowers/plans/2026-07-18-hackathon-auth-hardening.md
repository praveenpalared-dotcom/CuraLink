# Hackathon Auth Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CuraLink's login flow perform a real password check and stop leaking the DB connection string, without breaking any existing dashboard or the one-click judge demo logins.

**Architecture:** Add a `password_hash` column to `Patient` and `Staff`, a small `backend/app/auth/` module (bcrypt hashing + JWT issuance), and a new `POST /api/v1/auth/login` endpoint. The existing login UI keeps its exact same buttons/forms but calls this real endpoint instead of fabricating a user object client-side. Strip the DB URL out of `/api/v1/debug`. Existing dashboard data routes are untouched.

**Tech Stack:** FastAPI, SQLAlchemy, `passlib[bcrypt]`, `python-jose` (all already in `backend/requirements.txt` and installed in `backend/.venv`), pytest + `fastapi.testclient.TestClient` for backend tests, React (manual browser verification for frontend — no test runner exists in `frontend/package.json` and adding one is out of scope).

---

## Discovered constraint (read before Task 8)

The frontend's hardcoded `demoStaff` list in `Login.jsx` includes 4 emails that **do not exist** in the seeded `Staff` table (`jessica.taylor@mediflow.com`, `michael.rx@mediflow.com`, `sarah.reception@mediflow.com`, `admin@mediflow.com`) — today this "works" only because the quick-login buttons never call the backend at all. Once quick-login calls the real `/auth/login` endpoint, these would 401 and break the judge demo. Task 8 fixes the emails to match real seeded staff for doctor/nurse/receptionist/admin. The `pharmacist` role has **no backing concept anywhere in the backend** (`StaffRole` enum has no `pharmacist` value) — Task 10 keeps that one quick-login button exactly as it is today (client-side only, no backend call), since there is nothing in the database to authenticate against and building a backend pharmacist concept is out of scope.

---

### Task 1: Add `password_hash` column to `Patient` and `Staff`

**Files:**
- Modify: `backend/app/models/models.py:42-57` (Patient), `backend/app/models/models.py:95-109` (Staff)

- [ ] **Step 1: Add the column to `Patient`**

In `backend/app/models/models.py`, inside `class Patient(Base):`, add after `medical_record_number`:

```python
    medical_record_number = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
```

- [ ] **Step 2: Add the column to `Staff`**

Inside `class Staff(Base):`, add after `department_id`:

```python
    department_id = Column(Integer, ForeignKey("hospital_departments.id", ondelete="SET NULL"))
    password_hash = Column(String(255), nullable=True)
    max_weekly_hours = Column(Integer, default=40)
```

- [ ] **Step 3: Verify the app still imports cleanly**

Run: `cd /Users/jay/CuraLink && backend/.venv/bin/python -c "from backend.app.models.models import Patient, Staff; print(Patient.password_hash, Staff.password_hash)"`
Expected: prints the two `InstrumentedAttribute` objects with no errors.

- [ ] **Step 4: Commit**

```bash
git add backend/app/models/models.py
git commit -m "feat: add password_hash column to Patient and Staff models"
```

---

### Task 2: Password hashing + JWT utilities

**Files:**
- Create: `backend/app/auth/__init__.py`
- Create: `backend/app/auth/security.py`
- Test: `backend/tests/__init__.py`
- Test: `backend/tests/test_security.py`

- [ ] **Step 1: Create the auth package init**

```python
# backend/app/auth/__init__.py
```

(empty file — makes `backend.app.auth` importable)

- [ ] **Step 2: Create the tests package init**

```python
# backend/tests/__init__.py
```

(empty file)

- [ ] **Step 3: Write the failing tests**

```python
# backend/tests/test_security.py
from backend.app.auth.security import hash_password, verify_password, create_access_token, decode_access_token


def test_hash_password_and_verify_correct_password():
    hashed = hash_password("password123")
    assert hashed != "password123"
    assert verify_password("password123", hashed) is True


def test_verify_rejects_wrong_password():
    hashed = hash_password("password123")
    assert verify_password("wrong-password", hashed) is False


def test_create_and_decode_access_token_round_trip():
    token = create_access_token({"sub": "1", "role": "patient"})
    payload = decode_access_token(token)
    assert payload["sub"] == "1"
    assert payload["role"] == "patient"
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd /Users/jay/CuraLink && backend/.venv/bin/pytest backend/tests/test_security.py -v`
Expected: FAIL/ERROR with `ModuleNotFoundError: No module named 'backend.app.auth'`

- [ ] **Step 5: Implement the security module**

```python
# backend/app/auth/security.py
import os
import datetime
from passlib.context import CryptContext
from jose import jwt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-insecure-hackathon-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 8


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd /Users/jay/CuraLink && backend/.venv/bin/pytest backend/tests/test_security.py -v`
Expected: `3 passed`

- [ ] **Step 7: Commit**

```bash
git add backend/app/auth/__init__.py backend/app/auth/security.py backend/tests/__init__.py backend/tests/test_security.py
git commit -m "feat: add password hashing and JWT utilities"
```

---

### Task 3: Login request/response schemas

**Files:**
- Modify: `backend/app/schemas/schemas.py`

- [ ] **Step 1: Add the schemas**

At the end of `backend/app/schemas/schemas.py`, add:

```python
# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    session_type: str  # "patient" or "hospital"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    session_type: str
    role: str
    user: dict
```

- [ ] **Step 2: Verify it imports cleanly**

Run: `cd /Users/jay/CuraLink && backend/.venv/bin/python -c "from backend.app.schemas.schemas import LoginRequest, LoginResponse; print('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas/schemas.py
git commit -m "feat: add LoginRequest and LoginResponse schemas"
```

---

### Task 4: Seed demo accounts with real password hashes

**Files:**
- Modify: `backend/app/main.py` (imports, patient seeding block, staff seeding block)

- [ ] **Step 1: Import the hashing helper**

In `backend/app/main.py`, modify the import line (currently line 6):

```python
    from backend.app.routers import appointments, queue, notifications, post_recovery
    from backend.app.auth.security import hash_password
```

- [ ] **Step 2: Hash the demo password once, near the seeding function**

Immediately above `def ensure_database_seeded():` (currently line 36), add:

```python
    DEMO_PASSWORD_HASH = hash_password("password123")

    def ensure_database_seeded():
```

- [ ] **Step 3: Set `password_hash` on every seeded `Patient`**

In the patient-seeding block (currently lines 97-109), add `password_hash=DEMO_PASSWORD_HASH` to every `Patient(...)` constructor call. For example, the first one becomes:

```python
                        Patient(first_name="John", last_name="Doe", email="john.doe@gmail.com", phone_number="+15550199", date_of_birth=datetime.date(1990, 5, 12), gender="Male", medical_record_number="MRN-848202", password_hash=DEMO_PASSWORD_HASH),
```

Apply the same `password_hash=DEMO_PASSWORD_HASH` addition to all 11 `Patient(...)` lines in that block.

- [ ] **Step 4: Set `password_hash` on every seeded `Staff` row**

In the staff-seeding block (currently lines 127-143), modify both loops:

```python
                    for f_name, l_name, email, role, dept_name in staff_data:
                        db.add(Staff(
                            first_name=f_name,
                            last_name=l_name,
                            email=email,
                            role=role,
                            department_id=dept_map[dept_name],
                            password_hash=DEMO_PASSWORD_HASH
                        ))
                    # Also add doctors to staff list
                    for doc in db.query(Doctor).all():
                        db.add(Staff(
                            first_name=doc.first_name,
                            last_name=doc.last_name,
                            email=doc.email,
                            role=StaffRole.doctor,
                            department_id=doc.department_id,
                            password_hash=DEMO_PASSWORD_HASH
                        ))
```

- [ ] **Step 5: Delete the local sqlite dev file so seeding re-runs with the new column**

Run: `cd /Users/jay/CuraLink && rm -f mediflow.db`
(The app recreates and reseeds it automatically on next run since `IS_SEEDED` is an in-memory flag per process and `Base.metadata.create_all` runs on import.)

- [ ] **Step 6: Verify the app still imports and seeds cleanly**

Run: `cd /Users/jay/CuraLink && backend/.venv/bin/python -c "
from backend.app.main import app, ensure_database_seeded
ensure_database_seeded()
from backend.app.database import SessionLocal
from backend.app.models.models import Patient
db = SessionLocal()
p = db.query(Patient).filter(Patient.email == 'john.doe@gmail.com').first()
print(p.password_hash is not None)
db.close()
"`
Expected: `True`

- [ ] **Step 7: Commit**

```bash
git add backend/app/main.py
git commit -m "feat: seed demo patients and staff with hashed demo password"
```

---

### Task 5: `/api/v1/auth/login` endpoint

**Files:**
- Create: `backend/app/auth/router.py`
- Modify: `backend/app/main.py` (register the router)
- Test: `backend/tests/test_auth_endpoints.py`

- [ ] **Step 1: Write the failing tests**

```python
# backend/tests/test_auth_endpoints.py
import os
import tempfile

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mktemp(suffix='.db')}"

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_patient_login_succeeds_with_correct_demo_password():
    response = client.post("/api/v1/auth/login", json={
        "email": "john.doe@gmail.com",
        "password": "password123",
        "session_type": "patient",
    })
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["role"] == "patient"
    assert body["user"]["email"] == "john.doe@gmail.com"


def test_patient_login_fails_with_wrong_password():
    response = client.post("/api/v1/auth/login", json={
        "email": "john.doe@gmail.com",
        "password": "wrong-password",
        "session_type": "patient",
    })
    assert response.status_code == 401


def test_patient_login_fails_for_unknown_email():
    response = client.post("/api/v1/auth/login", json={
        "email": "nobody@nowhere.com",
        "password": "password123",
        "session_type": "patient",
    })
    assert response.status_code == 401


def test_staff_login_succeeds_with_correct_demo_password():
    response = client.post("/api/v1/auth/login", json={
        "email": "richard.patel@mediflow.com",
        "password": "password123",
        "session_type": "hospital",
    })
    assert response.status_code == 200
    body = response.json()
    assert body["role"] == "doctor"
    assert body["user"]["email"] == "richard.patel@mediflow.com"


def test_login_rejects_invalid_session_type():
    response = client.post("/api/v1/auth/login", json={
        "email": "john.doe@gmail.com",
        "password": "password123",
        "session_type": "not-a-real-type",
    })
    assert response.status_code == 400
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/jay/CuraLink && backend/.venv/bin/pytest backend/tests/test_auth_endpoints.py -v`
Expected: FAIL with 404 (no `/api/v1/auth/login` route yet)

- [ ] **Step 3: Implement the auth router**

```python
# backend/app/auth/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import Patient, Staff
from backend.app.auth.security import verify_password, create_access_token
from backend.app.schemas.schemas import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if payload.session_type == "patient":
        record = db.query(Patient).filter(Patient.email == payload.email).first()
        if not record or not record.password_hash or not verify_password(payload.password, record.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

        token = create_access_token({"sub": str(record.id), "role": "patient", "session_type": "patient"})
        user = {
            "id": record.id,
            "first_name": record.first_name,
            "last_name": record.last_name,
            "email": record.email,
            "phone_number": record.phone_number,
            "date_of_birth": str(record.date_of_birth),
            "gender": record.gender,
            "medical_record_number": record.medical_record_number,
        }
        return LoginResponse(access_token=token, session_type="patient", role="patient", user=user)

    if payload.session_type == "hospital":
        record = db.query(Staff).filter(Staff.email == payload.email).first()
        if not record or not record.password_hash or not verify_password(payload.password, record.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

        token = create_access_token({"sub": str(record.id), "role": record.role.value, "session_type": "hospital"})
        user = {
            "id": record.id,
            "email": record.email,
            "name": f"{record.first_name} {record.last_name}",
        }
        return LoginResponse(access_token=token, session_type="hospital", role=record.role.value, user=user)

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="session_type must be 'patient' or 'hospital'.")
```

- [ ] **Step 4: Register the router in `main.py`**

Modify the import line from Task 4 (currently line 7) to also import the router:

```python
    from backend.app.routers import appointments, queue, notifications, post_recovery
    from backend.app.auth.security import hash_password
    from backend.app.auth.router import router as auth_router
```

And modify the router-registration block (currently lines 27-31) to add the auth router:

```python
    # Register routers
    app.include_router(appointments.router, prefix="/api/v1")
    app.include_router(queue.router, prefix="/api/v1")
    app.include_router(notifications.router, prefix="/api/v1")
    app.include_router(post_recovery.router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/api/v1")
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/jay/CuraLink && backend/.venv/bin/pytest backend/tests/test_auth_endpoints.py -v`
Expected: `5 passed`

- [ ] **Step 6: Commit**

```bash
git add backend/app/auth/router.py backend/app/main.py backend/tests/test_auth_endpoints.py
git commit -m "feat: add /api/v1/auth/login endpoint"
```

---

### Task 6: Stop leaking the database URL from `/api/v1/debug`

**Files:**
- Modify: `backend/app/main.py:275-303`
- Test: `backend/tests/test_debug_endpoint.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_debug_endpoint.py
import os
import tempfile

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mktemp(suffix='.db')}"

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_debug_endpoint_does_not_leak_database_url():
    response = client.get("/api/v1/debug")
    assert response.status_code == 200
    body = response.json()
    assert "db_url" not in body
    assert body["success"] is True
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/jay/CuraLink && backend/.venv/bin/pytest backend/tests/test_debug_endpoint.py -v`
Expected: FAIL — `assert "db_url" not in body` fails because `db_url` is present

- [ ] **Step 3: Remove `db_url` from the response**

In `backend/app/main.py`, the `debug_info` function currently returns:

```python
                db_url = str(db.bind.url)
                return {
                    "success": True,
                    "db_url": db_url,
                    "dept_count": dept_count,
                }
```

Change it to:

```python
                return {
                    "success": True,
                    "dept_count": dept_count,
                }
```

(Remove the now-unused `db_url = str(db.bind.url)` line entirely.)

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/jay/CuraLink && backend/.venv/bin/pytest backend/tests/test_debug_endpoint.py -v`
Expected: `1 passed`

- [ ] **Step 5: Commit**

```bash
git add backend/app/main.py backend/tests/test_debug_endpoint.py
git commit -m "fix: stop leaking database connection string from /api/v1/debug"
```

---

### Task 7: Make CORS origin configurable

**Files:**
- Modify: `backend/app/main.py:18-25`
- Modify: `.env.example`

- [ ] **Step 1: Change the CORS middleware to read from an env var**

Current code:

```python
    # CORS Policy configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # Allow all for hackathon environment ease
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
```

Replace with:

```python
    # CORS Policy configuration
    _cors_origins_env = os.getenv("FRONTEND_ORIGIN")
    cors_origins = [o.strip() for o in _cors_origins_env.split(",")] if _cors_origins_env else ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
```

Also add `import os` to the top of the `try:` block in `main.py` (alongside the existing `import datetime`), since `os` is not yet imported there.

- [ ] **Step 2: Document the new env var**

Add to `.env.example`:

```env
# Optional: comma-separated list of allowed frontend origins for CORS.
# Leave unset to allow all origins (default, current hackathon-demo behavior).
FRONTEND_ORIGIN=
```

- [ ] **Step 3: Verify the app still starts and serves with no env var set**

Run: `cd /Users/jay/CuraLink && backend/.venv/bin/python -c "from backend.app.main import app; print('ok')"`
Expected: `ok`

- [ ] **Step 4: Run the full backend test suite to confirm nothing regressed**

Run: `cd /Users/jay/CuraLink && backend/.venv/bin/pytest backend/tests/ -v`
Expected: `9 passed`

- [ ] **Step 5: Commit**

```bash
git add backend/app/main.py .env.example
git commit -m "feat: make CORS origin configurable via FRONTEND_ORIGIN env var"
```

---

### Task 8: Fix demo staff emails to match seeded accounts

**Files:**
- Modify: `frontend/src/pages/Login.jsx:109-115`

- [ ] **Step 1: Update the `demoStaff` array**

Current code:

```jsx
  const demoStaff = [
    { name: 'Dr. Richard Patel', email: 'richard.patel@mediflow.com', role: 'doctor' },
    { name: 'Nurse Jessica Taylor', email: 'jessica.taylor@mediflow.com', role: 'nurse' },
    { name: 'Pharmacist Michael', email: 'michael.rx@mediflow.com', role: 'pharmacist' },
    { name: 'Receptionist Sarah', email: 'sarah.reception@mediflow.com', role: 'receptionist' },
    { name: 'Operations Admin', email: 'admin@mediflow.com', role: 'admin' }
  ];
```

Replace with (emails now match actually-seeded `Staff` rows from `backend/app/main.py`; `pharmacist` has no backend record by design — see Task 10):

```jsx
  const demoStaff = [
    { name: 'Dr. Richard Patel', email: 'richard.patel@mediflow.com', role: 'doctor' },
    { name: 'Nurse Emily Nightingale', email: 'emily.n@mediflow.com', role: 'nurse' },
    { name: 'Pharmacist Michael', email: 'michael.rx@mediflow.com', role: 'pharmacist' },
    { name: 'Receptionist Michael Scott', email: 'michael.s@mediflow.com', role: 'receptionist' },
    { name: 'Operations Admin Angela Martin', email: 'angela.m@mediflow.com', role: 'admin' }
  ];
```

- [ ] **Step 2: Verify no other file references the old emails**

Run: `cd /Users/jay/CuraLink && grep -rn "jessica.taylor\|sarah.reception@mediflow\|admin@mediflow.com" frontend/src`
Expected: no output (no other references)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Login.jsx
git commit -m "fix: point demo staff quick-login accounts at real seeded staff"
```

---

### Task 9: Wire patient login to the real endpoint

**Files:**
- Modify: `frontend/src/pages/Login.jsx:117-165` (`handlePatientSubmit`)
- Modify: `frontend/src/pages/Login.jsx:252-272` (`handleQuickPatientLogin`)

- [ ] **Step 1: Replace `handlePatientSubmit`**

Replace the entire current function (lines 117-165) with:

```jsx
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    if (!patientEmail.trim()) {
      alert("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: patientEmail,
          password: patientPassword,
          session_type: 'patient',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('curalink_token', data.access_token);
        setLoading(false);
        onLogin({
          sessionType: 'patient',
          role: 'patient',
          user: data.user,
        });
      } else {
        setLoading(false);
        alert("Invalid email or password.");
      }
    } catch (err) {
      console.error("Patient login request failed:", err);
      setLoading(false);
      alert("Unable to reach the authentication service. Please try again.");
    }
  };
```

- [ ] **Step 2: Replace `handleQuickPatientLogin`**

Replace the entire current function (lines 252-272) with:

```jsx
  const handleQuickPatientLogin = async (e, p) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: p.email,
          password: 'password123',
          session_type: 'patient',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('curalink_token', data.access_token);
        setLoading(false);
        onLogin({
          sessionType: 'patient',
          role: 'patient',
          user: data.user,
        });
      } else {
        setLoading(false);
        alert("Demo account authentication failed.");
      }
    } catch (err) {
      console.error("Quick patient login failed:", err);
      setLoading(false);
      alert("Unable to reach the authentication service.");
    }
  };
```

- [ ] **Step 3: Manually verify in the browser**

Run the dev servers (`cd backend && backend/.venv/bin/uvicorn app.main:app --reload --port 8000` and `cd frontend && npm run dev`), then in the browser:
1. Open the Patient Portal tab, click one of the "Quick Demo Patients" buttons (e.g. John Doe) → should log in exactly as before, landing on the Patient Dashboard.
2. Manually type `john.doe@gmail.com` with the default password `password123` → should succeed.
3. Manually type `john.doe@gmail.com` with a wrong password → should show the "Invalid email or password." alert instead of logging in.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Login.jsx
git commit -m "feat: wire patient login to real /api/v1/auth/login endpoint"
```

---

### Task 10: Wire hospital staff login to the real endpoint (except pharmacist)

**Files:**
- Modify: `frontend/src/pages/Login.jsx:167-186` (`handleHospitalSubmit`)
- Modify: `frontend/src/pages/Login.jsx:274-283` (`handleQuickStaffLogin`)

- [ ] **Step 1: Replace `handleHospitalSubmit`**

Replace the entire current function (lines 167-186) with:

```jsx
  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    if (!hospitalEmail.trim()) {
      alert("Please enter your staff ID or email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: hospitalEmail,
          password: hospitalPassword,
          session_type: 'hospital',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('curalink_token', data.access_token);
        setLoading(false);
        onLogin({
          sessionType: 'hospital',
          role: data.role,
          user: data.user,
        });
      } else {
        setLoading(false);
        alert("Invalid staff email or password.");
      }
    } catch (err) {
      console.error("Hospital login request failed:", err);
      setLoading(false);
      alert("Unable to reach the authentication service. Please try again.");
    }
  };
```

- [ ] **Step 2: Replace `handleQuickStaffLogin`**

Replace the entire current function (lines 274-283) with (the `pharmacist` role has no backend record — see the "Discovered constraint" note at the top of this plan — so it keeps working exactly as it does today, client-side only):

```jsx
  const handleQuickStaffLogin = async (staff) => {
    if (staff.role === 'pharmacist') {
      // No backend concept of a pharmacist Staff record exists yet.
      // Keep this one as a client-side demo login, same as before.
      onLogin({
        sessionType: 'hospital',
        role: 'pharmacist',
        user: {
          email: staff.email,
          name: staff.name
        }
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: staff.email,
          password: 'password123',
          session_type: 'hospital',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('curalink_token', data.access_token);
        setLoading(false);
        onLogin({
          sessionType: 'hospital',
          role: data.role,
          user: data.user,
        });
      } else {
        setLoading(false);
        alert("Demo staff authentication failed.");
      }
    } catch (err) {
      console.error("Quick staff login failed:", err);
      setLoading(false);
      alert("Unable to reach the authentication service.");
    }
  };
```

- [ ] **Step 3: Manually verify in the browser**

With both dev servers running:
1. Hospital Staff tab → click each of the 5 "Quick Demo Staff Accounts" buttons (Doctor, Nurse, Pharmacist, Receptionist, Admin) → each should land on its correct dashboard exactly as before.
2. Manually type `richard.patel@mediflow.com` with password `password123`, any role selected in the dropdown → should log in as doctor (the dropdown selection no longer overrides the real role returned by the backend — confirm the app lands on the Doctor Dashboard regardless of what was selected in the dropdown).
3. Manually type `richard.patel@mediflow.com` with a wrong password → should show the "Invalid staff email or password." alert.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Login.jsx
git commit -m "feat: wire hospital staff login to real /api/v1/auth/login endpoint"
```

---

### Task 11: Update README security section

**Files:**
- Modify: `README.md:119-124`

- [ ] **Step 1: Replace the Security & Compliance section**

Current content:

```markdown
## 7. Security & Compliance

- **Stateless Authentication**: (In Progress) The platform is designed to use JWT-based authentication for stateless validation on Vercel Edge functions.
- **Credential Management**: API keys and database URIs are strictly managed via Vercel Environment Variables. The local `.env` is isolated and ignored in version control.
- **AI Output Handling**: Clinical outputs generated by LLaMA are explicitly marked as "AI-Generated" in the UI. Pydantic strictly strips malicious injections from JSON payloads before database insertion.
```

Replace with:

```markdown
## 7. Security & Compliance

- **Password-Based Authentication**: `POST /api/v1/auth/login` verifies patient and staff credentials against `bcrypt`-hashed passwords (via `passlib`) and issues a signed JWT (`python-jose`, HS256, 8-hour expiry) on success. Incorrect credentials return `401 Unauthorized` instead of granting access.
- **Credential Management**: API keys, database URIs, and the JWT signing secret are managed via environment variables (`JWT_SECRET`, `DATABASE_URL`, `FRONTEND_ORIGIN`). The local `.env` is isolated and ignored in version control. The `/api/v1/debug` diagnostic route no longer exposes the database connection string.
- **AI Output Handling**: Clinical outputs generated by LLaMA are explicitly marked as "AI-Generated" in the UI. Pydantic strictly strips malicious injections from JSON payloads before database insertion.

> This is a hackathon-stage implementation: login is real (hashed passwords, real verification, real JWTs), but most data routes are not yet gated behind that JWT and there is no audit logging or encryption-at-rest. Treat this as a security foundation, not a production/HIPAA-compliant posture.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update security section to reflect real auth implementation"
```

---

## Final verification

- [ ] Run the full backend test suite: `cd /Users/jay/CuraLink && backend/.venv/bin/pytest backend/tests/ -v` → expect `9 passed`
- [ ] Start both dev servers and click through every quick-login button (3 patients + 5 staff) — all land on their existing dashboards with no visible change
- [ ] Confirm a wrong password on both the patient and hospital manual sign-in forms shows a rejection alert instead of logging in
- [ ] Confirm `/api/v1/debug` no longer returns `db_url`
- [ ] Confirm every existing dashboard (Doctor, Nurse, Reception, Admin, Patient, Pharmacist) still loads its data with no new 401s
