try:
    import datetime
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from backend.app.database import engine, Base, SessionLocal
    from backend.app.routers import appointments, queue, notifications, post_recovery
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
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # Allow all for hackathon environment ease
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    app.include_router(appointments.router, prefix="/api/v1")
    app.include_router(queue.router, prefix="/api/v1")
    app.include_router(notifications.router, prefix="/api/v1")
    app.include_router(post_recovery.router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/api/v1")

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
                        Patient(first_name="John", last_name="Doe", email="john.doe@gmail.com", phone_number="+15550199", date_of_birth=datetime.date(1990, 5, 12), gender="Male", medical_record_number="MRN-848202", password_hash=DEMO_PASSWORD_HASH),
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

                # 4. Seed Staff if empty
                if db.query(Staff).count() == 0:
                    dept_map = {d.name: d.id for d in db.query(HospitalDepartment).all()}
                    staff_data = [
                        ("Emily", "Nightingale", "emily.n@mediflow.com", StaffRole.nurse, "General Medicine"),
                        ("Michael", "Scott", "michael.s@mediflow.com", StaffRole.receptionist, "General Medicine"),
                        ("Pam", "Beesly", "pam.b@mediflow.com", StaffRole.receptionist, "General Medicine"),
                        ("Jim", "Halpert", "jim.h@mediflow.com", StaffRole.receptionist, "Ophthalmology"),
                        ("Dwight", "Schrute", "dwight.s@mediflow.com", StaffRole.nurse, "Orthopedics"),
                        ("Angela", "Martin", "angela.m@mediflow.com", StaffRole.admin, "General Medicine"),
                        ("Oscar", "Martinez", "oscar.m@mediflow.com", StaffRole.admin, "Cardiology"),
                        ("Kevin", "Malone", "kevin.m@mediflow.com", StaffRole.nurse, "Pediatrics"),
                        ("Toby", "Flenderson", "toby.f@mediflow.com", StaffRole.nurse, "Dermatology")
                    ]
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
                    db.commit()

                # 5. Seed Schedules if empty
                if db.query(Schedule).count() == 0:
                    staff_members = db.query(Staff).all()
                    now = datetime.datetime.utcnow()
                    for st in staff_members:
                        for day_offset in [-1, 0, 1]:
                            day = now.date() + datetime.timedelta(days=day_offset)
                            shift_start = datetime.datetime.combine(day, datetime.time(8, 0))
                            shift_end = datetime.datetime.combine(day, datetime.time(16, 0))
                            db.add(Schedule(
                                staff_id=st.id,
                                shift_start=shift_start,
                                shift_end=shift_end,
                                is_on_call=(random.random() > 0.7)
                            ))
                    db.commit()

                # 6. Seed Appointments and Queue (if empty)
                if db.query(Appointment).count() == 0:
                    now = datetime.datetime.utcnow()
                    patients_db = db.query(Patient).all()
                    doctors_db = db.query(Doctor).all()
                    
                    # Past Appointments (Completed)
                    for i in range(15):
                        p = random.choice(patients_db)
                        d = random.choice(doctors_db)
                        past_date = now - datetime.timedelta(days=random.randint(1, 10), hours=random.randint(1, 8))
                        appt = Appointment(
                            patient_id=p.id,
                            doctor_id=d.id,
                            department_id=d.department_id,
                            start_time=past_date,
                            end_time=past_date + datetime.timedelta(minutes=30),
                            status=AppointmentStatus.completed,
                            chief_complaint=random.choice(["Follow-up visit", "Annual physical", "Mild headache", "Back pain", "Cough and cold"])
                        )
                        db.add(appt)
                        db.commit()
                        db.refresh(appt)
                        
                        q_item = QueueStatus(
                            appointment_id=appt.id,
                            department_id=appt.department_id,
                            check_in_time=past_date - datetime.timedelta(minutes=15),
                            called_to_room_time=past_date,
                            completed_time=past_date + datetime.timedelta(minutes=30),
                            current_position=0
                        )
                        db.add(q_item)

                    # Today's Active Appointments (Checked In & In Consultation)
                    for i in range(8):
                        p = random.choice(patients_db)
                        d = random.choice(doctors_db)
                        start = now - datetime.timedelta(minutes=random.randint(5, 45))
                        status = random.choice([AppointmentStatus.checked_in, AppointmentStatus.in_consultation])
                        appt = Appointment(
                            patient_id=p.id,
                            doctor_id=d.id,
                            department_id=d.department_id,
                            start_time=start,
                            end_time=start + datetime.timedelta(minutes=30),
                            status=status,
                            chief_complaint=random.choice(["Chest pain", "High fever", "Blurry vision", "Joint pain", "Skin rash"])
                        )
                        db.add(appt)
                        db.commit()
                        db.refresh(appt)
                        
                        q_item = QueueStatus(
                            appointment_id=appt.id,
                            department_id=appt.department_id,
                            check_in_time=start - datetime.timedelta(minutes=20),
                            called_to_room_time=start if status == AppointmentStatus.in_consultation else None,
                            current_position=i + 1,
                            estimated_wait_minutes=15 if status == AppointmentStatus.checked_in else 0
                        )
                        db.add(q_item)
                        
                    # Future Scheduled Appointments
                    for i in range(12):
                        p = random.choice(patients_db)
                        d = random.choice(doctors_db)
                        future = now + datetime.timedelta(days=random.randint(1, 10), hours=random.randint(1, 5))
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
                        
                    from backend.app.models.models import Notification, NotificationType, PostRecoveryTask, PostRecoveryTaskType
                    if db.query(Notification).count() == 0:
                        db.add(Notification(patient_id=1, type=NotificationType.app, message_body="Your appointment with Dr. Richard Patel has been confirmed for tomorrow at 10:00 AM.", status="sent", sent_at=now))
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
                db_url = str(db.bind.url)
                return {
                    "success": True,
                    "db_url": db_url,
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
