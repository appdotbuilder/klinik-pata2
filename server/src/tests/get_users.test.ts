
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { getUsers } from '../handlers/get_users';
import { eq } from 'drizzle-orm';

const testUser1: CreateUserInput = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'password123',
  full_name: 'John Doe',
  role: 'doctor',
  is_active: true
};

const testUser2: CreateUserInput = {
  username: 'jane_smith',
  email: 'jane@example.com',
  password: 'password456',
  full_name: 'Jane Smith',
  role: 'nurse',
  is_active: false
};

describe('getUsers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no users exist', async () => {
    const result = await getUsers();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all users', async () => {
    // Create test users
    await db.insert(usersTable)
      .values([
        {
          username: testUser1.username,
          email: testUser1.email,
          password_hash: 'hashed_' + testUser1.password,
          full_name: testUser1.full_name,
          role: testUser1.role,
          is_active: testUser1.is_active
        },
        {
          username: testUser2.username,
          email: testUser2.email,
          password_hash: 'hashed_' + testUser2.password,
          full_name: testUser2.full_name,
          role: testUser2.role,
          is_active: testUser2.is_active
        }
      ])
      .execute();

    const result = await getUsers();

    expect(result).toHaveLength(2);
    
    // Check first user
    const user1 = result.find(u => u.username === 'john_doe');
    expect(user1).toBeDefined();
    expect(user1?.email).toEqual('john@example.com');
    expect(user1?.full_name).toEqual('John Doe');
    expect(user1?.role).toEqual('doctor');
    expect(user1?.is_active).toEqual(true);
    expect(user1?.id).toBeDefined();
    expect(user1?.created_at).toBeInstanceOf(Date);
    expect(user1?.updated_at).toBeInstanceOf(Date);

    // Check second user
    const user2 = result.find(u => u.username === 'jane_smith');
    expect(user2).toBeDefined();
    expect(user2?.email).toEqual('jane@example.com');
    expect(user2?.full_name).toEqual('Jane Smith');
    expect(user2?.role).toEqual('nurse');
    expect(user2?.is_active).toEqual(false);
    expect(user2?.id).toBeDefined();
    expect(user2?.created_at).toBeInstanceOf(Date);
    expect(user2?.updated_at).toBeInstanceOf(Date);
  });

  it('should return users in creation order', async () => {
    // Create users in specific order
    const firstUser = await db.insert(usersTable)
      .values({
        username: testUser1.username,
        email: testUser1.email,
        password_hash: 'hashed_' + testUser1.password,
        full_name: testUser1.full_name,
        role: testUser1.role,
        is_active: testUser1.is_active
      })
      .returning()
      .execute();

    const secondUser = await db.insert(usersTable)
      .values({
        username: testUser2.username,
        email: testUser2.email,
        password_hash: 'hashed_' + testUser2.password,
        full_name: testUser2.full_name,
        role: testUser2.role,
        is_active: testUser2.is_active
      })
      .returning()
      .execute();

    const result = await getUsers();

    expect(result).toHaveLength(2);
    expect(result[0].id).toEqual(firstUser[0].id);
    expect(result[1].id).toEqual(secondUser[0].id);
  });

  it('should handle users with different roles', async () => {
    // Create users with different roles
    await db.insert(usersTable)
      .values([
        {
          username: 'admin_user',
          email: 'admin@example.com',
          password_hash: 'hashed_password',
          full_name: 'Admin User',
          role: 'admin',
          is_active: true
        },
        {
          username: 'receptionist_user',
          email: 'receptionist@example.com',
          password_hash: 'hashed_password',
          full_name: 'Receptionist User',
          role: 'receptionist',
          is_active: true
        }
      ])
      .execute();

    const result = await getUsers();

    expect(result).toHaveLength(2);
    
    const adminUser = result.find(u => u.role === 'admin');
    const receptionistUser = result.find(u => u.role === 'receptionist');
    
    expect(adminUser).toBeDefined();
    expect(receptionistUser).toBeDefined();
    expect(adminUser?.username).toEqual('admin_user');
    expect(receptionistUser?.username).toEqual('receptionist_user');
  });
});
