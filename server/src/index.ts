
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createUserInputSchema,
  updateUserInputSchema,
  createPatientInputSchema,
  updatePatientInputSchema,
  createAppointmentInputSchema,
  updateAppointmentInputSchema,
  createMedicalRecordInputSchema,
  createMedicineInputSchema,
  updateMedicineInputSchema,
  createPrescriptionInputSchema,
  createServiceInputSchema,
  updateServiceInputSchema,
  createBillInputSchema,
  updateBillInputSchema,
  createPaymentInputSchema,
  createNonMedicalProductInputSchema,
  updateNonMedicalProductInputSchema,
  createSaleInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUsers } from './handlers/get_users';
import { updateUser } from './handlers/update_user';
import { createPatient } from './handlers/create_patient';
import { getPatients } from './handlers/get_patients';
import { updatePatient } from './handlers/update_patient';
import { createAppointment } from './handlers/create_appointment';
import { getAppointments } from './handlers/get_appointments';
import { updateAppointment } from './handlers/update_appointment';
import { createMedicalRecord } from './handlers/create_medical_record';
import { getMedicalRecords } from './handlers/get_medical_records';
import { createMedicine } from './handlers/create_medicine';
import { getMedicines } from './handlers/get_medicines';
import { updateMedicine } from './handlers/update_medicine';
import { createPrescription } from './handlers/create_prescription';
import { getPrescriptions } from './handlers/get_prescriptions';
import { createService } from './handlers/create_service';
import { getServices } from './handlers/get_services';
import { updateService } from './handlers/update_service';
import { createBill } from './handlers/create_bill';
import { getBills } from './handlers/get_bills';
import { updateBill } from './handlers/update_bill';
import { createPayment } from './handlers/create_payment';
import { getPayments } from './handlers/get_payments';
import { createNonMedicalProduct } from './handlers/create_non_medical_product';
import { getNonMedicalProducts } from './handlers/get_non_medical_products';
import { updateNonMedicalProduct } from './handlers/update_non_medical_product';
import { createSale } from './handlers/create_sale';
import { getSales } from './handlers/get_sales';
import { getDashboardStats } from './handlers/get_dashboard_stats';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User procedures
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  getUsers: publicProcedure
    .query(() => getUsers()),
  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),

  // Patient procedures
  createPatient: publicProcedure
    .input(createPatientInputSchema)
    .mutation(({ input }) => createPatient(input)),
  getPatients: publicProcedure
    .query(() => getPatients()),
  updatePatient: publicProcedure
    .input(updatePatientInputSchema)
    .mutation(({ input }) => updatePatient(input)),

  // Appointment procedures
  createAppointment: publicProcedure
    .input(createAppointmentInputSchema)
    .mutation(({ input }) => createAppointment(input)),
  getAppointments: publicProcedure
    .query(() => getAppointments()),
  updateAppointment: publicProcedure
    .input(updateAppointmentInputSchema)
    .mutation(({ input }) => updateAppointment(input)),

  // Medical record procedures
  createMedicalRecord: publicProcedure
    .input(createMedicalRecordInputSchema)
    .mutation(({ input }) => createMedicalRecord(input)),
  getMedicalRecords: publicProcedure
    .query(() => getMedicalRecords()),

  // Medicine procedures
  createMedicine: publicProcedure
    .input(createMedicineInputSchema)
    .mutation(({ input }) => createMedicine(input)),
  getMedicines: publicProcedure
    .query(() => getMedicines()),
  updateMedicine: publicProcedure
    .input(updateMedicineInputSchema)
    .mutation(({ input }) => updateMedicine(input)),

  // Prescription procedures
  createPrescription: publicProcedure
    .input(createPrescriptionInputSchema)
    .mutation(({ input }) => createPrescription(input)),
  getPrescriptions: publicProcedure
    .query(() => getPrescriptions()),

  // Service procedures
  createService: publicProcedure
    .input(createServiceInputSchema)
    .mutation(({ input }) => createService(input)),
  getServices: publicProcedure
    .query(() => getServices()),
  updateService: publicProcedure
    .input(updateServiceInputSchema)
    .mutation(({ input }) => updateService(input)),

  // Bill procedures
  createBill: publicProcedure
    .input(createBillInputSchema)
    .mutation(({ input }) => createBill(input)),
  getBills: publicProcedure
    .query(() => getBills()),
  updateBill: publicProcedure
    .input(updateBillInputSchema)
    .mutation(({ input }) => updateBill(input)),

  // Payment procedures
  createPayment: publicProcedure
    .input(createPaymentInputSchema)
    .mutation(({ input }) => createPayment(input)),
  getPayments: publicProcedure
    .query(() => getPayments()),

  // Non-medical product procedures
  createNonMedicalProduct: publicProcedure
    .input(createNonMedicalProductInputSchema)
    .mutation(({ input }) => createNonMedicalProduct(input)),
  getNonMedicalProducts: publicProcedure
    .query(() => getNonMedicalProducts()),
  updateNonMedicalProduct: publicProcedure
    .input(updateNonMedicalProductInputSchema)
    .mutation(({ input }) => updateNonMedicalProduct(input)),

  // Sale procedures
  createSale: publicProcedure
    .input(createSaleInputSchema)
    .mutation(({ input }) => createSale(input)),
  getSales: publicProcedure
    .query(() => getSales()),

  // Dashboard procedures
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
  console.log(`TRPC server listening at port: ${port}`);
}

start();
