
import { db } from '../db';
import { patientsTable, appointmentsTable, billsTable } from '../db/schema';
import { type DashboardStats } from '../schema';
import { eq, gte, lt, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count total patients
    const totalPatientsResult = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(patientsTable).execute();
    const total_patients = Number(totalPatientsResult[0].count);

    // Count appointments today
    const appointmentsTodayResult = await db.select({ 
      count: sql<number>`count(*)` 
    })
    .from(appointmentsTable)
    .where(
      and(
        gte(appointmentsTable.appointment_date, today),
        lt(appointmentsTable.appointment_date, tomorrow)
      )
    )
    .execute();
    const appointments_today = Number(appointmentsTodayResult[0].count);

    // Count pending bills
    const pendingBillsResult = await db.select({ 
      count: sql<number>`count(*)` 
    })
    .from(billsTable)
    .where(eq(billsTable.payment_status, 'pending'))
    .execute();
    const pending_bills = Number(pendingBillsResult[0].count);

    // Calculate total revenue from paid bills
    const totalRevenueResult = await db.select({ 
      sum: sql<string>`coalesce(sum(${billsTable.total_amount}), 0)` 
    })
    .from(billsTable)
    .where(eq(billsTable.payment_status, 'paid'))
    .execute();
    const total_revenue = parseFloat(totalRevenueResult[0].sum);

    // Get recent appointments with patient and doctor names
    const recentAppointmentsResult = await db.select({
      id: appointmentsTable.id,
      patient_name: patientsTable.full_name,
      doctor_name: sql<string>`users.full_name`,
      appointment_date: appointmentsTable.appointment_date,
      status: appointmentsTable.status,
    })
    .from(appointmentsTable)
    .innerJoin(patientsTable, eq(appointmentsTable.patient_id, patientsTable.id))
    .innerJoin(sql`users`, sql`${appointmentsTable.doctor_id} = users.id`)
    .orderBy(sql`${appointmentsTable.appointment_date} desc`)
    .limit(5)
    .execute();

    const recent_appointments = recentAppointmentsResult.map(result => ({
      id: result.id,
      patient_name: result.patient_name,
      doctor_name: result.doctor_name,
      appointment_date: result.appointment_date,
      status: result.status,
    }));

    return {
      total_patients,
      appointments_today,
      pending_bills,
      total_revenue,
      recent_appointments,
    };
  } catch (error) {
    console.error('Dashboard stats retrieval failed:', error);
    throw error;
  }
}
