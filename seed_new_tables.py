from backend.app.database import SessionLocal, engine, Base
from backend.app.models.models import BloodInventory, IncomingAmbulance, ResuscitationBay, TraumaQueue, PediatricPatient, MaternityPatient, BloodRequest

# Ensure tables are created
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    if db.query(BloodInventory).count() == 0:
        db.add_all([
            BloodInventory(blood_group="A+", units_available=45, status="Optimal"),
            BloodInventory(blood_group="A-", units_available=12, status="Low"),
            BloodInventory(blood_group="B+", units_available=30, status="Optimal"),
            BloodInventory(blood_group="B-", units_available=5, status="Critical"),
            BloodInventory(blood_group="O+", units_available=50, status="Optimal"),
            BloodInventory(blood_group="O-", units_available=8, status="Critical"),
            BloodInventory(blood_group="AB+", units_available=25, status="Optimal"),
            BloodInventory(blood_group="AB-", units_available=15, status="Optimal")
        ])
        db.add_all([
            BloodRequest(patient_id=1, blood_group="O-", units_required=4, urgency="Immediate (Code Red)", status="requested"),
            BloodRequest(patient_id=2, blood_group="B-", units_required=2, urgency="High", status="requested"),
            BloodRequest(patient_id=3, blood_group="A+", units_required=3, urgency="Routine", status="requested")
        ])
        db.commit()

    if db.query(IncomingAmbulance).count() == 0:
        db.add_all([
            IncomingAmbulance(id="AMB-104", eta="2 mins", priority="Critical", issue="Multiple Trauma - RTA", hr=142, bp="80/50", o2="88%"),
            IncomingAmbulance(id="AMB-209", eta="8 mins", priority="High", issue="Suspected Myocardial Infarction", hr=110, bp="160/95", o2="94%")
        ])
        db.add_all([
            ResuscitationBay(bed_name="Resus Bay 1", patient_name="Unknown Male (~40s)", status="Active CPR", team_lead="Dr. Sarah Jenkins", time_in_bay="14 mins"),
            ResuscitationBay(bed_name="Resus Bay 2", patient_name="Maria Garcia", status="Stabilizing", team_lead="Dr. Marcus Vance", time_in_bay="42 mins")
        ])
        db.add_all([
            TraumaQueue(patient_name="James Wilson", triage_level="Red (Immediate)", complaint="Severe Chest Pain", wait_time="4 mins"),
            TraumaQueue(patient_name="Lisa Ray", triage_level="Yellow (Urgent)", complaint="Deep Laceration Arm", wait_time="12 mins"),
            TraumaQueue(patient_name="David Kim", triage_level="Yellow (Urgent)", complaint="Closed Fracture Leg", wait_time="25 mins")
        ])
        db.commit()

    if db.query(PediatricPatient).count() == 0:
        db.add_all([
            PediatricPatient(id="PED-401", name="Lily Anderson", age="4 months", reason="Routine Vaccination", time="10:00 AM", status="Checked In", parent="Sarah Anderson"),
            PediatricPatient(id="PED-402", name="James Wilson Jr.", age="6 years", reason="Fever & Cough", time="10:30 AM", status="Waiting", parent="James Wilson Sr."),
            PediatricPatient(id="PED-403", name="Emma Davis", age="2 years", reason="Growth Check", time="11:00 AM", status="Scheduled", parent="Michael Davis")
        ])
        db.commit()
        
    if db.query(MaternityPatient).count() == 0:
        db.add_all([
            MaternityPatient(id="MAT-201", name="Emily Clark", weeks="38w 2d", status="Active Labor", edd="2026-09-10", room="Labor Room 1", fhr="142 bpm"),
            MaternityPatient(id="MAT-202", name="Sophia Turner", weeks="12w 5d", status="Routine Scan", edd="2027-03-05", room="Scan Room A", fhr="N/A"),
            MaternityPatient(id="MAT-203", name="Rachel Green", weeks="40w 1d", status="Post-Op Recovery", edd="2026-08-25", room="Ward 4B", fhr="Delivered")
        ])
        db.commit()

    print("Database seeded successfully.")
finally:
    db.close()
