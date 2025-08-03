
import { z } from 'zod';

// Enums
export const userRoleEnum = z.enum(['resepsionis', 'dokter']);
export const appointmentStatusEnum = z.enum(['menunggu', 'berlangsung', 'selesai', 'dibatalkan']);
export const paymentStatusEnum = z.enum(['belum_bayar', 'lunas', 'sebagian']);
export const paymentMethodEnum = z.enum(['tunai', 'kartu_debit', 'kartu_kredit', 'transfer']);
export const prescriptionStatusEnum = z.enum(['menunggu', 'diproses', 'selesai']);

// User schemas
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password_hash: z.string(),
  full_name: z.string(),
  role: userRoleEnum,
  is_active: z.boolean(),
  created_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  full_name: z.string(),
  role: userRoleEnum
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

// Patient schemas
export const patientSchema = z.object({
  id: z.number(),
  patient_code: z.string(),
  full_name: z.string(),
  date_of_birth: z.coerce.date(),
  gender: z.enum(['pria', 'wanita']),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Patient = z.infer<typeof patientSchema>;

export const createPatientInputSchema = z.object({
  full_name: z.string(),
  date_of_birth: z.string(),
  gender: z.enum(['pria', 'wanita']),
  phone: z.string().nullable(),
  address: z.string().nullable()
});

export type CreatePatientInput = z.infer<typeof createPatientInputSchema>;

// Appointment schemas
export const appointmentSchema = z.object({
  id: z.number(),
  patient_id: z.number(),
  doctor_id: z.number(),
  appointment_date: z.coerce.date(),
  appointment_time: z.string(),
  complaint: z.string().nullable(),
  status: appointmentStatusEnum,
  created_at: z.coerce.date()
});

export type Appointment = z.infer<typeof appointmentSchema>;

export const createAppointmentInputSchema = z.object({
  patient_id: z.number(),
  doctor_id: z.number(),
  appointment_date: z.string(),
  appointment_time: z.string(),
  complaint: z.string().nullable()
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentInputSchema>;

// Medical Record schemas
export const medicalRecordSchema = z.object({
  id: z.number(),
  patient_id: z.number(),
  doctor_id: z.number(),
  appointment_id: z.number().nullable(),
  diagnosis: z.string(),
  symptoms: z.string().nullable(),
  treatment: z.string().nullable(),
  notes: z.string().nullable(),
  visit_date: z.coerce.date(),
  created_at: z.coerce.date()
});

export type MedicalRecord = z.infer<typeof medicalRecordSchema>;

export const createMedicalRecordInputSchema = z.object({
  patient_id: z.number(),
  doctor_id: z.number(),
  appointment_id: z.number().nullable(),
  diagnosis: z.string(),
  symptoms: z.string().nullable(),
  treatment: z.string().nullable(),
  notes: z.string().nullable()
});

export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordInputSchema>;

// Medicine schemas
export const medicineSchema = z.object({
  id: z.number(),
  medicine_code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  unit: z.string(),
  price: z.number(),
  stock_quantity: z.number().int(),
  is_prescription_only: z.boolean(),
  created_at: z.coerce.date()
});

export type Medicine = z.infer<typeof medicineSchema>;

export const createMedicineInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  unit: z.string(),
  price: z.number().positive(),
  stock_quantity: z.number().int().nonnegative(),
  is_prescription_only: z.boolean()
});

export type CreateMedicineInput = z.infer<typeof createMedicineInputSchema>;

// Prescription schemas
export const prescriptionSchema = z.object({
  id: z.number(),
  medical_record_id: z.number(),
  status: prescriptionStatusEnum,
  total_amount: z.number(),
  created_at: z.coerce.date()
});

export type Prescription = z.infer<typeof prescriptionSchema>;

export const prescriptionItemSchema = z.object({
  id: z.number(),
  prescription_id: z.number(),
  medicine_id: z.number(),
  quantity: z.number().int(),
  dosage: z.string(),
  instructions: z.string().nullable(),
  unit_price: z.number(),
  subtotal: z.number()
});

export type PrescriptionItem = z.infer<typeof prescriptionItemSchema>;

export const createPrescriptionInputSchema = z.object({
  medical_record_id: z.number(),
  items: z.array(z.object({
    medicine_id: z.number(),
    quantity: z.number().int().positive(),
    dosage: z.string(),
    instructions: z.string().nullable()
  }))
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionInputSchema>;

// Service schemas
export const serviceSchema = z.object({
  id: z.number(),
  service_code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  is_active: z.boolean(),
  created_at: z.coerce.date()
});

export type Service = z.infer<typeof serviceSchema>;

export const createServiceInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  price: z.number().positive()
});

export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;

// Bill schemas
export const billSchema = z.object({
  id: z.number(),
  bill_number: z.string(),
  patient_id: z.number(),
  medical_record_id: z.number().nullable(),
  prescription_id: z.number().nullable(),
  subtotal_services: z.number(),
  subtotal_medicines: z.number(),
  total_amount: z.number(),
  payment_status: paymentStatusEnum,
  created_at: z.coerce.date()
});

export type Bill = z.infer<typeof billSchema>;

export const billServiceSchema = z.object({
  id: z.number(),
  bill_id: z.number(),
  service_id: z.number(),
  quantity: z.number().int(),
  unit_price: z.number(),
  subtotal: z.number()
});

export type BillService = z.infer<typeof billServiceSchema>;

export const createBillInputSchema = z.object({
  patient_id: z.number(),
  medical_record_id: z.number().nullable(),
  prescription_id: z.number().nullable(),
  services: z.array(z.object({
    service_id: z.number(),
    quantity: z.number().int().positive()
  }))
});

export type CreateBillInput = z.infer<typeof createBillInputSchema>;

// Payment schemas
export const paymentSchema = z.object({
  id: z.number(),
  bill_id: z.number(),
  amount_paid: z.number(),
  payment_method: paymentMethodEnum,
  change_amount: z.number(),
  notes: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Payment = z.infer<typeof paymentSchema>;

export const createPaymentInputSchema = z.object({
  bill_id: z.number(),
  amount_paid: z.number().positive(),
  payment_method: paymentMethodEnum,
  notes: z.string().nullable()
});

export type CreatePaymentInput = z.infer<typeof createPaymentInputSchema>;

// Non-medical Product schemas
export const nonMedicalProductSchema = z.object({
  id: z.number(),
  product_code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  price: z.number(),
  stock_quantity: z.number().int(),
  created_at: z.coerce.date()
});

export type NonMedicalProduct = z.infer<typeof nonMedicalProductSchema>;

export const createNonMedicalProductInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  price: z.number().positive(),
  stock_quantity: z.number().int().nonnegative()
});

export type CreateNonMedicalProductInput = z.infer<typeof createNonMedicalProductInputSchema>;

// Sales schemas
export const saleSchema = z.object({
  id: z.number(),
  sale_number: z.string(),
  customer_name: z.string().nullable(),
  total_amount: z.number(),
  amount_paid: z.number(),
  change_amount: z.number(),
  payment_method: paymentMethodEnum,
  created_at: z.coerce.date()
});

export type Sale = z.infer<typeof saleSchema>;

export const saleItemSchema = z.object({
  id: z.number(),
  sale_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int(),
  unit_price: z.number(),
  subtotal: z.number()
});

export type SaleItem = z.infer<typeof saleItemSchema>;

export const createSaleInputSchema = z.object({
  customer_name: z.string().nullable(),
  amount_paid: z.number().positive(),
  payment_method: paymentMethodEnum,
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().int().positive()
  }))
});

export type CreateSaleInput = z.infer<typeof createSaleInputSchema>;

// Dashboard schemas
export const dashboardStatsSchema = z.object({
  today_patients: z.number().int(),
  upcoming_appointments: z.number().int(),
  today_revenue: z.number(),
  pending_prescriptions: z.number().int()
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
