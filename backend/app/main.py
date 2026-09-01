try:
    import datetime
    import os
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from backend.app.database import engine, Base, SessionLocal
    from backend.app.routers import appointments, queue, notifications, post_recovery, research, orchestration, pathology, pharmacy, emergency, blood_bank, trauma, pediatrics, maternity
    from backend.app.auth.security import hash_password
    from backend.app.auth.router import router as auth_router
    from backend.app.models.models import HospitalDepartment, Doctor, Patient, Appointment, AppointmentStatus, QueueStatus

    # Create database tables automatically
    Base.metadata.create_all(bind=engine)

    app = FastAPI(
        title="CuraLink Backend",
        description="Clinical Intake Operations Engine",
        version="1.0.0"
    )

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

    # Register routers
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(appointments.router, prefix="/api/v1")
    app.include_router(queue.router, prefix="/api/v1")
    app.include_router(notifications.router, prefix="/api/v1")
    app.include_router(post_recovery.router, prefix="/api/v1")
    app.include_router(research.router, prefix="/api/v1")
    app.include_router(orchestration.router, prefix="/api/v1/orchestration")
    app.include_router(pathology.router, prefix="/api/v1/pathology")
    app.include_router(pharmacy.router, prefix="/api/v1/pharmacy")
    app.include_router(emergency.router, prefix="/api/v1/emergency")
    app.include_router(blood_bank.router, prefix="/api/v1/blood-bank")
    app.include_router(trauma.router, prefix="/api/v1/trauma")
    app.include_router(pediatrics.router, prefix="/api/v1/pediatrics")
    app.include_router(maternity.router, prefix="/api/v1/maternity")
    # Middleware to ensure database is seeded on the first request (safe for serverless imports)
    IS_SEEDED = False
    DEMO_PASSWORD_HASH = hash_password("password123")

    def ensure_database_seeded():
        global IS_SEEDED
        if not IS_SEEDED:
            db = SessionLocal()
            try:
                # 1. Seed Departments if missing
                if db.query(HospitalDepartment).count() == 0:
                    depts_to_seed = [
                        ("General Medicine", "Floor 1, Block A", 20),
                        ("Ophthalmology", "Floor 2, Block B", 30),
                        ("Pediatrics", "Floor 1, Block C", 25),
                        ("Orthopedics", "Floor 3, Block A", 40),
                        ("Cardiology", "Floor 4, Block D", 35),
                        ("Dermatology", "Floor 2, Block C", 20)
                    ]
                    for name, floor, treatment_time in depts_to_seed:
                        db.add(HospitalDepartment(name=name, building_floor=floor, avg_treatment_time_minutes=treatment_time))
                    db.commit()

                # 2. Seed Doctors if missing
                if db.query(Doctor).count() == 0:
                    dept_map = {d.name: d.id for d in db.query(HospitalDepartment).all()}
                    doctors_to_seed = [
                        ("Richard", "Patel", "richard.patel@mediflow.com", "General Medicine"),
                        ("Angela", "Yu", "angela.yu@mediflow.com", "Ophthalmology"),
                        ("Sarah", "Jenkins", "sarah.jenkins@mediflow.com", "Pediatrics"),
                        ("James", "Evans", "james.evans@mediflow.com", "Orthopedics"),
                        ("Marcus", "Vance", "marcus.vance@mediflow.com", "Cardiology"),
                        ("Chloe", "Bennett", "chloe.bennett@mediflow.com", "Dermatology"),
                        ("Alice", "Smith", "alice.smith@mediflow.com", "General Medicine"),
                        ("David", "Kim", "david.kim@mediflow.com", "General Medicine"),
                        ("Robert", "Chen", "robert.chen@mediflow.com", "Ophthalmology"),
                        ("Emily", "Watson", "emily.watson@mediflow.com", "Pediatrics"),
                        ("Thomas", "Mueller", "thomas.mueller@mediflow.com", "Orthopedics"),
                        ("Sophia", "Martinez", "sophia.martinez@mediflow.com", "Cardiology"),
                        ("Lisa", "Brown", "lisa.brown@mediflow.com", "Dermatology"),
                        ("Gregory", "House", "gregory.house@mediflow.com", "General Medicine"),
                        ("Dana", "Scully", "dana.scully@mediflow.com", "Pediatrics"),
                        ("Leonard", "McCoy", "leonard.mccoy@mediflow.com", "Cardiology"),
                        ("Stephen", "Strange", "stephen.strange@mediflow.com", "Orthopedics"),
                        ("John", "Watson", "john.watson@mediflow.com", "General Medicine"),
                        ("Perry", "Cox", "perry.cox@mediflow.com", "General Medicine"),
                        ("Meredith", "Grey", "meredith.grey@mediflow.com", "Orthopedics"),
                        ("Allison", "Cameron", "allison.cameron@mediflow.com", "General Medicine")
                    ]
                    for f_name, l_name, email, specialty in doctors_to_seed:
                        db.add(Doctor(
                            first_name=f_name, 
                            last_name=l_name, 
                            email=email, 
                            specialty=specialty, 
                            department_id=dept_map[specialty]
                        ))
                    db.commit()

                # Import Staff, StaffRole, Schedule
                from backend.app.models.models import Staff, StaffRole, Schedule, AnalyticsLog
                import random

                # 3. Seed Patients if empty
                if db.query(Patient).count() == 0:
                    patients = [
                        Patient(first_name="John", last_name="Doe", email="john.doe@gmail.com", phone_number="+15550199", date_of_birth=datetime.date(1990, 5, 12), gender="Male", medical_record_number="MRN-848202", password_hash=DEMO_PASSWORD_HASH, interests="Cancer, Oncology", diseases="Lung Cancer", location="Hyderabad"),
                        Patient(first_name="Jane", last_name="Smith", email="jane.smith@gmail.com", phone_number="+15550299", date_of_birth=datetime.date(1995, 9, 23), gender="Female", medical_record_number="MRN-193848", password_hash=DEMO_PASSWORD_HASH),
                        Patient(first_name="Tom", last_name="Johnson", email="tom.j@gmail.com", phone_number="+15550399", date_of_birth=datetime.date(1982, 12, 1), gender="Male", medical_record_number="MRN-729482", password_hash=DEMO_PASSWORD_HASH),
                        Patient(first_name="Alice", last_name="Williams", email="alice.w@gmail.com", phone_number="+15550499", date_of_birth=datetime.date(1975, 4, 15), gender="Female", medical_record_number="MRN-382910", password_hash=DEMO_PASSWORD_HASH),
                        Patient(first_name="Bob", last_name="Miller", email="bob.m@gmail.com", phone_number="+15550599", date_of_birth=datetime.date(2010, 8, 30), gender="Male", medical_record_number="MRN-482019", password_hash=DEMO_PASSWORD_HASH),
                        Patient(first_name="Charlie", last_name="Davis", email="charlie.d@gmail.com", phone_number="+15550699", date_of_birth=datetime.date(1950, 2, 20), gender="Male", medical_record_number="MRN-582930", password_hash=DEMO_PASSWORD_HASH),
                        Patient(first_name="Diana", last_name="Garcia", email="diana.g@gmail.com", phone_number="+15550799", date_of_birth=datetime.date(1988, 11, 5), gender="Female", medical_record_number="MRN-682039", password_hash=DEMO_PASSWORD_HASH),
                        Patient(first_name="Evan", last_name="Martinez", email="evan.m@gmail.com", phone_number="+15550899", date_of_birth=datetime.date(2001, 7, 19), gender="Male", medical_record_number="MRN-928103", password_hash=DEMO_PASSWORD_HASH),
                        Patient(first_name="Fiona", last_name="Clark", email="fiona.c@gmail.com", phone_number="+15550999", date_of_birth=datetime.date(1993, 3, 27), gender="Female", medical_record_number="MRN-301928", password_hash=DEMO_PASSWORD_HASH),
                        Patient(first_name="George", last_name="Rodriguez", email="george.r@gmail.com", phone_number="+15551099", date_of_birth=datetime.date(1968, 10, 14), gender="Male", medical_record_number="MRN-491029", password_hash=DEMO_PASSWORD_HASH),
                        Patient(first_name="Hannah", last_name="Lewis", email="hannah.l@gmail.com", phone_number="+15551199", date_of_birth=datetime.date(1985, 1, 8), gender="Female", medical_record_number="MRN-847291", password_hash=DEMO_PASSWORD_HASH)
                    ]
                    db.add_all(patients)
                    db.commit()

                # 4. Seed / Ensure Staff Records Exist
                dept_map = {d.name: d.id for d in db.query(HospitalDepartment).all()}
                default_dept_id = list(dept_map.values())[0] if dept_map else 1
                existing_emails = {s.email for s in db.query(Staff).all()}
                
                demo_staff_data = [
                    ("Dr. Richard", "Patel", "richard.patel@mediflow.com", StaffRole.doctor, "General Medicine"),
                    ("Emily", "Nightingale", "emily.n@mediflow.com", StaffRole.nurse, "General Medicine"),
                    ("Michael", "Scott", "michael.s@mediflow.com", StaffRole.receptionist, "General Medicine"),
                    ("Michael", "Pharmacist", "michael.rx@mediflow.com", StaffRole.pharmacist, "General Medicine"),
                    ("Angela", "Martin", "angela.m@mediflow.com", StaffRole.admin, "General Medicine"),
                    ("Dr. Jessica", "Davis", "jessica.davis@mediflow.com", StaffRole.command_center, "General Medicine"),
                ]
                for f_name, l_name, email, role, dept_name in demo_staff_data:
                    if email not in existing_emails:
                        db.add(Staff(
                            first_name=f_name,
                            last_name=l_name,
                            email=email,
                            role=role,
                            department_id=dept_map.get(dept_name, default_dept_id),
                            password_hash=DEMO_PASSWORD_HASH
                        ))
                        existing_emails.add(email)
                
                # Also ensure doctors exist in staff list
                for doc in db.query(Doctor).all():
                    if doc.email not in existing_emails:
                        db.add(Staff(
                            first_name=doc.first_name,
                            last_name=doc.last_name,
                            email=doc.email,
                            role=StaffRole.doctor,
                            department_id=doc.department_id,
                            password_hash=DEMO_PASSWORD_HASH
                        ))
                        existing_emails.add(doc.email)
                db.commit()

                # 5. Seed Schedules if empty
                if db.query(Schedule).count() == 0:
                    staff_list = db.query(Staff).all()
                    now_time = datetime.datetime.utcnow()
                    for s in staff_list:
                        db.add(Schedule(
                            staff_id=s.id,
                            shift_start=now_time,
                            shift_end=now_time + datetime.timedelta(hours=8),
                            is_on_call=False
                        ))
                    db.commit()

                # 6. Seed Appointments if empty
                if db.query(Appointment).count() == 0:
                    patients = db.query(Patient).all()
                    doctors = db.query(Doctor).all()
                    
                    now = datetime.datetime.utcnow()
                    
                    # Create some past appointments
                    for i in range(15):
                        p = random.choice(patients)
                        d = random.choice(doctors)
                        past_days = random.randint(1, 30)
                        past_time = now - datetime.timedelta(days=past_days, hours=random.randint(1, 8))
                        
                        appt = Appointment(
                            patient_id=p.id,
                            doctor_id=d.id,
                            department_id=d.department_id,
                            start_time=past_time,
                            end_time=past_time + datetime.timedelta(minutes=30),
                            status=random.choice([AppointmentStatus.completed, AppointmentStatus.cancelled, AppointmentStatus.no_show]),
                            chief_complaint=random.choice(["Fever and cough", "Routine eye exam", "Childhood vaccination", "Joint pain", "Chest tightness", "Skin rash"])
                        )
                        db.add(appt)
                        
                    # Create some future scheduled appointments
                    for i in range(20):
                        p = random.choice(patients)
                        d = random.choice(doctors)
                        future_days = random.randint(1, 7)
                        future = now + datetime.timedelta(days=future_days, hours=random.randint(1, 8))
                        
                        appt = Appointment(
                            patient_id=p.id,
                            doctor_id=d.id,
                            department_id=d.department_id,
                            start_time=future,
                            end_time=future + datetime.timedelta(minutes=30),
                            status=AppointmentStatus.scheduled,
                            chief_complaint=random.choice(["Routine checkup", "Medication refill", "Consultation", "Vaccination"])
                        )
                        db.add(appt)
                        
                    from backend.app.models.models import Notification, NotificationType, NotificationCategory, PostRecoveryTask, PostRecoveryTaskType, ClinicalTrial, ResearchPaper, SavedSearch
                    if db.query(Notification).count() == 0:
                        db.add(Notification(patient_id=1, type=NotificationType.app, message_body="Your appointment with Dr. Richard Patel has been confirmed for tomorrow at 10:00 AM.", status="sent", sent_at=now))
                        # Hackathon Notification
                        db.add(Notification(patient_id=1, type=NotificationType.app, category=NotificationCategory.clinical_trial, message_body="New Clinical Trial Found! A Phase-3 Lung Cancer trial near Hyderabad matches your profile with a 95% eligibility score.", action_text="Apply Now", action_url="/trials/1", status="sent", sent_at=now))
                        db.add(Notification(patient_id=1, type=NotificationType.app, message_body="Please remember to fast for 12 hours before your upcoming lipid panel test.", status="sent", sent_at=now - datetime.timedelta(hours=2)))
                        db.add(Notification(staff_id=1, type=NotificationType.app, message_body="Urgent: Patient John Doe has checked into the waiting room.", status="sent", sent_at=now))
                        db.add(Notification(staff_id=2, type=NotificationType.app, message_body="Triage alert: A patient in Lobby B requires immediate vital checks.", status="sent", sent_at=now - datetime.timedelta(minutes=15)))
                        db.commit()

                    if db.query(PostRecoveryTask).count() == 0:
                        db.add(PostRecoveryTask(patient_id=1, title="Take Amoxicillin 500mg", description="Take 1 tablet after food.", type=PostRecoveryTaskType.medicine, due_date=now - datetime.timedelta(hours=1), status="pending"))
                        db.add(PostRecoveryTask(patient_id=1, title="Take Ibuprofen 400mg", description="Take for pain if needed.", type=PostRecoveryTaskType.medicine, due_date=now + datetime.timedelta(hours=4), status="pending"))
                        db.add(PostRecoveryTask(patient_id=1, title="Post-Op Follow Up Visit", description="Review stitches with Dr. Patel.", type=PostRecoveryTaskType.follow_up, due_date=now + datetime.timedelta(days=7), status="pending"))
                        db.add(PostRecoveryTask(patient_id=1, title="Daily Breathing Exercises", description="15 minutes of deep breathing.", type=PostRecoveryTaskType.exercise, due_date=now, status="completed", completed_at=now - datetime.timedelta(hours=5)))
                        db.commit()
                        
                    # 7. Hackathon Seed Data
                    if db.query(ClinicalTrial).count() == 0:
                        db.add(ClinicalTrial(title="Phase-3 Lung Cancer Immunotherapy", disease="Lung Cancer", location="Hyderabad", phase="Phase 3", status="Recruiting", description="Testing a new immunotherapy drug for advanced non-small cell lung cancer.", eligibility_criteria="Must have stage IV NSCLC."))
                        db.add(ClinicalTrial(title="Diabetes Type 2 Management", disease="Type 2 Diabetes", location="Bangalore", phase="Phase 2", status="Recruiting", description="Evaluating a new wearable continuous glucose monitor.", eligibility_criteria="Adults 18+ with Type 2 Diabetes."))
                        db.add(ResearchPaper(title="Advancements in NSCLC Immunotherapy", authors="Dr. Sarah Jenkins", summary="A comprehensive review of the latest immune checkpoint inhibitors showing increased survival rates.", disease_tags="Lung Cancer, Oncology", published_date=now))
                        db.add(ResearchPaper(title="Wearable Sensors for Glycemic Control", authors="Dr. Richard Patel", summary="Wearable CGMs reduce HbA1c levels significantly over 6 months.", disease_tags="Diabetes", published_date=now - datetime.timedelta(days=10)))
                        db.add(SavedSearch(patient_id=1, query="Lung Cancer Trials", category="Clinical Trials"))
                        db.commit()
                    from backend.app.models.models import BloodInventory, IncomingAmbulance, ResuscitationBay, TraumaQueue, PediatricPatient, MaternityPatient, BloodRequest
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

                    db.commit()
                IS_SEEDED = True
            finally:
                db.close()

    @app.middleware("http")
    async def ensure_db_seeded_middleware(request, call_next):
        ensure_database_seeded()
        return await call_next(request)

    @app.get("/")
    def read_root():
        return {
            "status": "online",
            "service": "Neuralink Care Backend",
            "api_docs_url": "/docs"
        }

    @app.get("/api/v1/debug")
    def debug_info():
        import traceback
        try:
            db = SessionLocal()
            try:
                from backend.app.models.models import HospitalDepartment
                dept_count = db.query(HospitalDepartment).count()
                return {
                    "success": True,
                    "dept_count": dept_count,
                }
            except Exception as db_err:
                return {
                    "success": False,
                    "error": str(db_err),
                    "traceback": traceback.format_exc(),
                }
            finally:
                db.close()
        except Exception as e:
            return {
                "success": False,
                "error_outer": str(e),
                "traceback_outer": traceback.format_exc(),
            }

except Exception as _e:
    import traceback
    # Capture the string values before the exception is deleted from scope
    import_error_msg = str(_e)
    import_traceback = traceback.format_exc()

    # Safe fallback app to capture and return module-level import errors
    from fastapi import FastAPI
    app = FastAPI()

    @app.get("/")
    @app.get("/api/v1/debug")
    @app.get("/api/v1/appointments/departments")
    @app.get("/api/v1/appointments/")
    def fallback_debug():
        return {
            "success": False,
            "error_on_import": import_error_msg,
            "traceback": import_traceback
        }
