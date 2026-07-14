# User Personas & Use Cases: CuraLink

Understanding our target users guarantees CuraLink's high-density UX design meets real-world clinical demands.

---

## 1. User Personas

### 🧑‍💼 Sarah Jenkins — The Registrar (Receptionist)
*   **Context**: Front-desk receptionist at a busy community medical center.
*   **Frustrations**:
    *   Walk-in check-in bottleneck during peak morning hours.
    *   No quick way to lookup patient EHR histories to verify past visits when they arrive.
    *   Stressing over predicting wait times to inpatient arrivals.
*   **Goals**: Fast walk-in logging, instant token assignment, clear wait-time calculations, and quick access to previous patient visits.

### 🩺 Nurse Marcus Chen — The Triage Specialist
*   **Context**: Emergency nurse in charge of initial intake and vital logging.
*   **Frustrations**:
    *   High friction entering vitals into a legacy clunky system.
    *   Difficult to prioritize patients based on symptom urgency vs. arrival time.
    *   Slow communication channels to alert doctors about high-risk vitals (e.g. low O2 saturation).
*   **Goals**: Seamless, keyboard-friendly vitals registration, automated AI prioritization levels (Routine vs Critical), and immediate routing to the correct clinic list.

### 🧑‍⚕️ Dr. Richard Patel — The Attending Physician
*   **Context**: Lead physician managing active patient queues in general medicine.
*   **Frustrations**:
    *   Fragmented clinical systems; has to search multiple tabs to see past patient records.
    *   Cognitive overload trying to review clinical suggestions and identify contraindications manually.
    *   Poor tracking of consult times leading to clinic-wide delays.
*   **Goals**: High-density workspace containing vitals logs, historical EHR files, and AI-powered decision support (drug interaction checks, risk flags) all on a single unified console.

---

## 2. Core Use Cases

### Use Case 1: Walk-In Registration & Intake
*   **Actor**: Receptionist (Sarah)
*   **Pre-conditions**: Patient arrives at the clinic desk without a prior booking.
*   **Flow**:
    1.  Sarah opens the walk-in form on the Reception Dashboard.
    2.  Sarah enters the patient's name, phone, symptom complaint, and selects an available department/clinician.
    3.  CuraLink's AI calculates the estimated wait time based on the active queue length.
    4.  Sarah clicks "Register & Check In Walk-In."
    5.  A queue token (e.g. `TK-X`) is generated and pushed to the live database queue in real time.

### Use Case 2: Vitals Telemetry Intake & Safety Check
*   **Actor**: Nurse (Marcus)
*   **Pre-conditions**: A patient has been checked in by reception and is called for triage.
*   **Flow**:
    1.  Marcus selects the patient from the "Awaiting Vitals" queue.
    2.  Marcus reviews the auto-populated past history to check for chronic illnesses or allergies.
    3.  Marcus enters Blood Pressure, Temp, Pulse, and O2 Sat.
    4.  CuraLink's AI evaluates the vitals metrics and flags the priority status (e.g. Critical, Routine).
    5.  Marcus submits the triage file, moving the patient's status to `checked_in`.

### Use Case 3: Clinical Consultation & Finalization
*   **Actor**: Doctor (Dr. Patel)
*   **Pre-conditions**: The patient's status is `checked_in` and they are next in queue.
*   **Flow**:
    1.  Dr. Patel selects the active patient from the consultation list.
    2.  The doctor's HUD automatically loads the vital logs, EHR files, and historical consultations.
    3.  The doctor reviews the "AI Clinical Decision Support" box (highlighting drug contraindications, allergy risks).
    4.  The doctor records consultation notes, adds prescriptions, and completes the consult.
    5.  The system marks the slot as `completed` and cleans up the live queue.
