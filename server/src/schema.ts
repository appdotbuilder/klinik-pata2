
import { z } from 'zod';

// Enums
export const userRoleEnum = z.enum(['admin', 'doctor', 'nurse', 'receptionist']);
export const genderEnum = z.enum(['male', 'female', 'other']);
export const appointmentStatusEnum = z.enum(['scheduled', 'completed', 'cancelled', 'no_show']);
export const paymentStatusEnum = z.enum(['pending', 'paid', 'overdue']);
export const paymentMethodEnum = z.enum(['cash', 'card', 'insurance', 'mobile_money']);

// User schemas
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  full_name: z.string(),
  role: userRoleEnum,
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  role: userRoleEnum,
  is_active: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  user_id: z.number(),
  username: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  full_name: z.string().min(1).optional(),
  role: userRoleEnum.optional(),
  is_active: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Patient schemas
export const patientSchema = z.object({
  id: z.number(),
  patient_code: z.string(),
  full_name: z.string(),
  date_of_birth: z.coerce.date().nullable(),
  gender: genderEnum.nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable(),
  blood_type: z.string().nullable(),
  allergies: z.string().nullable(),
  past_medical_history: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Patient = z.infer<typeof patientSchema>;

export const createPatientInputSchema = z.object({
  patient_code: z.string().min(1),
  full_name: z.string().min(1),
  date_of_birth: z.coerce.date().nullable(),
  gender: genderEnum.nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  address: z.string().nullable(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable(),
  blood_type: z.string().nullable(),
  allergies: z.string().nullable(),
  past_medical_history: z.string().nullable(),
});

export type CreatePatientInput = z.infer<typeof createPatientInputSchema>;

export const updatePatientInputSchema = z.object({
  patient_id: z.number(),
  patient_code: z.string().min(1).optional(),
  full_name: z.string().min(1).optional(),
  date_of_birth: z.coerce.date().nullable().optional(),
  gender: genderEnum.nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  emergency_contact_name: z.string().nullable().optional(),
  emergency_contact_phone: z.string().nullable().optional(),
  blood_type: z.string().nullable().optional(),
  allergies: z.string().nullable().optional(),
  past_medical_history: z.string().nullable().optional(),
});

export type UpdatePatientInput = z.infer<typeof updatePatientInputSchema>;

// Appointment schemas
export const appointmentSchema = z.object({
  id: z.number(),
  patient_id: z.number(),
  doctor_id: z.number(),
  appointment_date: z.coerce.date(),
  duration_minutes: z.number(),
  status: appointmentStatusEnum,
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

export const createAppointmentInputSchema = z.object({
  patient_id: z.number(),
  doctor_id: z.number(),
  appointment_date: z.coerce.date(),
  duration_minutes: z.number().positive().optional(),
  status: appointmentStatusEnum.optional(),
  notes: z.string().nullable(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentInputSchema>;

export const updateAppointmentInputSchema = z.object({
  appointment_id: z.number(),
  patient_id: z.number().optional(),
  doctor_id: z.number().optional(),
  appointment_date: z.coerce.date().optional(),
  duration_minutes: z.number().positive().optional(),
  status: appointmentStatusEnum.optional(),
  notes: z.string().nullable().optional(),
});

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentInputSchema>;

// Medical record schemas
export const medicalRecordSchema = z.object({
  id: z.number(),
  patient_id: z.number(),
  doctor_id: z.number(),
  appointment_id: z.number().nullable(),
  diagnosis: z.string(),
  symptoms: z.string().nullable(),
  treatment_plan: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
});

export type MedicalRecord = z.infer<typeof medicalRecordSchema>;

export const createMedicalRecordInputSchema = z.object({
  patient_id: z.number(),
  doctor_id: z.number(),
  appointment_id: z.number().nullable(),
  diagnosis: z.string().min(1),
  symptoms: z.string().nullable(),
  treatment_plan: z.string().nullable(),
  notes: z.string().nullable(),
});

export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordInputSchema>;

// Medicine schemas
export const medicineSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  dosage_form: z.string().nullable(),
  strength: z.string().nullable(),
  manufacturer: z.string().nullable(),
  unit_price: z.number(),
  stock_quantity: z.number().int(),
  expiry_date: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Medicine = z.infer<typeof medicineSchema>;

export const createMedicineInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  dosage_form: z.string().nullable(),
  strength: z.string().nullable(),
  manufacturer: z.string().nullable(),
  unit_price: z.number().positive(),
  stock_quantity: z.number().int().nonnegative().optional(),
  expiry_date: z.coerce.date().nullable(),
});

export type CreateMedicineInput = z.infer<typeof createMedicineInputSchema>;

export const updateMedicineInputSchema = z.object({
  medicine_id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  dosage_form: z.string().nullable().optional(),
  strength: z.string().nullable().optional(),
  manufacturer: z.string().nullable().optional(),
  unit_price: z.number().positive().optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  expiry_date: z.coerce.date().nullable().optional(),
});

export type UpdateMedicineInput = z.infer<typeof updateMedicineInputSchema>;

// Prescription schemas
export const prescriptionSchema = z.object({
  id: z.number(),
  patient_id: z.number(),
  doctor_id: z.number(),
  medical_record_id: z.number().nullable(),
  prescription_date: z.coerce.date(),
  instructions: z.string().nullable(),
  created_at: z.coerce.date(),
});

export type Prescription = z.infer<typeof prescriptionSchema>;

export const prescriptionItemSchema = z.object({
  id: z.number(),
  prescription_id: z.number(),
  medicine_id: z.number(),
  quantity: z.number().int().positive(),
  dosage_instructions: z.string().nullable(),
  created_at: z.coerce.date(),
});

export type PrescriptionItem = z.infer<typeof prescriptionItemSchema>;

export const createPrescriptionInputSchema = z.object({
  patient_id: z.number(),
  doctor_id: z.number(),
  medical_record_id: z.number().nullable(),
  instructions: z.string().nullable(),
  items: z.array(z.object({
    medicine_id: z.number(),
    quantity: z.number().int().positive(),
    dosage_instructions: z.string().nullable(),
  })),
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionInputSchema>;

// Service schemas
export const serviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  duration_minutes: z.number().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Service = z.infer<typeof serviceSchema>;

export const createServiceInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().positive(),
  duration_minutes: z.number().int().positive().nullable(),
  is_active: z.boolean().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;

export const updateServiceInputSchema = z.object({
  service_id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  duration_minutes: z.number().int().positive().nullable().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateServiceInput = z.infer<typeof updateServiceInputSchema>;

// Bill schemas
export const billSchema = z.object({
  id: z.number(),
  patient_id: z.number(),
  bill_number: z.string(),
  bill_date: z.coerce.date(),
  subtotal: z.number(),
  tax_amount: z.number(),
  total_amount: z.number(),
  payment_status: paymentStatusEnum,
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Bill = z.infer<typeof billSchema>;

export const billServiceSchema = z.object({
  id: z.number(),
  bill_id: z.number(),
  service_id: z.number(),
  quantity: z.number().int(),
  unit_price: z.number(),
  total_price: z.number(),
  created_at: z.coerce.date(),
});

export type BillService = z.infer<typeof billServiceSchema>;

export const createBillInputSchema = z.object({
  patient_id: z.number(),
  bill_number: z.string().min(1),
  subtotal: z.number().nonnegative(),
  tax_amount: z.number().nonnegative().optional(),
  total_amount: z.number().positive(),
  payment_status: paymentStatusEnum.optional(),
  notes: z.string().nullable(),
  services: z.array(z.object({
    service_id: z.number(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive(),
    total_price: z.number().positive(),
  })),
});

export type CreateBillInput = z.infer<typeof createBillInputSchema>;

export const updateBillInputSchema = z.object({
  bill_id: z.number(),
  payment_status: paymentStatusEnum.optional(),
  notes: z.string().nullable().optional(),
});

export type UpdateBillInput = z.infer<typeof updateBillInputSchema>;

// Payment schemas
export const paymentSchema = z.object({
  id: z.number(),
  bill_id: z.number(),
  amount: z.number(),
  payment_method: paymentMethodEnum,
  payment_date: z.coerce.date(),
  reference_number: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
});

export type Payment = z.infer<typeof paymentSchema>;

export const createPaymentInputSchema = z.object({
  bill_id: z.number(),
  amount: z.number().positive(),
  payment_method: paymentMethodEnum,
  reference_number: z.string().nullable(),
  notes: z.string().nullable(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentInputSchema>;

// Non-medical product schemas
export const nonMedicalProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  unit_price: z.number(),
  stock_quantity: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type NonMedicalProduct = z.infer<typeof nonMedicalProductSchema>;

export const createNonMedicalProductInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  unit_price: z.number().positive(),
  stock_quantity: z.number().int().nonnegative().optional(),
});

export type CreateNonMedicalProductInput = z.infer<typeof createNonMedicalProductInputSchema>;

export const updateNonMedicalProductInputSchema = z.object({
  product_id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  unit_price: z.number().positive().optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
});

export type UpdateNonMedicalProductInput = z.infer<typeof updateNonMedicalProductInputSchema>;

// Sale schemas
export const saleSchema = z.object({
  id: z.number(),
  sale_number: z.string(),
  customer_name: z.string().nullable(),
  total_amount: z.number(),
  amount_paid: z.number(),
  change_amount: z.number(),
  payment_method: paymentMethodEnum,
  sale_date: z.coerce.date(),
  created_at: z.coerce.date(),
});

export type Sale = z.infer<typeof saleSchema>;

export const saleItemSchema = z.object({
  id: z.number(),
  sale_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int(),
  unit_price: z.number(),
  total_price: z.number(),
  created_at: z.coerce.date(),
});

export type SaleItem = z.infer<typeof saleItemSchema>;

export const createSaleInputSchema = z.object({
  sale_number: z.string().min(1),
  customer_name: z.string().nullable(),
  total_amount: z.number().positive(),
  amount_paid: z.number().positive(),
  change_amount: z.number().nonnegative(),
  payment_method: paymentMethodEnum,
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive(),
    total_price: z.number().positive(),
  })),
});

export type CreateSaleInput = z.infer<typeof createSaleInputSchema>;

// Dashboard schemas
export const dashboardStatsSchema = z.object({
  total_patients: z.number(),
  appointments_today: z.number(),
  pending_bills: z.number(),
  total_revenue: z.number(),
  recent_appointments: z.array(z.object({
    id: z.number(),
    patient_name: z.string(),
    doctor_name: z.string(),
    appointment_date: z.coerce.date(),
    status: appointmentStatusEnum,
  })),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
