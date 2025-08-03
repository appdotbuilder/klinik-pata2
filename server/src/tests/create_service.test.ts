
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type CreateServiceInput } from '../schema';
import { createService } from '../handlers/create_service';
import { eq } from 'drizzle-orm';

// Simple test input with all required fields
const testInput: CreateServiceInput = {
  name: 'General Consultation',
  description: 'Basic medical consultation service',
  price: 50.00,
  duration_minutes: 30,
  is_active: true
};

describe('createService', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a service with all fields', async () => {
    const result = await createService(testInput);

    // Basic field validation
    expect(result.name).toEqual('General Consultation');
    expect(result.description).toEqual('Basic medical consultation service');
    expect(result.price).toEqual(50.00);
    expect(typeof result.price).toBe('number');
    expect(result.duration_minutes).toEqual(30);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save service to database', async () => {
    const result = await createService(testInput);

    // Query using proper drizzle syntax
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, result.id))
      .execute();

    expect(services).toHaveLength(1);
    expect(services[0].name).toEqual('General Consultation');
    expect(services[0].description).toEqual('Basic medical consultation service');
    expect(parseFloat(services[0].price)).toEqual(50.00);
    expect(services[0].duration_minutes).toEqual(30);
    expect(services[0].is_active).toEqual(true);
    expect(services[0].created_at).toBeInstanceOf(Date);
    expect(services[0].updated_at).toBeInstanceOf(Date);
  });

  it('should apply default is_active when not provided', async () => {
    const inputWithoutActive: CreateServiceInput = {
      name: 'X-Ray Service',
      description: 'Digital X-Ray imaging',
      price: 75.50,
      duration_minutes: 15
      // is_active not provided - should default to true
    };

    const result = await createService(inputWithoutActive);

    expect(result.is_active).toEqual(true);
    expect(result.name).toEqual('X-Ray Service');
    expect(result.price).toEqual(75.50);
    expect(typeof result.price).toBe('number');
  });

  it('should handle nullable description', async () => {
    const inputWithNullDescription: CreateServiceInput = {
      name: 'Emergency Service',
      description: null,
      price: 200.00,
      duration_minutes: null,
      is_active: false
    };

    const result = await createService(inputWithNullDescription);

    expect(result.name).toEqual('Emergency Service');
    expect(result.description).toBeNull();
    expect(result.price).toEqual(200.00);
    expect(result.duration_minutes).toBeNull();
    expect(result.is_active).toEqual(false);
  });

  it('should handle decimal prices correctly', async () => {
    const inputWithDecimal: CreateServiceInput = {
      name: 'Blood Test',
      description: 'Complete blood count',
      price: 25.75,
      duration_minutes: 10,
      is_active: true
    };

    const result = await createService(inputWithDecimal);

    expect(result.price).toEqual(25.75);
    expect(typeof result.price).toBe('number');

    // Verify in database
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, result.id))
      .execute();

    expect(parseFloat(services[0].price)).toEqual(25.75);
  });
});
