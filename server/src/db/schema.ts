
import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  numeric, 
  integer, 
  boolean,
  date,
  pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['resepsionis', 'dokter']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['menunggu', 'berlangsung', 'selesai', 'dibatalkan']);
export const paymentStatusEnum = pgEnum('payment_status', ['belum_bayar', 'lunas', 'sebagian']);
export const paymentMethodEnum = pgEnum('payment_method', ['tunai', 'kartu_debit', 'kartu_kredit', 'transfer']);
export const prescriptionStatusEnum = pgEnum('prescription_status', ['menunggu', 'diproses', 'selesai']);
export const genderEnum = pgEnum('gender', ['pria', 'wanita']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  full_name: text('full_name').notNull(),
  role: userRoleEnum('role').notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Patients table
export const patientsTable = pgTable('patients', {
  id: serial('id').primaryKey(),
  patient_code: text('patient_code').notNull().unique(),
  full_name: text('full_name').notNull(),
  date_of_birth: date('date_of_birth').notNull(),
  gender: genderEnum('gender').notNull(),
  phone: text('phone'),
  address: text('address'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Appointments table
export const appointmentsTable = pgTable('appointments', {
  id: serial('id').primaryKey(),
  patient_id: integer('patient_id').notNull().references(() => patientsTable.id),
  doctor_id: integer('doctor_id').notNull().references(() => usersTable.id),
  appointment_date: date('appointment_date').notNull(),
  appointment_time: text('appointment_time').notNull(),
  complaint: text('complaint'),
  status: appointmentStatusEnum('status').default('menunggu').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Medical records table
export const medicalRecordsTable = pgTable('medical_records', {
  id: serial('id').primaryKey(),
  patient_id: integer('patient_id').notNull().references(() => patientsTable.id),
  doctor_id: integer('doctor_id').notNull().references(() => usersTable.id),
  appointment_id: integer('appointment_id').references(() => appointmentsTable.id),
  diagnosis: text('diagnosis').notNull(),
  symptoms: text('symptoms'),
  treatment: text('treatment'),
  notes: text('notes'),
  visit_date: date('visit_date').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Medicines table
export const medicinesTable = pgTable('medicines', {
  id: serial('id').primaryKey(),
  medicine_code: text('medicine_code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  unit: text('unit').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock_quantity: integer('stock_quantity').default(0).notNull(),
  is_prescription_only: boolean('is_prescription_only').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Prescriptions table
export const prescriptionsTable = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  medical_record_id: integer('medical_record_id').notNull().references(() => medicalRecordsTable.id),
  status: prescriptionStatusEnum('status').default('menunggu').notNull(),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Prescription items table
export const prescriptionItemsTable = pgTable('prescription_items', {
  id: serial('id').primaryKey(),
  prescription_id: integer('prescription_id').notNull().references(() => prescriptionsTable.id),
  medicine_id: integer('medicine_id').notNull().references(() => medicinesTable.id),
  quantity: integer('quantity').notNull(),
  dosage: text('dosage').notNull(),
  instructions: text('instructions'),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
});

// Services table
export const servicesTable = pgTable('services', {
  id: serial('id').primaryKey(),
  service_code: text('service_code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Bills table
export const billsTable = pgTable('bills', {
  id: serial('id').primaryKey(),
  bill_number: text('bill_number').notNull().unique(),
  patient_id: integer('patient_id').notNull().references(() => patientsTable.id),
  medical_record_id: integer('medical_record_id').references(() => medicalRecordsTable.id),
  prescription_id: integer('prescription_id').references(() => prescriptionsTable.id),
  subtotal_services: numeric('subtotal_services', { precision: 10, scale: 2 }).default('0').notNull(),
  subtotal_medicines: numeric('subtotal_medicines', { precision: 10, scale: 2 }).default('0').notNull(),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  payment_status: paymentStatusEnum('payment_status').default('belum_bayar').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Bill services table
export const billServicesTable = pgTable('bill_services', {
  id: serial('id').primaryKey(),
  bill_id: integer('bill_id').notNull().references(() => billsTable.id),
  service_id: integer('service_id').notNull().references(() => servicesTable.id),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
});

// Payments table
export const paymentsTable = pgTable('payments', {
  id: serial('id').primaryKey(),
  bill_id: integer('bill_id').notNull().references(() => billsTable.id),
  amount_paid: numeric('amount_paid', { precision: 10, scale: 2 }).notNull(),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  change_amount: numeric('change_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Non-medical products table
export const nonMedicalProductsTable = pgTable('non_medical_products', {
  id: serial('id').primaryKey(),
  product_code: text('product_code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock_quantity: integer('stock_quantity').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Sales table
export const salesTable = pgTable('sales', {
  id: serial('id').primaryKey(),
  sale_number: text('sale_number').notNull().unique(),
  customer_name: text('customer_name'),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  amount_paid: numeric('amount_paid', { precision: 10, scale: 2 }).notNull(),
  change_amount: numeric('change_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Sale items table
export const saleItemsTable = pgTable('sale_items', {
  id: serial('id').primaryKey(),
  sale_id: integer('sale_id').notNull().references(() => salesTable.id),
  product_id: integer('product_id').notNull().references(() => nonMedicalProductsTable.id),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  appointments: many(appointmentsTable),
  medicalRecords: many(medicalRecordsTable),
}));

export const patientsRelations = relations(patientsTable, ({ many }) => ({
  appointments: many(appointmentsTable),
  medicalRecords: many(medicalRecordsTable),
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
  bills: many(billsTable),
}));

export const prescriptionsRelations = relations(prescriptionsTable, ({ one, many }) => ({
  medicalRecord: one(medicalRecordsTable, {
    fields: [prescriptionsTable.medical_record_id],
    references: [medicalRecordsTable.id],
  }),
  items: many(prescriptionItemsTable),
  bills: many(billsTable),
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

export const billsRelations = relations(billsTable, ({ one, many }) => ({
  patient: one(patientsTable, {
    fields: [billsTable.patient_id],
    references: [patientsTable.id],
  }),
  medicalRecord: one(medicalRecordsTable, {
    fields: [billsTable.medical_record_id],
    references: [medicalRecordsTable.id],
  }),
  prescription: one(prescriptionsTable, {
    fields: [billsTable.prescription_id],
    references: [prescriptionsTable.id],
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

// Export all tables for relation queries
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
