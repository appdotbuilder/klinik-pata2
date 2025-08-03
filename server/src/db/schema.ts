
import { serial, text, pgTable, timestamp, numeric, integer, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'doctor', 'nurse', 'receptionist']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'completed', 'cancelled', 'no_show']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'overdue']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'insurance', 'mobile_money']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  full_name: text('full_name').notNull(),
  role: userRoleEnum('role').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Patients table
export const patientsTable = pgTable('patients', {
  id: serial('id').primaryKey(),
  patient_code: text('patient_code').notNull().unique(),
  full_name: text('full_name').notNull(),
  date_of_birth: timestamp('date_of_birth'),
  gender: genderEnum('gender'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  emergency_contact_name: text('emergency_contact_name'),
  emergency_contact_phone: text('emergency_contact_phone'),
  blood_type: text('blood_type'),
  allergies: text('allergies'),
  past_medical_history: text('past_medical_history'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Appointments table
export const appointmentsTable = pgTable('appointments', {
  id: serial('id').primaryKey(),
  patient_id: integer('patient_id').notNull().references(() => patientsTable.id),
  doctor_id: integer('doctor_id').notNull().references(() => usersTable.id),
  appointment_date: timestamp('appointment_date').notNull(),
  duration_minutes: integer('duration_minutes').notNull().default(30),
  status: appointmentStatusEnum('status').notNull().default('scheduled'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Medical records table
export const medicalRecordsTable = pgTable('medical_records', {
  id: serial('id').primaryKey(),
  patient_id: integer('patient_id').notNull().references(() => patientsTable.id),
  doctor_id: integer('doctor_id').notNull().references(() => usersTable.id),
  appointment_id: integer('appointment_id').references(() => appointmentsTable.id),
  diagnosis: text('diagnosis').notNull(),
  symptoms: text('symptoms'),
  treatment_plan: text('treatment_plan'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Medicines table
export const medicinesTable = pgTable('medicines', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  dosage_form: text('dosage_form'),
  strength: text('strength'),
  manufacturer: text('manufacturer'),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  stock_quantity: integer('stock_quantity').notNull().default(0),
  expiry_date: timestamp('expiry_date'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Prescriptions table
export const prescriptionsTable = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  patient_id: integer('patient_id').notNull().references(() => patientsTable.id),
  doctor_id: integer('doctor_id').notNull().references(() => usersTable.id),
  medical_record_id: integer('medical_record_id').references(() => medicalRecordsTable.id),
  prescription_date: timestamp('prescription_date').notNull().defaultNow(),
  instructions: text('instructions'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Prescription items table
export const prescriptionItemsTable = pgTable('prescription_items', {
  id: serial('id').primaryKey(),
  prescription_id: integer('prescription_id').notNull().references(() => prescriptionsTable.id),
  medicine_id: integer('medicine_id').notNull().references(() => medicinesTable.id),
  quantity: integer('quantity').notNull(),
  dosage_instructions: text('dosage_instructions'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Services table
export const servicesTable = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  duration_minutes: integer('duration_minutes').default(30),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Bills table
export const billsTable = pgTable('bills', {
  id: serial('id').primaryKey(),
  patient_id: integer('patient_id').notNull().references(() => patientsTable.id),
  bill_number: text('bill_number').notNull().unique(),
  bill_date: timestamp('bill_date').notNull().defaultNow(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax_amount: numeric('tax_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  payment_status: paymentStatusEnum('payment_status').notNull().default('pending'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Bill services table (junction table for bills and services)
export const billServicesTable = pgTable('bill_services', {
  id: serial('id').primaryKey(),
  bill_id: integer('bill_id').notNull().references(() => billsTable.id),
  service_id: integer('service_id').notNull().references(() => servicesTable.id),
  quantity: integer('quantity').notNull().default(1),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  total_price: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Payments table
export const paymentsTable = pgTable('payments', {
  id: serial('id').primaryKey(),
  bill_id: integer('bill_id').notNull().references(() => billsTable.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  payment_date: timestamp('payment_date').notNull().defaultNow(),
  reference_number: text('reference_number'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Non-medical products table
export const nonMedicalProductsTable = pgTable('non_medical_products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  stock_quantity: integer('stock_quantity').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Sales table
export const salesTable = pgTable('sales', {
  id: serial('id').primaryKey(),
  sale_number: text('sale_number').notNull().unique(),
  customer_name: text('customer_name'),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  amount_paid: numeric('amount_paid', { precision: 10, scale: 2 }).notNull(),
  change_amount: numeric('change_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  sale_date: timestamp('sale_date').notNull().defaultNow(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Sale items table
export const saleItemsTable = pgTable('sale_items', {
  id: serial('id').primaryKey(),
  sale_id: integer('sale_id').notNull().references(() => salesTable.id),
  product_id: integer('product_id').notNull().references(() => nonMedicalProductsTable.id),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  total_price: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  appointments: many(appointmentsTable),
  medicalRecords: many(medicalRecordsTable),
  prescriptions: many(prescriptionsTable),
}));

export const patientsRelations = relations(patientsTable, ({ many }) => ({
  appointments: many(appointmentsTable),
  medicalRecords: many(medicalRecordsTable),
  prescriptions: many(prescriptionsTable),
  bills: many(billsTable),
}));

export const appointmentsRelations = relations(appointmentsTable, ({ one, many }) => ({
  patient: one(patientsTable, {
    fields: [appointmentsTable.patient_id],
    references: [patientsTable.id],
  }),
  doctor: one(usersTable, {
    fields: [appointmentsTable.doctor_id],
    references: [usersTable.id],
  }),
  medicalRecords: many(medicalRecordsTable),
}));

export const medicalRecordsRelations = relations(medicalRecordsTable, ({ one, many }) => ({
  patient: one(patientsTable, {
    fields: [medicalRecordsTable.patient_id],
    references: [patientsTable.id],
  }),
  doctor: one(usersTable, {
    fields: [medicalRecordsTable.doctor_id],
    references: [usersTable.id],
  }),
  appointment: one(appointmentsTable, {
    fields: [medicalRecordsTable.appointment_id],
    references: [appointmentsTable.id],
  }),
  prescriptions: many(prescriptionsTable),
}));

export const prescriptionsRelations = relations(prescriptionsTable, ({ one, many }) => ({
  patient: one(patientsTable, {
    fields: [prescriptionsTable.patient_id],
    references: [patientsTable.id],
  }),
  doctor: one(usersTable, {
    fields: [prescriptionsTable.doctor_id],
    references: [usersTable.id],
  }),
  medicalRecord: one(medicalRecordsTable, {
    fields: [prescriptionsTable.medical_record_id],
    references: [medicalRecordsTable.id],
  }),
  items: many(prescriptionItemsTable),
}));

export const prescriptionItemsRelations = relations(prescriptionItemsTable, ({ one }) => ({
  prescription: one(prescriptionsTable, {
    fields: [prescriptionItemsTable.prescription_id],
    references: [prescriptionsTable.id],
  }),
  medicine: one(medicinesTable, {
    fields: [prescriptionItemsTable.medicine_id],
    references: [medicinesTable.id],
  }),
}));

export const medicinesRelations = relations(medicinesTable, ({ many }) => ({
  prescriptionItems: many(prescriptionItemsTable),
}));

export const servicesRelations = relations(servicesTable, ({ many }) => ({
  billServices: many(billServicesTable),
}));

export const billsRelations = relations(billsTable, ({ one, many }) => ({
  patient: one(patientsTable, {
    fields: [billsTable.patient_id],
    references: [patientsTable.id],
  }),
  services: many(billServicesTable),
  payments: many(paymentsTable),
}));

export const billServicesRelations = relations(billServicesTable, ({ one }) => ({
  bill: one(billsTable, {
    fields: [billServicesTable.bill_id],
    references: [billsTable.id],
  }),
  service: one(servicesTable, {
    fields: [billServicesTable.service_id],
    references: [servicesTable.id],
  }),
}));

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  bill: one(billsTable, {
    fields: [paymentsTable.bill_id],
    references: [billsTable.id],
  }),
}));

export const salesRelations = relations(salesTable, ({ many }) => ({
  items: many(saleItemsTable),
}));

export const saleItemsRelations = relations(saleItemsTable, ({ one }) => ({
  sale: one(salesTable, {
    fields: [saleItemsTable.sale_id],
    references: [salesTable.id],
  }),
  product: one(nonMedicalProductsTable, {
    fields: [saleItemsTable.product_id],
    references: [nonMedicalProductsTable.id],
  }),
}));

export const nonMedicalProductsRelations = relations(nonMedicalProductsTable, ({ many }) => ({
  saleItems: many(saleItemsTable),
}));

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  patients: patientsTable,
  appointments: appointmentsTable,
  medicalRecords: medicalRecordsTable,
  medicines: medicinesTable,
  prescriptions: prescriptionsTable,
  prescriptionItems: prescriptionItemsTable,
  services: servicesTable,
  bills: billsTable,
  billServices: billServicesTable,
  payments: paymentsTable,
  nonMedicalProducts: nonMedicalProductsTable,
  sales: salesTable,
  saleItems: saleItemsTable,
};
