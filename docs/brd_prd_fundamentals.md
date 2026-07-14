# Business & Product Requirements Document: CuraLink

This document outlines the Business Requirements (BRD) and Product Requirements (PRD) governing the CuraLink Clinic Operations Platform.

---

## Part 1: Business Requirements Document (BRD)

### 1.1 Executive Summary
CuraLink solves the clinic operational friction that directly drains revenue and decreases patient satisfaction in private clinics and urgent care environments. By unifying intake, scheduling, triage, and doctor HUD interfaces into a single shared database runtime, we eliminate wait-time transparency issues, improve diagnostic throughput safety, and minimize administrative overhead.

### 1.2 Business Goals
1.  **Reduce Queue Bleed**: Decrease average patient drop-outs (leaving before being seen) by 15% via transparent wait estimations.
2.  **Minimize Administrative Friction**: Reduce receptionist triage log-time and token handoffs by 30%.
3.  **Enhance Safety Compliance**: Prevent patient allergic/drug contraindications by offering real-time decision warnings.
4.  **Maximize Clinician Utility**: Provide doctors with a zero-context-switching interface, saving 3 minutes per consultation.

---

## Part 2: Product Requirements Document (PRD)

### 2.1 Scope & Functional Requirements

#### 2.1.1 Reception Desk Intake Management
*   **Req 1.1**: The system must allow the registration and queue check-in of walk-in patients (name, phone, department, doctor, complaint).
*   **Req 1.2**: The system must calculate real-time wait estimations using queue position and average treatment speed of the department.
*   **Req 1.3**: The system must provide a patient lookup tool searching by MRN or Email to retrieve historical visit details.

#### 2.1.2 Nurse Triage & Vitals Portal
*   **Req 2.1**: The portal must render patients awaiting intake triage separately from active clinic queues.
*   **Req 2.2**: The system must record vital sign telemetry (BP, Temp, Pulse, O2 Saturation, and chief complaint).
*   **Req 2.3**: An embedded AI triage classification engine must output urgency levels: Critical (L1), Emergency (L2), Urgent (L3), or Routine (L4).

#### 2.1.3 Doctor Consultation HUD
*   **Req 3.1**: The Doctor panel must retrieve vital statistics recorded during triage in real time.
*   **Req 3.2**: The system must render patient EHR data, allergies, chronic illnesses, and list past completed consultations.
*   **Req 3.3**: The AI Decision Support module must parse allergies and warn the doctor if they select conflicting medications.
*   **Req 3.4**: Clicking "Finalize Consultation" must mark the queue item as complete and remove it from active lists.

### 2.2 System & Technical Requirements

*   **Architecture**: FastAPI backend REST API (Python) + Vite-React frontend (Javascript/Tailwind/Vanilla CSS).
*   **Database**: SQLite (`mediflow.db`) locally, utilizing SQLAlchemy ORM.
*   **Synchronization**: Client-side polling interval of 8 seconds to synchronize frontend widgets with database status.
*   **Security & Compliance**: Standardized role access simulation (Doctor, Nurse, Receptionist) with read-only restriction schemas on sensitive telemetry.
