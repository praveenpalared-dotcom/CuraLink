# Product Discovery & Validation: CuraLink

CuraLink is a clinic operations management system designed to optimize patient waiting lobby experiences, streamline clinical intake, and assist healthcare providers through real-time queue orchestration and AI clinical decision support.

---

## 1. Problem Space Discovery
In modern clinical settings (urgent cares, community clinics, outpatient departments), operational inefficiencies lead to poor experiences for all stakeholders:
*   **For Patients**: Long, unpredictable wait times, lack of transparency on queue status, and repetitive intakes.
*   **For Nurses**: Chaotic intake triage flow, manual tracking of patients, and lack of real-time visibility into doctor availability.
*   **For Doctors**: Lack of high-density summary data on patient vitals, risk factors (e.g., allergies, drug contraindications) at a glance, and disconnected EHR/triage handovers.
*   **For Clinic Owners**: Operational bottlenecks, high patient no-show rates, and loss of revenue due to scheduling inefficiencies.

---

## 2. Hypothesis & Value Proposition
**Core Hypothesis**: By providing a unified, real-time telemetry dashboard that syncs the Receptionist, Nurse, and Doctor interfaces on a shared SQLite queue state:
1.  Average patient throughput time will decrease by **15-20%**.
2.  Lobby anxiety will reduce by providing transparent wait-time estimations.
3.  Clinical safety will increase through real-time AI warnings (e.g. contraindications, high-risk triage alerts).

### Value Proposition Matrix
| Stakeholder | Pain Point | CuraLink Feature | Expected Value Metric |
| :--- | :--- | :--- | :--- |
| **Patient** | Queue anxiety, waiting blind | Real-time token wait estimation | 30% increase in patient satisfaction |
| **Nurse** | Slow paper/manual vitals logging | Intake HUD with automatic risk level | 50% faster triage submission |
| **Doctor** | Cluttered EHR lookup, allergy risks | High-density EHR HUD with AI Alerts | Zero medication contraindication errors |
| **Receptionist** | Walk-in routing chaos, reschedule delays | Token caller system & lookup logs | 25% overhead reduction in front-desk tasks |

---

## 3. Product Validation Strategy
To validate the CuraLink MVP prior to scaling, the following validation framework is established:

### Phase 1: Prototype Validation (Completed)
*   **Action**: Internal testing of React dashboard panels (Reception, Nurse, Doctor) powered by a FastAPI/SQLite backend.
*   **Validation Check**: Verify WebSocket or polling-based status updates (e.g., status changes from `scheduled` -> `checked_in` -> `in_consultation` -> `completed` propagate immediately).

### Phase 2: Pilot Study (Target: 3 Local Urgent Cares)
*   **Methodology**: Run CuraLink in parallel with existing scheduling/EHR platforms for 14 days.
*   **Success Criteria**:
    *   Triage logs generated in under 90 seconds.
    *   Zero disconnects between receptionist calling a token and the doctor's queue updating.
    *   Positive qualitative feedback (NPS > 40) from clinicians.
