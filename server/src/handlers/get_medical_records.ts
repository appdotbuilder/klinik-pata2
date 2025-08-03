
import { db } from '../db';
import { medicalRecordsTable, patientsTable, usersTable } from '../db/schema';
import { type MedicalRecord } from '../schema';

export async function getMedicalRecords(): Promise<MedicalRecord[]> {
  try {
    const results = await db.select()
      .from(medicalRecordsTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch medical records:', error);
    throw error;
  }
}
