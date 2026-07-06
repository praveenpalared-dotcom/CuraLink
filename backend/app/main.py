import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base, SessionLocal
from backend.app.routers import appointments, queue
from backend.app.models.models import HospitalDepartment, Doctor, Patient

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
                Patient(first_name="Tom", last_name="Johnson", email="tom.j@gmail.com", phone_number="+15550399", date_of_birth=datetime.date(1982, 12, 1), gender="Male", medical_record_number="MRN-729482")
            ]
            db.bulk_save_objects(patients)
            db.commit()
            print("Successfully seeded Patients.")
            
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Neuralink Care Backend",
        "api_docs_url": "/docs"
    }
