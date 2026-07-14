import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base, SessionLocal
from backend.app.routers import appointments, queue
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

@app.on_event("startup")
def seed_database():
    db = SessionLocal()
    try:
        # 1. Seed Departments if empty
        # 1. Seed Departments if missing
        depts_to_seed = [
            ("General Medicine", "Floor 1, Block A", 20),
            ("Ophthalmology", "Floor 2, Block B", 30),
            ("Pediatrics", "Floor 1, Block C", 25),
            ("Orthopedics", "Floor 3, Block A", 40),
            ("Cardiology", "Floor 4, Block D", 35),
            ("Dermatology", "Floor 2, Block C", 20)
        ]
        for name, floor, treatment_time in depts_to_seed:
            exists = db.query(HospitalDepartment).filter(HospitalDepartment.name == name).first()
            if not exists:
                db.add(HospitalDepartment(name=name, building_floor=floor, avg_treatment_time_minutes=treatment_time))
        db.commit()
        print("Ensured all Departments are seeded.")

        # 2. Seed Doctors if missing
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
            exists = db.query(Doctor).filter(Doctor.email == email).first()
            if not exists:
                db.add(Doctor(
                    first_name=f_name, 
                    last_name=l_name, 
                    email=email, 
                    specialty=specialty, 
                    department_id=dept_map[specialty]
                ))
        db.commit()
        print("Ensured all Doctors are seeded.")

        # 3. Seed Patients if empty
        if db.query(Patient).count() == 0:
            patients = [
                Patient(first_name="John", last_name="Doe", email="john.doe@gmail.com", phone_number="+15550199", date_of_birth=datetime.date(1990, 5, 12), gender="Male", medical_record_number="MRN-848202"),
                Patient(first_name="Jane", last_name="Smith", email="jane.smith@gmail.com", phone_number="+15550299", date_of_birth=datetime.date(1995, 9, 23), gender="Female", medical_record_number="MRN-193848"),
                Patient(first_name="Tom", last_name="Johnson", email="tom.j@gmail.com", phone_number="+15550399", date_of_birth=datetime.date(1982, 12, 1), gender="Male", medical_record_number="MRN-729482"),
                Patient(first_name="Alice", last_name="Williams", email="alice.w@gmail.com", phone_number="+15550499", date_of_birth=datetime.date(1975, 4, 15), gender="Female", medical_record_number="MRN-382910"),
                Patient(first_name="Bob", last_name="Miller", email="bob.m@gmail.com", phone_number="+15550599", date_of_birth=datetime.date(2010, 8, 30), gender="Male", medical_record_number="MRN-482019"),
                Patient(first_name="Charlie", last_name="Davis", email="charlie.d@gmail.com", phone_number="+15550699", date_of_birth=datetime.date(1950, 2, 20), gender="Male", medical_record_number="MRN-582930"),
                Patient(first_name="Diana", last_name="Garcia", email="diana.g@gmail.com", phone_number="+15550799", date_of_birth=datetime.date(1988, 11, 5), gender="Female", medical_record_number="MRN-682039")
            ]
            db.add_all(patients)
            db.commit()
            print("Successfully seeded Patients.")
        
        # 4. Seed Appointments and Queue (if empty)
        if db.query(Appointment).count() == 0:
            now = datetime.datetime.utcnow()
            patients_db = db.query(Patient).all()
            doctors_db = db.query(Doctor).all()
            dept_db = db.query(HospitalDepartment).all()
            
            # Helper to get random doctor/patient
            import random
            
            appointments_to_seed = []
            queue_to_seed = []
            
            # Past Appointments (Completed)
            for i in range(10):
                p = random.choice(patients_db)
                d = random.choice(doctors_db)
                past_date = now - datetime.timedelta(days=random.randint(1, 30), hours=random.randint(1, 8))
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
                # Past appointments don't need active queue status, but can have completed queue status
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
            for i in range(5):
                p = random.choice(patients_db)
                d = random.choice(doctors_db)
                start = now - datetime.timedelta(minutes=random.randint(5, 60))
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
            for i in range(8):
                p = random.choice(patients_db)
                d = random.choice(doctors_db)
                future = now + datetime.timedelta(days=random.randint(1, 14), hours=random.randint(1, 5))
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
                
            db.commit()
            print("Successfully seeded Appointments and Queue Statuses.")
            
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Neuralink Care Backend",
        "api_docs_url": "/docs"
    }
