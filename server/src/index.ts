
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createUserInputSchema,
  createPatientInputSchema,
  createAppointmentInputSchema,
  createMedicalRecordInputSchema,
  createMedicineInputSchema,
  createPrescriptionInputSchema,
  createServiceInputSchema,
  createBillInputSchema,
  createPaymentInputSchema,
  createNonMedicalProductInputSchema,
  createSaleInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUsers } from './handlers/get_users';
import { createPatient } from './handlers/create_patient';
import { getPatients } from './handlers/get_patients';
import { createAppointment } from './handlers/create_appointment';
import { getAppointments } from './handlers/get_appointments';
import { createMedicalRecord } from './handlers/create_medical_record';
import { getMedicalRecords } from './handlers/get_medical_records';
import { createMedicine } from './handlers/create_medicine';
import { getMedicines } from './handlers/get_medicines';
import { createPrescription } from './handlers/create_prescription';
import { getPrescriptions } from './handlers/get_prescriptions';
import { createService } from './handlers/create_service';
import { getServices } from './handlers/get_services';
import { createBill } from './handlers/create_bill';
import { getBills } from './handlers/get_bills';
import { createPayment } from './handlers/create_payment';
import { getPayments } from './handlers/get_payments';
import { createNonMedicalProduct } from './handlers/create_non_medical_product';
import { getNonMedicalProducts } from './handlers/get_non_medical_products';
import { createSale } from './handlers/create_sale';
import { getSales } from './handlers/get_sales';
import { getDashboardStats } from './handlers/get_dashboard_stats';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  getUsers: publicProcedure
    .query(() => getUsers()),

  // Patient management
  createPatient: publicProcedure
    .input(createPatientInputSchema)
    .mutation(({ input }) => createPatient(input)),
  getPatients: publicProcedure
    .query(() => getPatients()),

  // Appointment management
  createAppointment: publicProcedure
    .input(createAppointmentInputSchema)
    .mutation(({ input }) => createAppointment(input)),
  getAppointments: publicProcedure
    .query(() => getAppointments()),

  // Medical record management
  createMedicalRecord: publicProcedure
    .input(createMedicalRecordInputSchema)
    .mutation(({ input }) => createMedicalRecord(input)),
  getMedicalRecords: publicProcedure
    .input(z.object({ patientId: z.number().optional() }))
    .query(({ input }) => getMedicalRecords(input.patientId)),

  // Medicine management
  createMedicine: publicProcedure
    .input(createMedicineInputSchema)
    .mutation(({ input }) => createMedicine(input)),
  getMedicines: publicProcedure
    .query(() => getMedicines()),

  // Prescription management
  createPrescription: publicProcedure
    .input(createPrescriptionInputSchema)
    .mutation(({ input }) => createPrescription(input)),
  getPrescriptions: publicProcedure
    .query(() => getPrescriptions()),

  // Service management
  createService: publicProcedure
    .input(createServiceInputSchema)
    .mutation(({ input }) => createService(input)),
  getServices: publicProcedure
    .query(() => getServices()),

  // Bill management
  createBill: publicProcedure
    .input(createBillInputSchema)
    .mutation(({ input }) => createBill(input)),
  getBills: publicProcedure
    .query(() => getBills()),

  // Payment management
  createPayment: publicProcedure
    .input(createPaymentInputSchema)
    .mutation(({ input }) => createPayment(input)),
  getPayments: publicProcedure
    .input(z.object({ billId: z.number().optional() }))
    .query(({ input }) => getPayments(input.billId)),

  // Non-medical product management
  createNonMedicalProduct: publicProcedure
    .input(createNonMedicalProductInputSchema)
    .mutation(({ input }) => createNonMedicalProduct(input)),
  getNonMedicalProducts: publicProcedure
    .query(() => getNonMedicalProducts()),

  // Sales management
  createSale: publicProcedure
    .input(createSaleInputSchema)
    .mutation(({ input }) => createSale(input)),
  getSales: publicProcedure
    .query(() => getSales()),

  // Dashboard
  getDashboardStats: publicProcedure
    .query(() => getDashboardStats()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Klinik PaTa2 TRPC server listening at port: ${port}`);
}

start();
