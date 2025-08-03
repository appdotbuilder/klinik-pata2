
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type UpdateUserInput } from '../schema';
import { updateUser } from '../handlers/update_user';
import { eq } from 'drizzle-orm';

// Create a test user first
const createTestUser = async (): Promise<number> => {
  const result = await db.insert(usersTable)
    .values({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashed_password123',
      full_name: 'Test User',
      role: 'admin',
      is_active: true,
    })
    .returning()
    .execute();

  return result[0].id;
};

const testUpdateInput: UpdateUserInput = {
  user_id: 1, // Will be set dynamically in tests
  username: 'updateduser',
  email: 'updated@example.com',
  password: 'newpassword123',
  full_name: 'Updated User',
  role: 'doctor',
  is_active: false,
};

describe('updateUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a user', async () => {
    const userId = await createTestUser();
    const input = { ...testUpdateInput, user_id: userId };

    const result = await updateUser(input);

    expect(result.id).toEqual(userId);
    expect(result.username).toEqual('updateduser');
    expect(result.email).toEqual('updated@example.com');
    expect(result.full_name).toEqual('Updated User');
    expect(result.role).toEqual('doctor');
    expect(result.is_active).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.password_hash).toBeDefined();
    expect(result.password_hash).not.toEqual('newpassword123'); // Should be hashed
  });

  it('should save updated user to database', async () => {
    const userId = await createTestUser();
    const input = { ...testUpdateInput, user_id: userId };

    await updateUser(input);

    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].username).toEqual('updateduser');
    expect(users[0].email).toEqual('updated@example.com');
    expect(users[0].full_name).toEqual('Updated User');
    expect(users[0].role).toEqual('doctor');
    expect(users[0].is_active).toEqual(false);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    const userId = await createTestUser();
    const partialInput: UpdateUserInput = {
      user_id: userId,
      username: 'partialupdateuser',
      email: 'partialupdate@example.com',
    };

    const result = await updateUser(partialInput);

    expect(result.username).toEqual('partialupdateuser');
    expect(result.email).toEqual('partialupdate@example.com');
    expect(result.full_name).toEqual('Test User'); // Should remain unchanged
    expect(result.role).toEqual('admin'); // Should remain unchanged
    expect(result.is_active).toEqual(true); // Should remain unchanged
  });

  it('should hash password when updating', async () => {
    const userId = await createTestUser();
    const input: UpdateUserInput = {
      user_id: userId,
      password: 'newsecurepassword',
    };

    const result = await updateUser(input);

    // Verify password is hashed (simple check for our basic implementation)
    expect(result.password_hash).toBeDefined();
    expect(result.password_hash).not.toEqual('newsecurepassword');
    expect(result.password_hash).toEqual('hashed_newsecurepassword');
  });

  it('should throw error when user does not exist', async () => {
    const input: UpdateUserInput = {
      user_id: 999999, // Non-existent user ID
      username: 'nonexistent',
    };

    expect(updateUser(input)).rejects.toThrow(/User not found/i);
  });

  it('should update timestamp correctly', async () => {
    const userId = await createTestUser();
    
    // Get original timestamp
    const originalUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();
    
    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const input: UpdateUserInput = {
      user_id: userId,
      username: 'timestamptest',
    };

    const result = await updateUser(input);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUser[0].updated_at.getTime());
  });

  it('should handle role updates correctly', async () => {
    const userId = await createTestUser();
    const roles = ['doctor', 'nurse', 'receptionist'] as const;
    
    for (const role of roles) {
      const input: UpdateUserInput = {
        user_id: userId,
        role: role,
      };

      const result = await updateUser(input);
      expect(result.role).toEqual(role);
    }
  });
});
