import React from 'react';
import { renderToString } from 'react-dom/server';
import PatientDashboard from './frontend/src/pages/PatientDashboard.jsx';

const user = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@gmail.com',
  phone_number: '+1 555-0199',
  date_of_birth: '1990-05-12',
  gender: 'Male',
  medical_record_number: 'MRN-848202'
};

try {
  // We can't easily mock everything in Node without a proper test environment,
  // but let's see if we can identify any obvious missing properties.
  console.log("Checking for missing properties...");
} catch (e) {
  console.error(e);
}
