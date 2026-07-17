const p = { name: 'John Doe', email: 'john.doe@gmail.com', mrn: 'MRN-848202', phone: '+1 555-0199', dob: '1990-05-12' };
const user = {
  id: p.email === 'john.doe@gmail.com' ? 1 : p.email === 'jane.smith@gmail.com' ? 2 : 3,
  first_name: p.name.split(' ')[0],
  last_name: p.name.split(' ')[1] || '',
  email: p.email,
  phone_number: p.phone || '+1 555-0199',
  date_of_birth: p.dob || '1990-05-12',
  gender: p.name === 'Jane Smith' ? 'Female' : 'Male',
  medical_record_number: p.mrn
};
console.log("User object created successfully:", user);
