
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type CreatePatientInput } from '../schema';
import { createPatient } from '../handlers/create_patient';
import { eq } from 'drizzle-orm';

// Complete test input with all fields
const testInput: CreatePatientInput = {
  patient_code: 'P001',
  full_name: 'John Doe',
  date_of_birth: new Date('1990-01-15'),
  gender: 'male',
  phone: '+1234567890',
  email: 'john.doe@example.com',
  address: '123 Main St',
  emergency_contact_name: 'Jane Doe',
  emergency_contact_phone: '+0987654321',
  blood_type: 'A+',
  allergies: 'Penicillin',
  past_medical_history: 'Hypertension'
};

describe('createPatient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a patient with all fields', async () => {
    const result = await createPatient(testInput);

    // Basic field validation
    expect(result.patient_code).toEqual('P001');
    expect(result.full_name).toEqual('John Doe');
    expect(result.date_of_birth).toEqual(new Date('1990-01-15'));
    expect(result.gender).toEqual('male');
    expect(result.phone).toEqual('+1234567890');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.address).toEqual('123 Main St');
    expect(result.emergency_contact_name).toEqual('Jane Doe');
    expect(result.emergency_contact_phone).toEqual('+0987654321');
    expect(result.blood_type).toEqual('A+');
    expect(result.allergies).toEqual('Penicillin');
    expect(result.past_medical_history).toEqual('Hypertension');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save patient to database', async () => {
    const result = await createPatient(testInput);

    // Query using proper drizzle syntax
    const patients = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, result.id))
      .execute();

    expect(patients).toHaveLength(1);
    expect(patients[0].patient_code).toEqual('P001');
    expect(patients[0].full_name).toEqual('John Doe');
    expect(patients[0].date_of_birth).toEqual(new Date('1990-01-15'));
    expect(patients[0].gender).toEqual('male');
    expect(patients[0].phone).toEqual('+1234567890');
    expect(patients[0].email).toEqual('john.doe@example.com');
    expect(patients[0].address).toEqual('123 Main St');
    expect(patients[0].emergency_contact_name).toEqual('Jane Doe');
    expect(patients[0].emergency_contact_phone).toEqual('+0987654321');
    expect(patients[0].blood_type).toEqual('A+');
    expect(patients[0].allergies).toEqual('Penicillin');
    expect(patients[0].past_medical_history).toEqual('Hypertension');
    expect(patients[0].created_at).toBeInstanceOf(Date);
    expect(patients[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create patient with nullable fields as null', async () => {
    const minimalInput: CreatePatientInput = {
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
      past_medical_history: null
    };

    const result = await createPatient(minimalInput);

    expect(result.patient_code).toEqual('P002');
    expect(result.full_name).toEqual('Jane Smith');
    expect(result.date_of_birth).toBeNull();
    expect(result.gender).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.email).toBeNull();
    expect(result.address).toBeNull();
    expect(result.emergency_contact_name).toBeNull();
    expect(result.emergency_contact_phone).toBeNull();
    expect(result.blood_type).toBeNull();
    expect(result.allergies).toBeNull();
    expect(result.past_medical_history).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should enforce unique patient_code constraint', async () => {
    // Create first patient
    await createPatient(testInput);

    // Try to create another patient with same patient_code
    const duplicateInput: CreatePatientInput = {
      ...testInput,
      full_name: 'Different Name'
    };

    await expect(createPatient(duplicateInput)).rejects.toThrow(/unique/i);
  });
});
