
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type CreatePatientInput, type UpdatePatientInput } from '../schema';
import { updatePatient } from '../handlers/update_patient';
import { eq } from 'drizzle-orm';

// Helper function to create a test patient
const createTestPatient = async (): Promise<number> => {
  const testPatientInput: CreatePatientInput = {
    patient_code: 'P001',
    full_name: 'John Doe',
    date_of_birth: new Date('1990-01-01'),
    gender: 'male',
    phone: '123-456-7890',
    email: 'john.doe@example.com',
    address: '123 Main St',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '098-765-4321',
    blood_type: 'O+',
    allergies: 'Peanuts',
    past_medical_history: 'None'
  };

  const result = await db.insert(patientsTable)
    .values(testPatientInput)
    .returning()
    .execute();

  return result[0].id;
};

describe('updatePatient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update patient basic information', async () => {
    const patientId = await createTestPatient();

    const updateInput: UpdatePatientInput = {
      patient_id: patientId,
      full_name: 'John Smith',
      phone: '555-123-4567',
      email: 'john.smith@example.com'
    };

    const result = await updatePatient(updateInput);

    expect(result.id).toEqual(patientId);
    expect(result.full_name).toEqual('John Smith');
    expect(result.phone).toEqual('555-123-4567');
    expect(result.email).toEqual('john.smith@example.com');
    expect(result.patient_code).toEqual('P001'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update patient medical information', async () => {
    const patientId = await createTestPatient();

    const updateInput: UpdatePatientInput = {
      patient_id: patientId,
      blood_type: 'A+',
      allergies: 'Shellfish, Dust',
      past_medical_history: 'Diabetes, Hypertension'
    };

    const result = await updatePatient(updateInput);

    expect(result.id).toEqual(patientId);
    expect(result.blood_type).toEqual('A+');
    expect(result.allergies).toEqual('Shellfish, Dust');
    expect(result.past_medical_history).toEqual('Diabetes, Hypertension');
    expect(result.full_name).toEqual('John Doe'); // Should remain unchanged
  });

  it('should update nullable fields to null', async () => {
    const patientId = await createTestPatient();

    const updateInput: UpdatePatientInput = {
      patient_id: patientId,
      phone: null,
      email: null,
      blood_type: null,
      allergies: null
    };

    const result = await updatePatient(updateInput);

    expect(result.id).toEqual(patientId);
    expect(result.phone).toBeNull();
    expect(result.email).toBeNull();
    expect(result.blood_type).toBeNull();
    expect(result.allergies).toBeNull();
    expect(result.full_name).toEqual('John Doe'); // Should remain unchanged
  });

  it('should save updated patient to database', async () => {
    const patientId = await createTestPatient();

    const updateInput: UpdatePatientInput = {
      patient_id: patientId,
      full_name: 'Updated Name',
      gender: 'female',
      blood_type: 'B-'
    };

    await updatePatient(updateInput);

    // Verify changes were persisted
    const patients = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, patientId))
      .execute();

    expect(patients).toHaveLength(1);
    expect(patients[0].full_name).toEqual('Updated Name');
    expect(patients[0].gender).toEqual('female');
    expect(patients[0].blood_type).toEqual('B-');
    expect(patients[0].patient_code).toEqual('P001'); // Should remain unchanged
    expect(patients[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    const patientId = await createTestPatient();

    // Update only one field
    const updateInput: UpdatePatientInput = {
      patient_id: patientId,
      address: '456 Oak Avenue'
    };

    const result = await updatePatient(updateInput);

    expect(result.id).toEqual(patientId);
    expect(result.address).toEqual('456 Oak Avenue');
    // All other fields should remain unchanged
    expect(result.full_name).toEqual('John Doe');
    expect(result.phone).toEqual('123-456-7890');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.blood_type).toEqual('O+');
    expect(result.allergies).toEqual('Peanuts');
  });

  it('should throw error for non-existent patient', async () => {
    const updateInput: UpdatePatientInput = {
      patient_id: 99999,
      full_name: 'Non-existent Patient'
    };

    expect(updatePatient(updateInput)).rejects.toThrow(/Patient with id 99999 not found/);
  });

  it('should update emergency contact information', async () => {
    const patientId = await createTestPatient();

    const updateInput: UpdatePatientInput = {
      patient_id: patientId,
      emergency_contact_name: 'Mary Smith',
      emergency_contact_phone: '777-888-9999'
    };

    const result = await updatePatient(updateInput);

    expect(result.emergency_contact_name).toEqual('Mary Smith');
    expect(result.emergency_contact_phone).toEqual('777-888-9999');
    expect(result.full_name).toEqual('John Doe'); // Should remain unchanged
  });
});
