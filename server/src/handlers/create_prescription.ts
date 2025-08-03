
import { db } from '../db';
import { prescriptionsTable, prescriptionItemsTable, patientsTable, usersTable, medicinesTable } from '../db/schema';
import { type CreatePrescriptionInput, type Prescription } from '../schema';
import { eq } from 'drizzle-orm';

export const createPrescription = async (input: CreatePrescriptionInput): Promise<Prescription> => {
  try {
    // Verify patient exists
    const patients = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, input.patient_id))
      .execute();

    if (patients.length === 0) {
      throw new Error(`Patient with id ${input.patient_id} not found`);
    }

    // Verify doctor exists
    const doctors = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.doctor_id))
      .execute();

    if (doctors.length === 0) {
      throw new Error(`Doctor with id ${input.doctor_id} not found`);
    }

    // Verify all medicines exist
    for (const item of input.items) {
      const medicines = await db.select()
        .from(medicinesTable)
        .where(eq(medicinesTable.id, item.medicine_id))
        .execute();
      
      if (medicines.length === 0) {
        throw new Error(`Medicine with id ${item.medicine_id} not found`);
      }
    }

    // Insert prescription record
    const result = await db.insert(prescriptionsTable)
      .values({
        patient_id: input.patient_id,
        doctor_id: input.doctor_id,
        medical_record_id: input.medical_record_id,
        instructions: input.instructions
      })
      .returning()
      .execute();

    const prescription = result[0];

    // Insert prescription items
    await db.insert(prescriptionItemsTable)
      .values(input.items.map(item => ({
        prescription_id: prescription.id,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        dosage_instructions: item.dosage_instructions
      })))
      .execute();

    return prescription;
  } catch (error) {
    console.error('Prescription creation failed:', error);
    throw error;
  }
};
