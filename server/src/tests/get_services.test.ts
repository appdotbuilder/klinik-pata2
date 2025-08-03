
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { getServices } from '../handlers/get_services';

describe('getServices', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no services exist', async () => {
    const result = await getServices();
    expect(result).toEqual([]);
  });

  it('should return all services', async () => {
    // Create test services
    await db.insert(servicesTable)
      .values([
        {
          name: 'Consultation',
          description: 'General consultation',
          price: '50.00',
          duration_minutes: 30,
          is_active: true
        },
        {
          name: 'X-Ray',
          description: 'Chest X-Ray',
          price: '75.50',
          duration_minutes: 15,
          is_active: true
        },
        {
          name: 'Blood Test',
          description: null,
          price: '25.00',
          duration_minutes: null,
          is_active: false
        }
      ])
      .execute();

    const result = await getServices();

    expect(result).toHaveLength(3);
    
    // Verify first service
    const consultation = result.find(s => s.name === 'Consultation');
    expect(consultation).toBeDefined();
    expect(consultation!.description).toEqual('General consultation');
    expect(consultation!.price).toEqual(50.00);
    expect(typeof consultation!.price).toBe('number');
    expect(consultation!.duration_minutes).toEqual(30);
    expect(consultation!.is_active).toBe(true);
    expect(consultation!.id).toBeDefined();
    expect(consultation!.created_at).toBeInstanceOf(Date);
    expect(consultation!.updated_at).toBeInstanceOf(Date);

    // Verify second service
    const xray = result.find(s => s.name === 'X-Ray');
    expect(xray).toBeDefined();
    expect(xray!.price).toEqual(75.50);
    expect(typeof xray!.price).toBe('number');
    expect(xray!.duration_minutes).toEqual(15);

    // Verify third service with null values
    const bloodTest = result.find(s => s.name === 'Blood Test');
    expect(bloodTest).toBeDefined();
    expect(bloodTest!.description).toBeNull();
    expect(bloodTest!.price).toEqual(25.00);
    expect(typeof bloodTest!.price).toBe('number');
    expect(bloodTest!.duration_minutes).toBeNull();
    expect(bloodTest!.is_active).toBe(false);
  });

  it('should handle services with different active states', async () => {
    // Create services with different active states
    await db.insert(servicesTable)
      .values([
        {
          name: 'Active Service',
          price: '100.00',
          is_active: true
        },
        {
          name: 'Inactive Service',
          price: '200.00',
          is_active: false
        }
      ])
      .execute();

    const result = await getServices();

    expect(result).toHaveLength(2);
    
    const activeService = result.find(s => s.name === 'Active Service');
    const inactiveService = result.find(s => s.name === 'Inactive Service');
    
    expect(activeService!.is_active).toBe(true);
    expect(inactiveService!.is_active).toBe(false);
  });
});
