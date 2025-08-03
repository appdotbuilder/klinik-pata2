
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { 
  patientsTable, 
  usersTable, 
  medicinesTable, 
  prescriptionsTable, 
  prescriptionItemsTable,
  medicalRecordsTable
} from '../db/schema';
import { type CreatePrescriptionInput } from '../schema';
import { createPrescription } from '../handlers/create_prescription';
import { eq } from 'drizzle-orm';

describe('createPrescription', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a prescription with items', async () => {
    // Create prerequisite data
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P001',
        full_name: 'John Doe',
        date_of_birth: new Date('1990-01-01'),
        gender: 'male',
        phone: '1234567890',
        email: 'john@example.com',
        address: '123 Main St',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '0987654321',
        blood_type: 'O+',
        allergies: 'None',
        past_medical_history: 'No significant history'
      })
      .returning()
      .execute();

    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'doctor1',
        email: 'doctor@example.com',
        password_hash: 'hashedpassword',
        full_name: 'Dr. Smith',
        role: 'doctor',
        is_active: true
      })
      .returning()
      .execute();

    const medicineResult = await db.insert(medicinesTable)
      .values({
        name: 'Paracetamol',
        description: 'Pain reliever',
        dosage_form: 'Tablet',
        strength: '500mg',
        manufacturer: 'PharmaCorp',
        unit_price: '5.50',
        stock_quantity: 100,
        expiry_date: new Date('2025-12-31')
      })
      .returning()
      .execute();

    const medicalRecordResult = await db.insert(medicalRecordsTable)
      .values({
        patient_id: patientResult[0].id,
        doctor_id: doctorResult[0].id,
        diagnosis: 'Headache',
        symptoms: 'Head pain',
        treatment_plan: 'Rest and medication',
        notes: 'Follow up in 1 week'
      })
      .returning()
      .execute();

    const testInput: CreatePrescriptionInput = {
      patient_id: patientResult[0].id,
      doctor_id: doctorResult[0].id,
      medical_record_id: medicalRecordResult[0].id,
      instructions: 'Take with food',
      items: [
        {
          medicine_id: medicineResult[0].id,
          quantity: 10,
          dosage_instructions: 'Take 1 tablet twice daily'
        }
      ]
    };

    const result = await createPrescription(testInput);

    // Basic field validation
    expect(result.patient_id).toEqual(patientResult[0].id);
    expect(result.doctor_id).toEqual(doctorResult[0].id);
    expect(result.medical_record_id).toEqual(medicalRecordResult[0].id);
    expect(result.instructions).toEqual('Take with food');
    expect(result.id).toBeDefined();
    expect(result.prescription_date).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save prescription and items to database', async () => {
    // Create prerequisite data
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P002',
        full_name: 'Jane Smith',
        date_of_birth: new Date('1985-05-15'),
        gender: 'female',
        phone: '5555555555',
        email: 'jane@example.com',
        address: '456 Oak Ave',
        emergency_contact_name: 'John Smith',
        emergency_contact_phone: '4444444444',
        blood_type: 'A+',
        allergies: 'Penicillin',
        past_medical_history: 'Diabetes'
      })
      .returning()
      .execute();

    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'doctor2',
        email: 'doctor2@example.com',
        password_hash: 'hashedpassword2',
        full_name: 'Dr. Johnson',
        role: 'doctor',
        is_active: true
      })
      .returning()
      .execute();

    const medicineResult = await db.insert(medicinesTable)
      .values({
        name: 'Aspirin',
        description: 'Anti-inflammatory',
        dosage_form: 'Tablet',
        strength: '100mg',
        manufacturer: 'MedCorp',
        unit_price: '3.25',
        stock_quantity: 50,
        expiry_date: new Date('2024-06-30')
      })
      .returning()
      .execute();

    const testInput: CreatePrescriptionInput = {
      patient_id: patientResult[0].id,
      doctor_id: doctorResult[0].id,
      medical_record_id: null,
      instructions: 'Take after meals',
      items: [
        {
          medicine_id: medicineResult[0].id,
          quantity: 20,
          dosage_instructions: 'Take 1 tablet daily'
        }
      ]
    };

    const result = await createPrescription(testInput);

    // Verify prescription was saved
    const prescriptions = await db.select()
      .from(prescriptionsTable)
      .where(eq(prescriptionsTable.id, result.id))
      .execute();

    expect(prescriptions).toHaveLength(1);
    expect(prescriptions[0].patient_id).toEqual(patientResult[0].id);
    expect(prescriptions[0].doctor_id).toEqual(doctorResult[0].id);
    expect(prescriptions[0].medical_record_id).toBeNull();
    expect(prescriptions[0].instructions).toEqual('Take after meals');

    // Verify prescription items were saved
    const prescriptionItems = await db.select()
      .from(prescriptionItemsTable)
      .where(eq(prescriptionItemsTable.prescription_id, result.id))
      .execute();

    expect(prescriptionItems).toHaveLength(1);
    expect(prescriptionItems[0].medicine_id).toEqual(medicineResult[0].id);
    expect(prescriptionItems[0].quantity).toEqual(20);
    expect(prescriptionItems[0].dosage_instructions).toEqual('Take 1 tablet daily');
  });

  it('should throw error for non-existent patient', async () => {
    const testInput: CreatePrescriptionInput = {
      patient_id: 999,
      doctor_id: 1,
      medical_record_id: null,
      instructions: 'Test instructions',
      items: [
        {
          medicine_id: 1,
          quantity: 5,
          dosage_instructions: 'Test dosage'
        }
      ]
    };

    expect(createPrescription(testInput)).rejects.toThrow(/patient.*not found/i);
  });

  it('should throw error for non-existent doctor', async () => {
    // Create patient first
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P003',
        full_name: 'Test Patient',
        date_of_birth: new Date('1980-01-01'),
        gender: 'male',
        phone: '1111111111',
        email: 'test@example.com',
        address: '789 Test St',
        emergency_contact_name: 'Emergency Contact',
        emergency_contact_phone: '2222222222',
        blood_type: 'B+',
        allergies: 'None',
        past_medical_history: 'None'
      })
      .returning()
      .execute();

    const testInput: CreatePrescriptionInput = {
      patient_id: patientResult[0].id,
      doctor_id: 999,
      medical_record_id: null,
      instructions: 'Test instructions',
      items: [
        {
          medicine_id: 1,
          quantity: 5,
          dosage_instructions: 'Test dosage'
        }
      ]
    };

    expect(createPrescription(testInput)).rejects.toThrow(/doctor.*not found/i);
  });

  it('should throw error for non-existent medicine', async () => {
    // Create patient and doctor first
    const patientResult = await db.insert(patientsTable)
      .values({
        patient_code: 'P004',
        full_name: 'Test Patient 2',
        date_of_birth: new Date('1975-06-15'),
        gender: 'female',
        phone: '3333333333',
        email: 'test2@example.com',
        address: '101 Test Ave',
        emergency_contact_name: 'Emergency Contact 2',
        emergency_contact_phone: '4444444444',
        blood_type: 'AB+',
        allergies: 'Shellfish',
        past_medical_history: 'Hypertension'
      })
      .returning()
      .execute();

    const doctorResult = await db.insert(usersTable)
      .values({
        username: 'doctor3',
        email: 'doctor3@example.com',
        password_hash: 'hashedpassword3',
        full_name: 'Dr. Brown',
        role: 'doctor',
        is_active: true
      })
      .returning()
      .execute();

    const testInput: CreatePrescriptionInput = {
      patient_id: patientResult[0].id,
      doctor_id: doctorResult[0].id,
      medical_record_id: null,
      instructions: 'Test instructions',
      items: [
        {
          medicine_id: 999,
          quantity: 5,
          dosage_instructions: 'Test dosage'
        }
      ]
    };

    expect(createPrescription(testInput)).rejects.toThrow(/medicine.*not found/i);
  });
});
