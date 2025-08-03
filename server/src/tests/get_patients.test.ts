
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type CreatePatientInput } from '../schema';
import { getPatients } from '../handlers/get_patients';

const testPatient1: CreatePatientInput = {
  patient_code: 'PAT001',
  full_name: 'John Doe',
  date_of_birth: new Date('1990-01-01'),
  gender: 'male',
  phone: '+1234567890',
  email: 'john.doe@example.com',
  address: '123 Main St',
  emergency_contact_name: 'Jane Doe',
  emergency_contact_phone: '+1234567891',
  blood_type: 'A+',
  allergies: 'Peanuts, Shellfish',
  past_medical_history: 'Hypertension diagnosed in 2020',
};

const testPatient2: CreatePatientInput = {
  patient_code: 'PAT002',
  full_name: 'Alice Smith',
  date_of_birth: null,
  gender: 'female',
  phone: null,
  email: null,
  address: null,
  emergency_contact_name: null,
  emergency_contact_phone: null,
  blood_type: null,
  allergies: null,
  past_medical_history: null,
};

describe('getPatients', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no patients exist', async () => {
    const result = await getPatients();
    expect(result).toEqual([]);
  });

  it('should return all patients', async () => {
    // Create test patients
    await db.insert(patientsTable)
      .values([testPatient1, testPatient2])
      .execute();

    const result = await getPatients();

    expect(result).toHaveLength(2);
    
    // Check first patient with all fields populated
    const patient1 = result.find(p => p.patient_code === 'PAT001');
    expect(patient1).toBeDefined();
    expect(patient1!.full_name).toEqual('John Doe');
    expect(patient1!.date_of_birth).toBeInstanceOf(Date);
    expect(patient1!.gender).toEqual('male');
    expect(patient1!.phone).toEqual('+1234567890');
    expect(patient1!.email).toEqual('john.doe@example.com');
    expect(patient1!.address).toEqual('123 Main St');
    expect(patient1!.emergency_contact_name).toEqual('Jane Doe');
    expect(patient1!.emergency_contact_phone).toEqual('+1234567891');
    expect(patient1!.blood_type).toEqual('A+');
    expect(patient1!.allergies).toEqual('Peanuts, Shellfish');
    expect(patient1!.past_medical_history).toEqual('Hypertension diagnosed in 2020');
    expect(patient1!.id).toBeDefined();
    expect(patient1!.created_at).toBeInstanceOf(Date);
    expect(patient1!.updated_at).toBeInstanceOf(Date);

    // Check second patient with null fields
    const patient2 = result.find(p => p.patient_code === 'PAT002');
    expect(patient2).toBeDefined();
    expect(patient2!.full_name).toEqual('Alice Smith');
    expect(patient2!.date_of_birth).toBeNull();
    expect(patient2!.gender).toEqual('female');
    expect(patient2!.phone).toBeNull();
    expect(patient2!.email).toBeNull();
    expect(patient2!.address).toBeNull();
    expect(patient2!.emergency_contact_name).toBeNull();
    expect(patient2!.emergency_contact_phone).toBeNull();
    expect(patient2!.blood_type).toBeNull();
    expect(patient2!.allergies).toBeNull();
    expect(patient2!.past_medical_history).toBeNull();
    expect(patient2!.id).toBeDefined();
    expect(patient2!.created_at).toBeInstanceOf(Date);
    expect(patient2!.updated_at).toBeInstanceOf(Date);
  });

  it('should return patients ordered by creation date', async () => {
    // Create first patient
    await db.insert(patientsTable)
      .values(testPatient1)
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second patient
    await db.insert(patientsTable)
      .values(testPatient2)
      .execute();

    const result = await getPatients();

    expect(result).toHaveLength(2);
    // Verify that created_at timestamps are different
    expect(result[0].created_at.getTime()).toBeLessThan(result[1].created_at.getTime());
  });
});
