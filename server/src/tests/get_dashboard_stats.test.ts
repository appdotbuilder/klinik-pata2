
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable, appointmentsTable, billsTable, usersTable } from '../db/schema';
import { getDashboardStats } from '../handlers/get_dashboard_stats';

describe('getDashboardStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty stats when no data exists', async () => {
    const result = await getDashboardStats();

    expect(result.total_patients).toEqual(0);
    expect(result.appointments_today).toEqual(0);
    expect(result.pending_bills).toEqual(0);
    expect(result.total_revenue).toEqual(0);
    expect(result.recent_appointments).toEqual([]);
  });

  it('should count patients correctly', async () => {
    // Create test patients
    await db.insert(patientsTable).values([
      {
        patient_code: 'P001',
        full_name: 'John Doe',
        date_of_birth: null,
        gender: null,
        phone: null,
        email: null,
        address: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        blood_type: null,
        allergies: null,
        past_medical_history: null,
      },
      {
        patient_code: 'P002',
        full_name: 'Jane Smith',
        date_of_birth: null,
        gender: null,
        phone: null,
        email: null,
        address: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        blood_type: null,
        allergies: null,
        past_medical_history: null,
      },
    ]).execute();

    const result = await getDashboardStats();

    expect(result.total_patients).toEqual(2);
  });

  it('should count appointments today correctly', async () => {
    // Create test user (doctor)
    const userResult = await db.insert(usersTable).values({
      username: 'doctor1',
      email: 'doctor1@test.com',
      password_hash: 'hashedpassword',
      full_name: 'Dr. Smith',
      role: 'doctor',
      is_active: true,
    }).returning().execute();

    // Create test patient
    const patientResult = await db.insert(patientsTable).values({
      patient_code: 'P001',
      full_name: 'John Doe',
      date_of_birth: null,
      gender: null,
      phone: null,
      email: null,
      address: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      blood_type: null,
      allergies: null,
      past_medical_history: null,
    }).returning().execute();

    // Create appointments for today and tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await db.insert(appointmentsTable).values([
      {
        patient_id: patientResult[0].id,
        doctor_id: userResult[0].id,
        appointment_date: today,
        duration_minutes: 30,
        status: 'scheduled',
        notes: null,
      },
      {
        patient_id: patientResult[0].id,
        doctor_id: userResult[0].id,
        appointment_date: tomorrow,
        duration_minutes: 30,
        status: 'scheduled',
        notes: null,
      },
    ]).execute();

    const result = await getDashboardStats();

    expect(result.appointments_today).toEqual(1);
  });

  it('should count pending bills and calculate revenue correctly', async () => {
    // Create test patient
    const patientResult = await db.insert(patientsTable).values({
      patient_code: 'P001',
      full_name: 'John Doe',
      date_of_birth: null,
      gender: null,
      phone: null,
      email: null,
      address: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      blood_type: null,
      allergies: null,
      past_medical_history: null,
    }).returning().execute();

    // Create bills with different payment statuses
    await db.insert(billsTable).values([
      {
        patient_id: patientResult[0].id,
        bill_number: 'B001',
        subtotal: '100.00',
        tax_amount: '10.00',
        total_amount: '110.00',
        payment_status: 'pending',
        notes: null,
      },
      {
        patient_id: patientResult[0].id,
        bill_number: 'B002',
        subtotal: '200.00',
        tax_amount: '20.00',
        total_amount: '220.00',
        payment_status: 'paid',
        notes: null,
      },
      {
        patient_id: patientResult[0].id,
        bill_number: 'B003',
        subtotal: '150.00',
        tax_amount: '15.00',
        total_amount: '165.00',
        payment_status: 'pending',
        notes: null,
      },
    ]).execute();

    const result = await getDashboardStats();

    expect(result.pending_bills).toEqual(2);
    expect(result.total_revenue).toEqual(220.00);
  });

  it('should return recent appointments with correct structure', async () => {
    // Create test user (doctor)
    const userResult = await db.insert(usersTable).values({
      username: 'doctor1',
      email: 'doctor1@test.com',
      password_hash: 'hashedpassword',
      full_name: 'Dr. Smith',
      role: 'doctor',
      is_active: true,
    }).returning().execute();

    // Create test patient
    const patientResult = await db.insert(patientsTable).values({
      patient_code: 'P001',
      full_name: 'John Doe',
      date_of_birth: null,
      gender: null,
      phone: null,
      email: null,
      address: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      blood_type: null,
      allergies: null,
      past_medical_history: null,
    }).returning().execute();

    // Create appointment
    await db.insert(appointmentsTable).values({
      patient_id: patientResult[0].id,
      doctor_id: userResult[0].id,
      appointment_date: new Date(),
      duration_minutes: 30,
      status: 'scheduled',
      notes: null,
    }).execute();

    const result = await getDashboardStats();

    expect(result.recent_appointments).toHaveLength(1);
    expect(result.recent_appointments[0]).toMatchObject({
      id: expect.any(Number),
      patient_name: 'John Doe',
      doctor_name: 'Dr. Smith',
      appointment_date: expect.any(Date),
      status: 'scheduled',
    });
  });
});
