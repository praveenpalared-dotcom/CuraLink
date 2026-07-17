import datetime
import random
from sqlalchemy.orm import Session
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.models import (
    HospitalDepartment, Doctor, Patient, Appointment, AppointmentStatus,
    Staff, StaffRole, Schedule, QueueStatus, Notification, NotificationType, AnalyticsLog
)

def seed_all():
    # Recreate tables to start clean
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding hospital departments...")
        departments = [
            HospitalDepartment(name="General Medicine", building_floor="Floor 1, Block A", avg_treatment_time_minutes=20),
            HospitalDepartment(name="Ophthalmology", building_floor="Floor 2, Block B", avg_treatment_time_minutes=30),
            HospitalDepartment(name="Pediatrics", building_floor="Floor 1, Block C", avg_treatment_time_minutes=25),
            HospitalDepartment(name="Orthopedics", building_floor="Floor 3, Block A", avg_treatment_time_minutes=40),
            HospitalDepartment(name="Cardiology", building_floor="Floor 4, Block D", avg_treatment_time_minutes=35),
            HospitalDepartment(name="Dermatology", building_floor="Floor 2, Block C", avg_treatment_time_minutes=20)
        ]
        db.add_all(departments)
        db.commit()
        
        # Get departments mapped by name
        dept_map = {d.name: d.id for d in db.query(HospitalDepartment).all()}
        
        print("Seeding doctors...")
        doctors_data = [
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
        
        doctors = []
        for f_name, l_name, email, specialty in doctors_data:
            doc = Doctor(
                first_name=f_name, 
                last_name=l_name, 
                email=email, 
                specialty=specialty, 
                department_id=dept_map[specialty]
            )
            doctors.append(doc)
            db.add(doc)
        db.commit()
        
        print("Seeding patients...")
        patients_data = [
            ("John", "Doe", "john.doe@gmail.com", "+15550199", datetime.date(1990, 5, 12), "Male", "MRN-848202"),
            ("Jane", "Smith", "jane.smith@gmail.com", "+15550299", datetime.date(1995, 9, 23), "Female", "MRN-193848"),
            ("Tom", "Johnson", "tom.j@gmail.com", "+15550399", datetime.date(1982, 12, 1), "Male", "MRN-729482"),
            ("Alice", "Williams", "alice.w@gmail.com", "+15550499", datetime.date(1975, 4, 15), "Female", "MRN-382910"),
            ("Bob", "Miller", "bob.m@gmail.com", "+15550599", datetime.date(2010, 8, 30), "Male", "MRN-482019"),
            ("Charlie", "Davis", "charlie.d@gmail.com", "+15550699", datetime.date(1950, 2, 20), "Male", "MRN-582930"),
            ("Diana", "Garcia", "diana.g@gmail.com", "+15550799", datetime.date(1988, 11, 5), "Female", "MRN-682039"),
            ("Evan", "Martinez", "evan.m@gmail.com", "+15550899", datetime.date(2001, 7, 19), "Male", "MRN-928103"),
            ("Fiona", "Clark", "fiona.c@gmail.com", "+15550999", datetime.date(1993, 3, 27), "Female", "MRN-301928"),
            ("George", "Rodriguez", "george.r@gmail.com", "+15551099", datetime.date(1968, 10, 14), "Male", "MRN-491029"),
            ("Hannah", "Lewis", "hannah.l@gmail.com", "+15551199", datetime.date(1985, 1, 8), "Female", "MRN-847291"),
            ("Ian", "Walker", "ian.w@gmail.com", "+15551299", datetime.date(1979, 6, 22), "Male", "MRN-102938"),
            ("Julia", "Hall", "julia.h@gmail.com", "+15551399", datetime.date(1997, 11, 15), "Female", "MRN-293847"),
            ("Kevin", "Allen", "kevin.a@gmail.com", "+15551499", datetime.date(1991, 4, 3), "Male", "MRN-472839")
        ]
        
        patients = []
        for f_name, l_name, email, phone, dob, gender, mrn in patients_data:
            pat = Patient(
                first_name=f_name,
                last_name=l_name,
                email=email,
                phone_number=phone,
                date_of_birth=dob,
                gender=gender,
                medical_record_number=mrn
            )
            patients.append(pat)
            db.add(pat)
        db.commit()

        print("Seeding staff...")
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
        
        staff_members = []
        for f_name, l_name, email, role, dept_name in staff_data:
            st = Staff(
                first_name=f_name,
                last_name=l_name,
                email=email,
                role=role,
                department_id=dept_map[dept_name],
                max_weekly_hours=40,
                is_active=True
            )
            staff_members.append(st)
            db.add(st)
        db.commit()

        # Seed staff for the doctors themselves in the staff table (since doctors are also staff and can have schedules)
        for doc in doctors:
            st = Staff(
                first_name=doc.first_name,
                last_name=doc.last_name,
                email=doc.email,
                role=StaffRole.doctor,
                department_id=doc.department_id,
                max_weekly_hours=40,
                is_active=True
            )
            staff_members.append(st)
            db.add(st)
        db.commit()

        print("Seeding schedules (shifts)...")
        now = datetime.datetime.utcnow()
        # Create schedules for yesterday, today, and tomorrow for all staff
        for st in staff_members:
            for day_offset in [-1, 0, 1]:
                day = now.date() + datetime.timedelta(days=day_offset)
                shift_start = datetime.datetime.combine(day, datetime.time(8, 0))
                shift_end = datetime.datetime.combine(day, datetime.time(16, 0))
                sched = Schedule(
                    staff_id=st.id,
                    shift_start=shift_start,
                    shift_end=shift_end,
                    is_on_call=(random.random() > 0.7)
                )
                db.add(sched)
        db.commit()

        print("Seeding appointments and queue status...")
        patients_db = db.query(Patient).all()
        doctors_db = db.query(Doctor).all()
        
        # 1. Past Appointments (Completed)
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
                chief_complaint=random.choice([
                    "Follow-up visit for hypertension", 
                    "Annual physical checkup", 
                    "Mild headache and dizziness", 
                    "Chronic back pain consultation", 
                    "Persistent cough and sore throat",
                    "Eye strain and blurry vision",
                    "Skin rash and itching"
                ]),
                ai_no_show_probability=round(random.uniform(0.01, 0.15), 2)
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

        # 2. Today's Active Appointments (Checked In & In Consultation)
        active_statuses = [AppointmentStatus.checked_in, AppointmentStatus.in_consultation]
        for i in range(8):
            p = random.choice(patients_db)
            d = random.choice(doctors_db)
            start = now - datetime.timedelta(minutes=random.randint(5, 45))
            status = random.choice(active_statuses)
            appt = Appointment(
                patient_id=p.id,
                doctor_id=d.id,
                department_id=d.department_id,
                start_time=start,
                end_time=start + datetime.timedelta(minutes=30),
                status=status,
                chief_complaint=random.choice([
                    "Acute chest pain", 
                    "High fever and chills", 
                    "Sudden blurry vision", 
                    "Severe joint pain", 
                    "Allergic skin reaction",
                    "Ear infection discomfort"
                ]),
                ai_no_show_probability=round(random.uniform(0.02, 0.35), 2)
            )
            db.add(appt)
            db.commit()
            db.refresh(appt)
            
            q_item = QueueStatus(
                appointment_id=appt.id,
                department_id=appt.department_id,
                check_in_time=start - datetime.timedelta(minutes=random.randint(10, 25)),
                called_to_room_time=start if status == AppointmentStatus.in_consultation else None,
                current_position=i + 1,
                estimated_wait_minutes=15 if status == AppointmentStatus.checked_in else 0
            )
            db.add(q_item)

        # 3. Future Scheduled Appointments
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
                chief_complaint=random.choice([
                    "Routine wellness checkup", 
                    "Blood pressure medication refill", 
                    "General health consultation", 
                    "Seasonal flu vaccination",
                    "Follow-up lab result review"
                ]),
                ai_no_show_probability=round(random.uniform(0.05, 0.85), 2)
            )
            db.add(appt)
        db.commit()

        print("Seeding analytics logs...")
        for i in range(20):
            log = AnalyticsLog(
                event_type=random.choice(["appointment_creation", "patient_intake", "check_in", "consultation_end"]),
                metric_name=random.choice(["waiting_time_minutes", "processing_time_minutes", "no_show_risk"]),
                metric_value=round(random.uniform(5.0, 45.0), 2),
                timestamp=now - datetime.timedelta(days=random.randint(0, 5), hours=random.randint(0, 12)),
                meta_json='{"browser": "Chrome", "os": "macOS", "region": "US"}'
            )
            db.add(log)
        db.commit()

        print("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print("An error occurred during seeding:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
